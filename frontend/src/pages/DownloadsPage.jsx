import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Package } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import ProfileSidebar from '../components/ProfileSidebar';
import Footer from '../components/Footer';
import api from '../utils/api';

const formatInr = (amount) => `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`;

const DownloadsPage = () => {
  const { user, getAuthHeader } = useContext(AuthContext);
  const navigate = useNavigate();
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchDownloads = async () => {
      try {
        const { data } = await api.get('/api/orders/downloads', getAuthHeader());
        setDownloads(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        console.error('Could not load downloads:', fetchError);
        setError('Could not load your downloads right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, [getAuthHeader, navigate, user]);

  if (!user) return null;

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div className="container" style={{ padding: '1.5rem 1rem' }}>
        <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '16px', alignItems: 'start' }}>
          <ProfileSidebar />

          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', minWidth: 0 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Download size={18} color="var(--primary)" /> My Downloads
            </h2>

            {loading ? (
              <p style={{ color: 'var(--text-muted)' }}>Loading your purchased files...</p>
            ) : error ? (
              <p style={{ color: 'var(--danger)' }}>{error}</p>
            ) : downloads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <Package size={48} style={{ opacity: 0.25, marginBottom: '1rem' }} />
                <h3 style={{ marginBottom: '0.5rem' }}>No downloads yet</h3>
                <p style={{ color: 'var(--text-muted)' }}>Once you complete a purchase, your files will appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                {downloads.map((item, index) => (
                  <div key={`${item.orderId}-${item.productId || index}`} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--bg-card)', boxShadow: 'var(--shadow-xs)' }}>
                    <div style={{ height: 140, background: '#f5f5f5' }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(event) => {
                          event.target.onerror = null;
                          event.target.src = `https://placehold.co/300x160/072654/fff?text=${encodeURIComponent((item.name || 'DH').slice(0, 12))}`;
                        }}
                      />
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.35rem' }}>{item.name}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                        Purchased on {new Date(item.purchasedAt).toLocaleDateString('en-IN')}
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '1rem' }}>
                        {formatInr(item.price)} · Qty {item.qty}
                      </p>
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'inline-flex', width: '100%', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', background: 'var(--cta)', color: '#fff', padding: '0.7rem', borderRadius: 'var(--radius-md)', fontWeight: 700 }}
                      >
                        <Download size={15} /> Download File
                      </a>
                    </div>
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

export default DownloadsPage;
