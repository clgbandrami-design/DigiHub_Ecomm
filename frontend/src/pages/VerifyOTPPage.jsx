import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, verifyEmail, resendOTP } = useContext(AuthContext);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const email = searchParams.get('email');

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
    if (!email) {
      navigate('/register');
    }
  }, [user, navigate, email]);

  const handleResend = async () => {
    if (!canResend) return;
    try {
      await resendOTP(email);
      setTimer(60);
      setCanResend(false);
      setError('');
      alert('OTP resent successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await verifyEmail(email, otp);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="form-container" style={{ maxWidth: 400, width: '90%' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>Verify Email</h2>
          <p style={{ marginBottom: '2rem', opacity: 0.65, fontSize: '0.9rem', textAlign: 'center' }}>
            We've sent a 6-digit code to <strong>{email}</strong>. Please enter it below to verify your account.
          </p>

          {error && (
            <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(229,66,77,0.2)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: 'var(--danger)', fontSize: 'var(--fs-sm)', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ textAlign: 'center' }}>
              <label style={{ display: 'block', marginBottom: '1rem' }}>Enter 6-Digit OTP</label>
              <input
                type="text"
                maxLength="6"
                placeholder="000000"
                value={otp}
                onChange={e => {
                  setOtp(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                style={{
                  fontSize: '1.5rem',
                  letterSpacing: '8px',
                  textAlign: 'center',
                  padding: '10px',
                  width: '100%',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)'
                }}
                required
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1.5rem', height: 45, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
            Didn't receive the code? {canResend ? (
              <button type="button" onClick={handleResend} style={{ background: 'none', border: 'none', color: 'var(--cta)', cursor: 'pointer', padding: 0, fontSize: 'inherit', fontWeight: 700, fontFamily: 'var(--font)' }}>Resend</button>
            ) : (
              <span style={{ fontWeight: 600 }}>Resend in {timer}s</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
