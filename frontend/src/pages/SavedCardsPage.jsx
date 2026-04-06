import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ProfileSidebar from '../components/ProfileSidebar';
import Footer from '../components/Footer';
import { CreditCard, Plus, Trash2, Lock } from 'lucide-react';

const SavedCardsPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ number: '', name: '', expiry: '', type: 'Visa' });

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    const last4 = form.number.replace(/\s/g, '').slice(-4);
    setCards(prev => [...prev, { ...form, last4, id: Date.now() }]);
    setShowForm(false);
    setForm({ number: '', name: '', expiry: '', type: 'Visa' });
  };

  const formatCardNumber = (val) => {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val) => {
    const v = val.replace(/\D/g, '').slice(0, 4);
    return v.length >= 3 ? v.slice(0, 2) + '/' + v.slice(2) : v;
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', fontSize: 'var(--fs-base)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', outline: 'none', background: 'var(--bg-input)', fontFamily: 'var(--font)',
  };
  const labelStyle = { display: 'block', marginBottom: '6px', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', fontWeight: 600 };

  const cardGradients = {
    Visa: 'linear-gradient(135deg, #072654 0%, #0d3b7a 100%)',
    Mastercard: 'linear-gradient(135deg, #eb5757 0%, #000 100%)',
    RuPay: 'linear-gradient(135deg, #528ff0 0%, #072654 100%)',
  };

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div className="container" style={{ padding: '1.5rem 1rem' }}>
        <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '16px', alignItems: 'start' }}>
          <ProfileSidebar />

          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Saved Cards</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: '1px dashed var(--primary)', color: 'var(--primary)', padding: '0.4rem 0.9rem', borderRadius: '3px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
              >
                <Plus size={15} /> Add New Card
              </button>
            </div>

            {/* Security notice */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#f0f9f0', border: '1px solid #c8e6c9', borderRadius: '4px', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#388e3c' }}>
              <Lock size={14} /> Your card details are encrypted and stored securely. We never store full card numbers.
            </div>

            {/* Add Card Form */}
            {showForm && (
              <form onSubmit={handleAdd} style={{ marginBottom: '1.5rem', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '1.5rem', background: '#f9f9f9' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', color: '#333' }}>Add New Card</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Card Type</label>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {['Visa', 'Mastercard', 'RuPay'].map(t => (
                        <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                          style={{ padding: '0.35rem 1rem', borderRadius: '3px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', border: form.type === t ? '2px solid var(--primary)' : '1px solid #ccc', background: form.type === t ? '#e8f0fe' : '#fff', color: form.type === t ? 'var(--primary)' : '#555' }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Card Number *</label>
                    <input style={inputStyle} required placeholder="0000 0000 0000 0000" value={form.number}
                      onChange={e => setForm(f => ({ ...f, number: formatCardNumber(e.target.value) }))} maxLength={19} />
                  </div>
                  <div>
                    <label style={labelStyle}>Name on Card *</label>
                    <input style={inputStyle} required placeholder="As printed on card" value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Expiry Date *</label>
                      <input style={inputStyle} required placeholder="MM/YY" value={form.expiry}
                        onChange={e => setForm(f => ({ ...f, expiry: formatExpiry(e.target.value) }))} maxLength={5} />
                    </div>
                    <div>
                      <label style={labelStyle}>CVV *</label>
                      <input style={inputStyle} required type="password" placeholder="•••" maxLength={4} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button type="submit" className="btn-primary" style={{ padding: '0.55rem 1.5rem', fontSize: '0.875rem' }}>Save Card</button>
                  <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.55rem 1.25rem', fontSize: '0.875rem', background: 'none', border: '1px solid #ccc', borderRadius: '3px', cursor: 'pointer', color: '#555' }}>Cancel</button>
                </div>
              </form>
            )}

            {/* Card List */}
            {cards.length === 0 && !showForm ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#878787' }}>
                <CreditCard size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p style={{ fontSize: '0.9rem' }}>No saved cards yet.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1rem' }}>
                {cards.map(card => (
                  <div key={card.id} style={{ background: cardGradients[card.type] || cardGradients.Visa, borderRadius: '12px', padding: '1.25rem 1.5rem', color: '#fff', position: 'relative', minHeight: 140 }}>
                    <div style={{ fontSize: '0.72rem', opacity: 0.7, marginBottom: '0.5rem', letterSpacing: '0.05em' }}>{card.type}</div>
                    <div style={{ fontSize: '1.1rem', letterSpacing: '0.2em', fontFamily: 'monospace', marginBottom: '1rem' }}>
                      •••• •••• •••• {card.last4}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.6, marginBottom: '2px' }}>CARD HOLDER</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>{card.name}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.6, marginBottom: '2px' }}>EXPIRES</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{card.expiry}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setCards(prev => prev.filter(c => c.id !== card.id))}
                      style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SavedCardsPage;
