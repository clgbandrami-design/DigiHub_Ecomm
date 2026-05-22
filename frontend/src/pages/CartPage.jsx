import React, { useContext, useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2, MapPin, Plus, Home, Briefcase, CheckCircle,
  Lock, ShieldCheck, AlertCircle,
} from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Footer from '../components/Footer';
import api from '../utils/api';

/* ─── Constants ─────────────────────────────────── */
const STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Delhi', 'Goa', 
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 
  'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const emptyForm = { type: 'Home', name: '', mobile: '', pincode: '', address: '', city: '', state: '' };

// Steps: 0=Cart, 1=Billing Address, 2=Payment, 3=Success
const STEP_LABELS = ['Cart', 'Billing Address', 'Payment', 'Confirmed'];

// Price in INR — items from DB are in USD
const toINR = (item) => item.inr ? item.price : Math.round(item.price * 83);

/* ─── LocalStorage helpers for addresses ────────── */
const ADDR_STORAGE_KEY = 'dh_billing_addresses';
const SELECTED_ADDR_KEY = 'dh_selected_address_id';

const loadSavedAddresses = () => {
  try {
    const saved = localStorage.getItem(ADDR_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

const loadSelectedAddrId = () => {
  try {
    return localStorage.getItem(SELECTED_ADDR_KEY) || null;
  } catch { return null; }
};

/* ─── Load Razorpay script dynamically ──────────── */
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/* ─── CartPage ──────────────────────────────────── */
const CartPage = () => {
  const { cartItems, removeFromCart, updateQty, clearCart } = useContext(CartContext);
  const { user, getAuthHeader } = useContext(AuthContext);
  const toast = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);

  // ── Persist addresses in localStorage ──
  const [addresses, setAddresses] = useState(() => loadSavedAddresses());
  const [selectedAddr, setSelectedAddr] = useState(() => {
    const saved = loadSavedAddresses();
    const savedId = loadSelectedAddrId();
    if (savedId && saved.length) {
      return saved.find(a => String(a.id) === savedId) || saved[0] || null;
    }
    return saved[0] || null;
  });
  const [showAddForm, setShowAddForm] = useState(false);

  // Sync addresses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(ADDR_STORAGE_KEY, JSON.stringify(addresses));
  }, [addresses]);

  // Sync selected address id to localStorage
  useEffect(() => {
    if (selectedAddr?.id) {
      localStorage.setItem(SELECTED_ADDR_KEY, String(selectedAddr.id));
    }
  }, [selectedAddr]);
  const [form, setForm] = useState(emptyForm);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');

  // Payment state
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState('');
  const [ordered, setOrdered] = useState(false);
  const [paidOrderId, setPaidOrderId] = useState('');

  /* ─── Calculations ──── */
  const subtotal = cartItems.reduce((a, i) => a + i.qty * toINR(i), 0);
  const platformFee = cartItems.length > 0 ? 25 : 0;
  const total = subtotal + platformFee;

  // Helper to convert ALL CAPS state name from DB to Title Case to match dropdown
  const toTitleCase = (str) => {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  };

  const fetchPincode = async (pin) => {
    if (pin.length !== 6) return;
    setPincodeLoading(true);
    setPincodeError('');
    try {
      const { data } = await api.get(`/api/pincode/${pin}`);
      if (data && data.city && data.state) {
        setForm(f => ({ ...f, city: data.city, state: toTitleCase(data.state) }));
      } else {
        setPincodeError('Invalid pincode.');
      }
    } catch { setPincodeError('Could not fetch pincode.'); }
    finally { setPincodeLoading(false); }
  };

  /* ─── Address handlers ──── */
  const handleAddAddress = (e) => {
    e.preventDefault();
    const addr = { ...form, id: Date.now() };
    setAddresses(prev => [...prev, addr]);
    setSelectedAddr(addr);
    setShowAddForm(false);
    setForm(emptyForm);
  };

  const goToAddress = () => {
    if (!user) { navigate('/login?redirect=cart'); return; }
    setStep(1); window.scrollTo(0, 0);
  };

  const goToPayment = () => {
    if (!selectedAddr) { alert('Please select or add a billing address.'); return; }
    setStep(2); window.scrollTo(0, 0);
  };

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     RAZORPAY PAYMENT FLOW
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const handleRazorpayPayment = useCallback(async () => {
    setPayLoading(true);
    setPayError('');

    try {
      // 1. Load Razorpay checkout script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setPayError('Failed to load Razorpay SDK. Check your internet connection.');
        setPayLoading(false);
        return;
      }

      // 2. Get Razorpay public key from backend
      const { data: keyData } = await api.get('/api/payment/key');

      // 3. Create order on backend
      const orderPayload = {
        items: cartItems.map(item => ({
          _id: item._id,
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: toINR(item) * item.qty,
        })),
        totalAmount: total,
      };

      const { data: orderData } = await api.post(
        '/api/payment/create-order',
        orderPayload,
        getAuthHeader()
      );

      // 4. Configure Razorpay checkout popup
      const options = {
        key: keyData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'DigiHub Marketplace',
        description: `Secure Digital Asset Download • Order #${orderData.orderId.slice(-8).toUpperCase()}`,
        order_id: orderData.razorpay_order_id,
        image: 'https://cdn-icons-png.flaticon.com/512/3176/3176366.png', // Adds a premium logo to the popup

        // ── Success handler ──
        handler: async function (response) {
          try {
            // 5. Verify payment on backend
            const { data: verifyData } = await api.post(
              '/api/payment/verify',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              getAuthHeader()
            );

            if (verifyData.success) {
              // Payment verified!
              clearCart();
              setPaidOrderId(verifyData.orderId);
              setOrdered(true);
              setStep(3);
              window.scrollTo(0, 0);
              toast.success('Payment successful! 🎉');
            } else {
              setPayError('Payment verification failed. Please contact support.');
              toast.error('Payment verification failed');
            }
          } catch (err) {
            console.error('Verify error:', err);
            setPayError('Payment was processed but verification failed. Please contact support if money was deducted.');
            toast.error('Verification error — contact support');
          }
          setPayLoading(false);
        },

        // ── User dismissed popup ──
        modal: {
          ondismiss: function () {
            setPayLoading(false);
            toast.warning('Payment cancelled');
          },
        },

        // ── Prefill user details ──
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '9999999999', // Added fallback so the user isn't prompted to type it manually
        },

        // ── Theme ──
        theme: {
          color: '#fb641b', // Switched to DigiHub's vibrant orange primary color for the payment button
        },

        notes: {
          address: selectedAddr
            ? `${selectedAddr.address}, ${selectedAddr.city}, ${selectedAddr.state} - ${selectedAddr.pincode}`
            : '',
        },
      };

      const rzp = new window.Razorpay(options);

      // ── Handle payment failure inside popup ──
      rzp.on('payment.failed', function (response) {
        setPayError(
          response.error?.description ||
          'Payment failed. Please try again.'
        );
        toast.error('Payment failed');
        setPayLoading(false);
      });

      rzp.open();
    } catch (err) {
      console.error('Payment flow error:', err);
      setPayError(
        err.response?.data?.message ||
        'Something went wrong. Please try again.'
      );
      setPayLoading(false);
    }
  }, [cartItems, total, user, getAuthHeader, clearCart, selectedAddr, toast]);

  /* ─── Styles ──── */
  const inputSt = {
    width: '100%', padding: '11px 14px', fontSize: 'var(--fs-base)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', outline: 'none', fontFamily: 'var(--font)',
    background: 'var(--bg-input)', color: 'var(--text-body)', transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  const labelSt = { display: 'block', marginBottom: '6px', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', fontWeight: 600 };

  /* ─── Step Bar ──── */
  const StepBar = () => (
    <div className="step-bar" style={{ display: 'flex', alignItems: 'center', marginBottom: '1.25rem', background: 'var(--bg-card)', padding: '0.85rem 1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
      {STEP_LABELS.map((label, i) => (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: step >= i ? 1 : 0.35 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step > i ? 'var(--success)' : step === i ? 'var(--cta)' : 'var(--border)',
              color: '#fff', fontSize: '0.68rem', fontWeight: 700,
            }}>
              {step > i ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: 'var(--fs-sm)', fontWeight: step === i ? 700 : 400, color: step === i ? 'var(--cta)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div style={{ flex: 1, height: 2, background: step > i ? 'var(--success)' : 'var(--border)', margin: '0 0.5rem', minWidth: 16 }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  /* ─── Price Summary Panel ──── */
  const PriceSummary = ({ showProceed, proceedLabel, onProceed, proceedDisabled }) => (
    <div style={{ background: '#fff', borderRadius: 4, boxShadow: 'var(--shadow-sm)', padding: '1.25rem', position: 'sticky', top: '5rem' }}>
      <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#878787', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>
        Price Details
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Price ({cartItems.reduce((a, i) => a + i.qty, 0)} items)</span>
          <span>₹{subtotal.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
          <span>Platform Fee</span>
          <span>₹{platformFee}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#388e3c', fontWeight: 600 }}>
          <span>Delivery</span>
          <span>FREE</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem', borderTop: '1px dashed #e0e0e0', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
          <span>Total Amount</span>
          <span>₹{total.toLocaleString()}</span>
        </div>
      </div>
      <p style={{ fontSize: '0.72rem', color: '#388e3c', display: 'flex', alignItems: 'center', gap: 4, marginTop: '0.85rem' }}>
        <ShieldCheck size={12} /> Secure &amp; Encrypted Payment
      </p>
      {showProceed && (
        <button
          onClick={onProceed}
          disabled={proceedDisabled}
          style={{
            width: '100%', marginTop: '1rem', background: proceedDisabled ? '#ccc' : '#fb641b',
            color: '#fff', border: 'none', padding: '0.8rem', fontWeight: 700, fontSize: '0.9rem',
            cursor: proceedDisabled ? 'not-allowed' : 'pointer', borderRadius: 3,
          }}
        >
          {proceedLabel}
        </button>
      )}
    </div>
  );

  /* ─── Step 3: Success ──── */
  if (ordered) {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
        <div className="container" style={{ padding: '2rem 1rem' }}>
          <StepBar />
          <div style={{ background: '#fff', borderRadius: 8, padding: '3rem', maxWidth: 540, margin: '0 auto', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
            <div style={{ width: 70, height: 70, background: '#e8f5e9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <CheckCircle size={40} color="#388e3c" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.4rem' }}>Payment Successful!</h2>
            <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Order ID: <strong style={{ color: 'var(--primary)' }}>#{paidOrderId?.slice(-8).toUpperCase()}</strong>
            </p>
            <p style={{ color: '#555', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              Your digital assets are now available for download in your{' '}
              <Link to="/orders" style={{ color: 'var(--primary)', fontWeight: 600 }}>Orders</Link> page.
              A confirmation has been sent to <strong>{user?.email}</strong>.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-primary" style={{ padding: '0.7rem 2rem' }} onClick={() => navigate('/')}>Continue Shopping</button>
              <button style={{ padding: '0.7rem 2rem', border: '1px solid var(--primary)', borderRadius: 3, background: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/orders')}>
                My Orders
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div className="container" style={{ padding: '1.5rem 1rem' }}>
        <StepBar />

        <div className="cart-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: '1rem', alignItems: 'start' }}>

          {/* ══ LEFT PANEL ══════════════════════════════════ */}
          <div>

            {/* ─── STEP 0: Cart Items ─── */}
            {step === 0 && (
              <div style={{ background: '#fff', borderRadius: 4, boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>My Cart ({cartItems.reduce((a, i) => a + i.qty, 0)} items)</h2>
                </div>

                {cartItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <img src="https://rukminim2.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a6-520b560971e8.png?q=90" alt="Empty cart" style={{ width: 150, opacity: 0.6 }} />
                    <h3 style={{ marginTop: '1rem', fontSize: '1rem' }}>Your cart is empty!</h3>
                    <p style={{ color: '#878787', fontSize: '0.875rem', marginTop: '0.4rem' }}>Add items to get started.</p>
                    <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '1.25rem', padding: '0.65rem 2.5rem' }}>Shop Now</button>
                  </div>
                ) : (
                  <>
                    {cartItems.map(item => (
                      <div key={item._id} className="cart-item-row" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                        <div className="cart-item-image" style={{ width: 90, height: 90, flexShrink: 0, background: '#f5f5f5', borderRadius: 4, overflow: 'hidden' }}>
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { e.target.onerror = null; e.target.src = `https://placehold.co/90x90/2874f0/fff?text=${encodeURIComponent((item.name || 'DH').slice(0, 2))}`; }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem', color: '#212121' }}>{item.name}</p>
                          <p style={{ fontSize: '0.78rem', color: '#878787', marginBottom: '0.5rem' }}>{item.category || 'Digital Asset'} · Instant Download</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: '1rem' }}>₹{(toINR(item) * item.qty).toLocaleString()}</span>
                            {item.qty > 1 && <span style={{ fontSize: '0.75rem', color: '#888' }}>(₹{toINR(item).toLocaleString()} × {item.qty})</span>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: 4, overflow: 'hidden' }}>
                              <button onClick={() => updateQty(item._id, item.qty - 1)} style={{ width: 28, height: 28, border: 'none', background: '#f5f5f5', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                              <span style={{ minWidth: 28, textAlign: 'center', fontSize: '0.875rem', fontWeight: 600 }}>{item.qty}</span>
                              <button onClick={() => updateQty(item._id, item.qty + 1)} style={{ width: 28, height: 28, border: 'none', background: '#f5f5f5', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                            </div>
                            <button onClick={() => removeFromCart(item._id)} style={{ background: 'none', border: 'none', fontWeight: 700, fontSize: '0.75rem', color: '#d32f2f', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Trash2 size={13} /> REMOVE
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f0f0f0' }}>
                      <button onClick={goToAddress} style={{ background: '#fb641b', color: '#fff', border: 'none', padding: '0.85rem 3rem', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', borderRadius: 3 }}>
                        PROCEED TO CHECKOUT
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ─── STEP 1: Billing Address ─── */}
            {step === 1 && (
              <div style={{ background: '#fff', borderRadius: 4, boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={16} color="var(--primary)" /> Billing Address</h2>
                  <button onClick={() => setStep(0)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>← Back to Cart</button>
                </div>

                <div style={{ padding: '1.25rem 1.5rem' }}>
                  <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>
                    This address will be used for your tax invoice. No physical delivery — all products are digital.
                  </p>

                  {/* Saved addresses */}
                  {addresses.map(addr => (
                    <div key={addr.id} onClick={() => setSelectedAddr(addr)}
                      style={{ border: selectedAddr?.id === addr.id ? '2px solid var(--primary)' : '1px solid #e0e0e0', borderRadius: 6, padding: '0.85rem 1rem', marginBottom: '0.75rem', cursor: 'pointer', background: selectedAddr?.id === addr.id ? '#f0f6ff' : '#fff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, background: selectedAddr?.id === addr.id ? 'var(--primary)' : '#e0e0e0', color: selectedAddr?.id === addr.id ? '#fff' : '#333', padding: '1px 7px', borderRadius: 3 }}>{addr.type}</span>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{addr.name}</span>
                        <span style={{ color: '#666', fontSize: '0.8rem' }}>· {addr.mobile}</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#555' }}>{addr.address}, {addr.city}, {addr.state} – {addr.pincode}</p>
                    </div>
                  ))}

                  {/* Add new form */}
                  {!showAddForm ? (
                    <button onClick={() => setShowAddForm(true)}
                      style={{ width: '100%', border: '1.5px dashed var(--primary)', borderRadius: 6, padding: '0.65rem', background: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: addresses.length ? '0.25rem' : 0 }}>
                      <Plus size={15} /> Add New Billing Address
                    </button>
                  ) : (
                    <form onSubmit={handleAddAddress} style={{ border: '1px solid #e0e0e0', borderRadius: 6, padding: '1.25rem', background: '#fafafa', marginTop: '0.75rem' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '1rem' }}>New Billing Address</p>

                      {/* Address type */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        {['Home', 'Work', 'Other'].map(t => (
                          <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.3rem 0.85rem', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: form.type === t ? '2px solid var(--primary)' : '1px solid #ccc', background: form.type === t ? '#e8f0fe' : '#fff', color: form.type === t ? 'var(--primary)' : '#555' }}>
                            {t === 'Home' ? <Home size={11} /> : t === 'Work' ? <Briefcase size={11} /> : <MapPin size={11} />} {t}
                          </button>
                        ))}
                      </div>

                      <div className="mobile-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div><label style={labelSt}>Full Name *</label><input style={inputSt} required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" /></div>
                        <div><label style={labelSt}>Mobile *</label><input style={inputSt} required type="tel" maxLength={10} value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))} placeholder="10-digit number" /></div>
                        <div>
                          <label style={labelSt}>Pincode *</label>
                          <input style={inputSt} required maxLength={6} value={form.pincode}
                            onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 6); setForm(f => ({ ...f, pincode: v })); if (v.length === 6) fetchPincode(v); }}
                            placeholder="6-digit pincode" />
                          {pincodeLoading && <span style={{ fontSize: '0.7rem', color: '#666' }}>🔍 Fetching…</span>}
                          {pincodeError && <span style={{ fontSize: '0.7rem', color: '#d32f2f' }}>{pincodeError}</span>}
                        </div>
                        <div><label style={labelSt}>City *</label><input style={{ ...inputSt, background: pincodeLoading ? '#f5f5f5' : '#fff' }} required value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder={pincodeLoading ? 'Auto-filling…' : 'City'} /></div>
                        <div style={{ gridColumn: 'span 2' }}><label style={labelSt}>Address *</label><textarea rows={2} style={{ ...inputSt, resize: 'vertical' }} required value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Flat No, Building, Street, Locality" /></div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={labelSt}>State *</label>
                          <select style={inputSt} required value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}>
                            <option value="">Select State</option>
                            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.7rem' }}>Save & Use This Address</button>
                        <button type="button" onClick={() => setShowAddForm(false)} style={{ padding: '0.7rem 1.25rem', border: '1px solid #ddd', borderRadius: 3, background: 'none', cursor: 'pointer', fontWeight: 600, color: '#555' }}>Cancel</button>
                      </div>
                    </form>
                  )}

                  {selectedAddr && (
                    <button onClick={goToPayment}
                      style={{ width: '100%', marginTop: '1.25rem', background: '#fb641b', color: '#fff', border: 'none', padding: '0.85rem', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', borderRadius: 3 }}>
                      CONTINUE TO PAYMENT
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ─── STEP 2: Payment (Razorpay) ─── */}
            {step === 2 && (
              <div style={{ background: '#fff', borderRadius: 4, boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><Lock size={16} color="var(--primary)" /> Secure Payment</h2>
                  <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>← Back</button>
                </div>

                <div style={{ padding: '1.25rem 1.5rem' }}>
                  {/* Razorpay branding banner */}
                  <div style={{ background: 'linear-gradient(135deg, #072654 0%, #1a3a6b 100%)', borderRadius: 8, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Lock size={14} color="#fff" />
                        <span style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 600 }}>256-bit SSL Encrypted</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ background: '#fff', color: '#072654', fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: 3 }}>razorpay</span>
                        <span style={{ color: '#aaa', fontSize: '0.65rem' }}>powered</span>
                      </div>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem', lineHeight: 1.5 }}>
                      Pay securely with UPI, Debit Card, Credit Card, Net Banking, or Wallets.
                      All payment methods handled via Razorpay's secure checkout.
                    </p>
                  </div>

                  {/* Payment methods info */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    {['🟢 UPI / GPay', '💳 Cards', '🏦 Net Banking', '📱 Wallets', '📑 EMI'].map(m => (
                      <span key={m} style={{ fontSize: '0.78rem', color: '#444', background: '#f5f5f5', padding: '0.4rem 0.75rem', borderRadius: 20, fontWeight: 600, border: '1px solid #e8e8e8' }}>
                        {m}
                      </span>
                    ))}
                  </div>

                  {/* Order summary mini */}
                  <div style={{ background: '#fafafa', borderRadius: 6, padding: '1rem', marginBottom: '1.5rem', border: '1px solid #f0f0f0' }}>
                    <p style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Order Summary</p>
                    {cartItems.map(item => (
                      <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                        <span style={{ color: '#333' }}>{item.name} × {item.qty}</span>
                        <span style={{ fontWeight: 600 }}>₹{(toINR(item) * item.qty).toLocaleString()}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px dashed #ddd', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem' }}>
                      <span>Total</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Error display */}
                  {payError && (
                    <div style={{ background: '#fff3f3', border: '1px solid #fcc', borderRadius: 5, padding: '0.7rem 1rem', color: '#d32f2f', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={16} /> {payError}
                    </div>
                  )}

                  {/* Pay button — opens Razorpay popup */}
                  <button
                    onClick={handleRazorpayPayment}
                    disabled={payLoading}
                    style={{
                      width: '100%', background: payLoading ? '#888' : 'var(--primary)',
                      color: '#fff', border: 'none', padding: '1rem', fontSize: '1rem', fontWeight: 700,
                      cursor: payLoading ? 'not-allowed' : 'pointer', borderRadius: 5,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'background 0.2s',
                    }}
                  >
                    {payLoading ? (
                      <>
                        <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                        Processing…
                      </>
                    ) : (
                      <>
                        <Lock size={16} /> Pay ₹{total.toLocaleString()} with Razorpay
                      </>
                    )}
                  </button>

                  <p style={{ fontSize: '0.72rem', color: '#888', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: '0.75rem' }}>
                    <ShieldCheck size={12} /> Your payment info is never stored on our servers
                  </p>
                </div>
              </div>
            )}

          </div>
          {/* ══ RIGHT PANEL (Price Summary) ══ */}
          <PriceSummary
            showProceed={step === 0 && cartItems.length > 0}
            proceedLabel="PROCEED TO CHECKOUT"
            onProceed={goToAddress}
          />
        </div>
      </div>
      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default CartPage;
