import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import ProfileSidebar from '../components/ProfileSidebar';
import Footer from '../components/Footer';
import { Package, Download, CheckCircle, Clock, ShoppingBag, XCircle, CreditCard } from 'lucide-react';

const STATUS_CONFIG = {
  paid: { bg: '#e8f5e9', color: '#2e7d32', icon: CheckCircle, label: 'Paid' },
  pending: { bg: '#fff8e1', color: '#f57f17', icon: Clock, label: 'Pending' },
  failed: { bg: '#ffebee', color: '#c62828', icon: XCircle, label: 'Failed' },
};

const OrdersPage = () => {
  const { user, getAuthHeader } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/api/orders/myorders', getAuthHeader());
        // Sort newest first
        setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (err) {
        if (err.response?.status !== 401) setError('Could not load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (!user) return null;

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div className="container" style={{ padding: '1.5rem 1rem' }}>
        <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '16px', alignItems: 'start' }}>
          <ProfileSidebar />

          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', minWidth: 0 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={18} color="var(--primary)" /> My Orders
            </h2>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ height: 90, background: '#f0f0f0', borderRadius: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))}
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#d32f2f', fontSize: '0.875rem' }}>{error}</div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <ShoppingBag size={52} style={{ opacity: 0.2, marginBottom: '1rem', color: '#333' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>No orders yet</h3>
                <p style={{ color: '#878787', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  Items you purchase will appear here. Start exploring digital products!
                </p>
                <Link to="/" className="btn-primary" style={{ padding: '0.65rem 2rem', display: 'inline-block', textDecoration: 'none' }}>
                  Browse Products
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.map(order => {
                  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG[order.isPaid ? 'paid' : 'pending'];
                  const StatusIcon = status.icon;

                  return (
                    <div key={order._id} style={{ border: '1px solid #e0e0e0', borderRadius: 6, overflow: 'hidden' }}>
                      {/* Order header */}
                      <div style={{ background: '#fafafa', padding: '0.75rem 1.25rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                          <div>
                            <p style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Order ID</p>
                            <p style={{ fontWeight: 700, fontSize: '0.82rem', color: '#212121' }}>#{order._id?.slice(-8).toUpperCase()}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date</p>
                            <p style={{ fontWeight: 600, fontSize: '0.82rem' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total</p>
                            <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>₹{order.totalPrice?.toLocaleString('en-IN')}</p>
                          </div>
                          {/* Payment method */}
                          <div>
                            <p style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Payment</p>
                            <p style={{ fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <CreditCard size={12} /> {order.paymentMethod === 'razorpay' ? 'Razorpay' : order.paymentMethod || '—'}
                            </p>
                          </div>
                        </div>
                        {/* Status badge */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          background: status.bg, color: status.color,
                          padding: '0.3rem 0.75rem', borderRadius: 20,
                          fontSize: '0.75rem', fontWeight: 700,
                        }}>
                          <StatusIcon size={13} />
                          {status.label}
                        </div>
                      </div>

                      {/* Order items */}
                      <div style={{ padding: '1rem 1.25rem' }}>
                        {order.orderItems?.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: idx < order.orderItems.length - 1 ? '0.75rem' : 0, marginBottom: idx < order.orderItems.length - 1 ? '0.75rem' : 0, borderBottom: idx < order.orderItems.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                            <div style={{ width: 50, height: 50, borderRadius: 4, overflow: 'hidden', background: '#f5f5f5', flexShrink: 0 }}>
                              <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={e => { e.target.onerror = null; e.target.src = `https://placehold.co/50x50/2874f0/fff?text=${encodeURIComponent((item.name || 'DH').slice(0, 2))}`; }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                              <p style={{ fontSize: '0.78rem', color: '#888' }}>Qty: {item.qty} · ₹{item.price?.toLocaleString('en-IN')}</p>
                            </div>
                            {(order.isPaid || order.status === 'paid') && (
                              <a href={item.fileUrl || '#'} target="_blank" rel="noreferrer"
                                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', background: '#e8f0fe', padding: '0.35rem 0.75rem', borderRadius: 4 }}>
                                <Download size={13} /> Download
                              </a>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Razorpay Payment ID (if paid) */}
                      {order.razorpay_payment_id && (
                        <div style={{ padding: '0.5rem 1.25rem 0.75rem', borderTop: '1px solid #f0f0f0' }}>
                          <p style={{ fontSize: '0.72rem', color: '#999' }}>
                            Payment ID: <span style={{ fontFamily: 'monospace', color: '#666' }}>{order.razorpay_payment_id}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
};

export default OrdersPage;
