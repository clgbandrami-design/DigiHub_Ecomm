import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Footer from '../components/Footer';
import { Store, CheckCircle, TrendingUp, ShieldCheck, Zap, DollarSign, ArrowRight } from 'lucide-react';

const PERKS = [
  { icon: <Store size={20} color="var(--primary)" />, title: 'List Unlimited Products', desc: 'Upload as many digital products as you want — no listing fees.' },
  { icon: <DollarSign size={20} color="#388e3c" />, title: 'Set Your Own Prices', desc: 'You control the pricing. Keep up to 80% of every sale.' },
  { icon: <TrendingUp size={20} color="#f57c00" />, title: 'Seller Analytics', desc: 'Track sales, views, and earnings with a clean dashboard.' },
  { icon: <Zap size={20} color="#7b1fa2" />, title: 'Instant Payouts', desc: 'Receive payments directly to your account within 48 hours.' },
  { icon: <ShieldCheck size={20} color="#0288d1" />, title: 'Fraud Protection', desc: 'We handle disputes and protect legitimate sellers automatically.' },
];

const BecomeSellerPage = () => {
  const { user, getAuthHeader, loginFromOAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState(user?.name ? `${user.name}'s Store` : '');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) navigate('/login');
    else if (user.isSeller) navigate('/seller/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.put('/api/seller/become-seller', { storeName, description }, getAuthHeader());
      loginFromOAuth({ ...user, ...data, token: user.token });
      navigate('/seller/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to become a seller. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* Hero banner */}
      <div style={{ background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 60%, #311b92 100%)', color: '#fff', padding: '3rem 1rem 4rem' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: '1rem', marginBottom: '1.25rem' }}>
            <Store size={36} color="#fff" />
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
            Become a DigiHub Seller
          </h1>
          <p style={{ fontSize: 'clamp(0.875rem, 2vw, 1.05rem)', opacity: 0.85, maxWidth: 520, margin: '0 auto' }}>
            Join thousands of creators earning passive income by selling digital assets on India's fastest-growing creative marketplace.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1rem', marginTop: '-2rem' }}>
        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>

          {/* Left: perks */}
          <div>
            {/* Stats bar */}
            <div style={{ background: '#fff', borderRadius: 8, boxShadow: 'var(--shadow-sm)', padding: '1.25rem', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
              {[['10K+', 'Sellers'], ['₹2Cr+', 'Paid Out'], ['4.8★', 'Avg Rating']].map(([val, lbl]) => (
                <div key={lbl}>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>{val}</div>
                  <div style={{ fontSize: '0.72rem', color: '#666', marginTop: 2 }}>{lbl}</div>
                </div>
              ))}
            </div>

            {/* Perk cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {PERKS.map(p => (
                <div key={p.title} style={{ background: '#fff', borderRadius: 8, padding: '1rem 1.25rem', boxShadow: 'var(--shadow-sm)', display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
                  <div style={{ flexShrink: 0, marginTop: 2 }}>{p.icon}</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.2rem' }}>{p.title}</p>
                    <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.5 }}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: registration form */}
          <div style={{ background: '#fff', borderRadius: 8, boxShadow: 'var(--shadow-md)', padding: 'clamp(1.25rem, 3vw, 2.25rem)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.4rem' }}>Set Up Your Store</h2>
            <p style={{ fontSize: '0.82rem', color: '#666', marginBottom: '1.5rem' }}>Takes less than 2 minutes. Free forever.</p>

            {error && (
              <div style={{ background: '#fff3f3', border: '1px solid #ffcccc', borderRadius: 6, padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#d32f2f', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.4rem', color: '#333' }}>Store Name *</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  placeholder="e.g. Creative Design Studio"
                  required
                  style={{ width: '100%', padding: '0.7rem 0.9rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.9rem', outline: 'none', transition: 'border 0.15s' }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = '#ddd'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.4rem', color: '#333' }}>What will you sell? (optional)</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. UI kits, icon packs, Figma templates, sound effects…"
                  rows={3}
                  style={{ width: '100%', padding: '0.7rem 0.9rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', transition: 'border 0.15s' }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = '#ddd'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? '#999' : 'var(--primary)', color: '#fff', border: 'none',
                  borderRadius: 6, padding: '0.875rem', fontSize: '0.95rem', fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  transition: 'background 0.2s',
                }}
              >
                {loading ? 'Setting Up…' : <><span>Start Selling Now</span> <ArrowRight size={16} /></>}
              </button>
            </form>

            <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '1rem', textAlign: 'center', lineHeight: 1.5 }}>
              By continuing, you agree to DigiHub's <Link to="/policy/terms" style={{ color: 'var(--primary)' }}>Seller Terms</Link> and <Link to="/policy/privacy" style={{ color: 'var(--primary)' }}>Privacy Policy</Link>.
            </p>

            <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: '#f0f9f0', borderRadius: 6, border: '1px solid #c8e6c9' }}>
              {[<><CheckCircle size={13} color="#388e3c" /> No listing fees ever</>, <><CheckCircle size={13} color="#388e3c" /> Approval within 48 hrs</>, <><CheckCircle size={13} color="#388e3c" /> Keep 80% of revenue</>].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#2e7d32', padding: '0.2rem 0' }}>{item}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BecomeSellerPage;
