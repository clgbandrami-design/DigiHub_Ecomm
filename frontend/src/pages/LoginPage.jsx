import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Download, Zap, Star, Eye, EyeOff } from 'lucide-react';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.4 7.1 28.9 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-4.9z"/>
    <path fill="#FF3D00" d="M6.3 15.1l6.6 4.8C14.5 16.7 19 14 24 14c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.4 7.1 28.9 5 24 5 16.3 5 9.7 9.1 6.3 15.1z"/>
    <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 36.3 26.8 37 24 37c-5.2 0-9.6-3.5-11.2-8.3l-6.5 5C9.5 40.8 16.2 45 24 45z"/>
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.5l6.2 5.2C37.1 38 44 33 44 25c0-1.3-.1-2.6-.4-4.9z"/>
  </svg>
);

const FEATURES = [
  { icon: <Download size={20} />, title: 'Instant Downloads', desc: 'Get your digital assets immediately after purchase' },
  { icon: <ShieldCheck size={20} />, title: 'Commercial License', desc: 'Use assets in personal and commercial projects' },
  { icon: <Zap size={20} />, title: 'Premium Quality', desc: 'Curated by professional designers worldwide' },
  { icon: <Star size={20} />, title: 'Free Updates', desc: 'Lifetime updates for all purchased products' },
];

const STATS = [
  { value: '10K+', label: 'Digital Products' },
  { value: '50K+', label: 'Happy Customers' },
  { value: '4.8★', label: 'Average Rating' },
];

const inputStyle = {
  width: '100%', padding: '11px 16px', borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)', outline: 'none',
  fontSize: 'var(--fs-base)', background: 'var(--bg-input)', color: 'var(--text-body)',
  transition: 'border-color 0.2s, box-shadow 0.2s', fontFamily: 'var(--font)',
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user, login, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user) navigate('/');
    if (searchParams.get('error') === 'oauth_failed') setError('Google sign-in failed. Please try again.');
  }, [user, navigate, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', overflow: 'hidden' }}>

      {/* Left Panel */}
      <div className="login-left-panel" style={{
        flex: '0 0 45%', background: 'linear-gradient(135deg, #072654 0%, #0d3b7a 50%, #1b5ec0 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem 3.5rem',
        color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', top: -80, left: -60 }} />
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', bottom: -40, right: -30 }} />

        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, fontStyle: 'italic', color: '#fff', marginBottom: '0.5rem' }}>DigiHub</h1>
        </Link>
        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          Your premium marketplace for digital assets, templates, and creative resources.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', padding: '0.5rem', color: '#6da3f8', flexShrink: 0 }}>
                {f.icon}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 'var(--fs-base)', color: '#fff', marginBottom: '0.1rem' }}>{f.title}</p>
                <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
          {STATS.map((s, i) => (
            <div key={i}>
              <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f5a623' }}>{s.value}</p>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-page)', padding: '1rem 1.5rem', overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          <div className="login-mobile-logo" style={{ display: 'none', textAlign: 'center', marginBottom: '0.75rem' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, fontStyle: 'italic', color: 'var(--text-heading)' }}>DigiHub</h1>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Premium Digital Assets</p>
          </div>

          <h2 style={{ fontSize: 'var(--fs-2xl)', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--text-heading)' }}>Welcome back</h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: 'var(--fs-base)' }}>Sign in to your DigiHub account</p>

          {error && (
            <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(229,66,77,0.2)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '1.25rem', color: 'var(--danger)', fontSize: 'var(--fs-sm)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Email Address</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.boxShadow = '0 0 0 3px rgba(82,143,240,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required
                  style={{ ...inputStyle, paddingRight: '2.5rem' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.boxShadow = '0 0 0 3px rgba(82,143,240,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: 'var(--fs-md)', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.25rem 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <button onClick={loginWithGoogle}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
              padding: '10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'transparent',
              cursor: 'pointer', fontSize: 'var(--fs-base)', fontWeight: 500, color: 'var(--text-body)',
              transition: 'box-shadow 0.2s, border-color 0.2s', fontFamily: 'var(--font)',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--cta)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <GoogleIcon /> Continue with Google
          </button>

          <p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: 'var(--fs-base)', color: 'var(--text-muted)' }}>
            New to DigiHub?{' '}
            <Link to="/register" style={{ color: 'var(--cta)', fontWeight: 700, textDecoration: 'none' }}>Create an account</Link>
          </p>

          <div className="login-mobile-features" style={{ display: 'none', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
              {FEATURES.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--cta)', flexShrink: 0 }}>{f.icon}</span>
                  <span>{f.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .login-left-panel { display: none !important; }
          .login-mobile-logo { display: block !important; }
          .login-mobile-features { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
