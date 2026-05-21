import React, { useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const { loginFromOAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const userParam = searchParams.get('user');
    if (!userParam) {
      navigate('/login?error=oauth_failed');
      return;
    }

    try {
      const userData = JSON.parse(decodeURIComponent(userParam));
      loginFromOAuth(userData);
      navigate('/');
    } catch (error) {
      console.error('OAuth callback parsing failed:', error);
      navigate('/login?error=oauth_failed');
    }
  }, [loginFromOAuth, navigate, searchParams]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: 48, height: 48, border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--text-muted)' }}>Completing sign in...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default OAuthCallbackPage;
