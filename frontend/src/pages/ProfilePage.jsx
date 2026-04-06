import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ProfileSidebar from '../components/ProfileSidebar';
import Footer from '../components/Footer';
import axios from 'axios';

const ProfilePage = () => {
  const { user, deleteAccount } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setFirstName(user.name.split(' ')[0] || '');
    setLastName(user.name.split(' ').slice(1).join(' ') || '');
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get('/api/orders/myorders', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setOrders(data);
      } catch {}
    };
    fetchOrders();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div className="container" style={{ padding: '1.5rem 1rem' }}>
        <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '16px', alignItems: 'start' }}>
          <ProfileSidebar />

          {/* Main Content */}
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
              <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, color: 'var(--text-heading)' }}>Personal Information</h2>
              <button
                onClick={() => setEditing(!editing)}
                style={{ background: 'none', border: '1px solid var(--cta)', color: 'var(--cta)', padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 'var(--fs-sm)', fontWeight: 600, fontFamily: 'var(--font)', transition: 'background 0.15s' }}
              >
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="mobile-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', maxWidth: 560 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  readOnly={!editing}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{ background: editing ? '#fff' : '#fafafa' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  readOnly={!editing}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{ background: editing ? '#fff' : '#fafafa' }}
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                <label>Email Address</label>
                <input type="text" readOnly value={user.email} style={{ background: '#fafafa' }} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                <label>Mobile Number</label>
                <input type="tel" placeholder="Add mobile number" readOnly={!editing} style={{ background: editing ? '#fff' : '#fafafa' }} />
              </div>
            </div>

            {editing && (
              <button
                className="btn-primary"
                style={{ marginTop: '1.5rem', padding: '0.5rem 1.5rem' }}
                onClick={() => setEditing(false)}
              >
                Save Changes
              </button>
            )}

            <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />

            <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-heading)' }}>My Purchased Assets</h2>
            {orders.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-base)' }}>No items purchased yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                {orders.map(order => order.orderItems.map(item => (
                  <div key={item._id} className="card" style={{ border: '1px solid #f0f0f0' }}>
                    <img src={item.image} alt={item.name} style={{ height: '100px' }} />
                    <h4 style={{ fontSize: '0.78rem', margin: '0.5rem 0' }}>{item.name}</h4>
                    <button className="btn-primary" style={{ width: '100%', fontSize: '0.72rem', padding: '0.4rem' }}>Download</button>
                  </div>
                )))}
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
                  if (window.confirm('Are you absolutely sure? This action is IRREVERSIBLE.')) {
                    try {
                      await deleteAccount();
                      navigate('/login');
                    } catch (error) {
                      alert('Error: ' + (error.response?.data?.message || error.message));
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
