import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ProfileSidebar from '../components/ProfileSidebar';
import Footer from '../components/Footer';
import api from '../utils/api';

const ProfilePage = () => {
  const { user, deleteAccount, getAuthHeader } = useContext(AuthContext);
  const navigate = useNavigate();
  const [downloads, setDownloads] = useState([]);
  const [editing, setEditing] = useState(false);

  const { firstName, lastName } = useMemo(() => {
    const parts = user?.name?.split(' ') || [];
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
    };
  }, [user?.name]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchDownloads = async () => {
      try {
        const { data } = await api.get('/api/orders/downloads', getAuthHeader());
        setDownloads(Array.isArray(data) ? data.slice(0, 4) : []);
      } catch (error) {
        console.error('Could not load profile downloads:', error);
        setDownloads([]);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
              <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, color: 'var(--text-heading)' }}>Personal Information</h2>
              <button
                onClick={() => setEditing((prev) => !prev)}
                style={{ background: 'none', border: '1px solid var(--cta)', color: 'var(--cta)', padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 'var(--fs-sm)', fontWeight: 600, fontFamily: 'var(--font)' }}
              >
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="mobile-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', maxWidth: 560 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>First Name</label>
                <input type="text" value={firstName} readOnly style={{ background: editing ? '#fff' : '#fafafa' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Last Name</label>
                <input type="text" value={lastName} readOnly style={{ background: editing ? '#fff' : '#fafafa' }} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                <label>Email Address</label>
                <input type="text" readOnly value={user.email} style={{ background: '#fafafa' }} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                <label>Mobile Number</label>
                <input type="tel" placeholder="Add mobile number" readOnly value={user.phone || ''} style={{ background: '#fafafa' }} />
              </div>
            </div>

            {editing && (
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Profile editing is a planned next step. For now, this page reflects your account details and downloads.
              </p>
            )}

            <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />

            <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-heading)' }}>Recent Downloads</h2>
            {downloads.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-base)' }}>No items purchased yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                {downloads.map((item, index) => (
                  <a
                    key={`${item.orderId}-${item.productId || index}`}
                    href={item.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="card"
                    style={{ border: '1px solid #f0f0f0', textDecoration: 'none', color: 'inherit' }}
                  >
                    <img src={item.image} alt={item.name} style={{ height: '100px' }} />
                    <h4 style={{ fontSize: '0.78rem', margin: '0.5rem 0' }}>{item.name}</h4>
                    <span className="btn-primary" style={{ width: '100%', fontSize: '0.72rem', padding: '0.4rem', display: 'inline-block', textAlign: 'center' }}>
                      Download
                    </span>
                  </a>
                ))}
              </div>
            )}

            <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />

            <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, color: 'var(--danger)', marginBottom: '0.75rem' }}>Danger Zone</h2>
            <div style={{ border: '1px solid rgba(229,66,77,0.2)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', background: 'var(--danger-bg)' }}>
              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem', lineHeight: 1.6 }}>
                Deleting your account is <strong>permanent and cannot be undone</strong>. All purchased assets and orders will be lost.
                Each email has a lifetime registration limit of <strong>10 times</strong>.
              </p>
              <button
                onClick={async () => {
                  if (window.confirm('Are you absolutely sure? This action is irreversible.')) {
                    try {
                      await deleteAccount();
                      navigate('/login');
                    } catch (error) {
                      alert(`Error: ${error.response?.data?.message || error.message}`);
                    }
                  }
                }}
                style={{ background: '#ff4d4f', color: 'white', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
              >
                Delete Account Permanently
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
