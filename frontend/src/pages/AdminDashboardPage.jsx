import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Users, Package, ShoppingBag, TrendingUp, Trash2, Shield, Store, CheckCircle, XCircle } from 'lucide-react';

const TABS = ['Overview', 'Users', 'Products'];

const AdminDashboardPage = () => {
  const { user, getAuthHeader } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tab, setTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) navigate('/login');
    else if (!user.isAdmin) navigate('/');
  }, [user]);

  useEffect(() => {
    if (tab === 'Overview') fetchStats();
    else if (tab === 'Users') fetchUsers();
    else if (tab === 'Products') fetchProducts();
  }, [tab]);

  const fetchStats = async () => {
    try { const { data } = await axios.get('/api/admin/stats', getAuthHeader()); setStats(data); } catch {}
  };
  const fetchUsers = async () => {
    setLoading(true);
    try { const { data } = await axios.get('/api/admin/users', getAuthHeader()); setUsers(data); } catch {}
    setLoading(false);
  };
  const fetchProducts = async () => {
    setLoading(true);
    try { const { data } = await axios.get('/api/admin/products', getAuthHeader()); setProducts(data); } catch {}
    setLoading(false);
  };

  const toggleRole = async (userId, field, currentVal) => {
    try {
      const { data } = await axios.put(`/api/admin/users/${userId}/role`, { [field]: !currentVal }, getAuthHeader());
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, ...data } : u));
      setMessage(`User ${field === 'isAdmin' ? 'admin' : 'seller'} status updated`);
      setTimeout(() => setMessage(''), 2000);
    } catch { setMessage('Failed to update role'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await axios.delete(`/api/admin/users/${id}`, getAuthHeader());
    setUsers(prev => prev.filter(u => u._id !== id));
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await axios.delete(`/api/admin/products/${id}`, getAuthHeader());
    setProducts(prev => prev.filter(p => p._id !== id));
  };

  const card = (icon, label, value, color) => (
    <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
      <div style={{ background: color + '20', borderRadius: 'var(--radius-lg)', padding: '1rem', color }}>{icon}</div>
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{label}</p>
        <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>{value ?? '…'}</p>
      </div>
    </div>
  );

  const badge = (active, label) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, background: active ? '#e8f5e9' : '#fafafa', color: active ? '#2e7d32' : '#999', border: `1px solid ${active ? '#a5d6a7' : '#e0e0e0'}` }}>
      {active ? <CheckCircle size={11} /> : <XCircle size={11} />} {label}
    </span>
  );

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--primary)', borderRadius: 'var(--radius-lg)', padding: '0.75rem', display: 'flex' }}>
            <Shield size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Manage your DigiHub platform</p>
          </div>
        </div>

        {message && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 4, padding: '0.6rem 1rem', marginBottom: '1rem', color: '#166534', fontSize: '0.85rem' }}>{message}</div>
        )}

        {/* Tabs */}
        <div className="dashboard-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'var(--bg-card)', padding: '0.5rem', borderRadius: 'var(--radius-lg)', width: 'fit-content', boxShadow: 'var(--shadow-xs)', border: '1px solid var(--border)' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 'var(--fs-base)', background: tab === t ? 'var(--cta)' : 'transparent', color: tab === t ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s', fontFamily: 'var(--font)' }}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'Overview' && (
          <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {card(<Users size={24} />, 'Total Users', stats?.userCount, '#1976d2')}
            {card(<Store size={24} />, 'Total Sellers', stats?.sellerCount, '#388e3c')}
            {card(<Package size={24} />, 'Total Products', stats?.productCount, '#f57c00')}
            {card(<ShoppingBag size={24} />, 'Total Orders', stats?.orderCount, '#7b1fa2')}
          </div>
        )}

        {/* Users */}
        {tab === 'Users' && (
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            {loading ? <p style={{ padding: '2rem', textAlign: 'center' }}>Loading…</p> : (
              <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                      {['Name', 'Email', 'Roles', 'Joined', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '0.875rem 1rem', fontWeight: 500, fontSize: '0.9rem' }}>{u.name}</td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.email}</td>
                        <td style={{ padding: '0.875rem 1rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {badge(u.isAdmin, 'Admin')}
                          {badge(u.isSeller, 'Seller')}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <button onClick={() => toggleRole(u._id, 'isAdmin', u.isAdmin)} style={{ padding: '4px 10px', fontSize: '0.75rem', border: `1px solid ${u.isAdmin ? '#f44336' : '#1976d2'}`, borderRadius: 4, background: '#fff', color: u.isAdmin ? '#f44336' : '#1976d2', cursor: 'pointer', fontWeight: 500 }}>
                              {u.isAdmin ? 'Remove Admin' : 'Make Admin'}
                            </button>
                            <button onClick={() => toggleRole(u._id, 'isSeller', u.isSeller)} style={{ padding: '4px 10px', fontSize: '0.75rem', border: `1px solid ${u.isSeller ? '#f44336' : '#388e3c'}`, borderRadius: 4, background: '#fff', color: u.isSeller ? '#f44336' : '#388e3c', cursor: 'pointer', fontWeight: 500 }}>
                              {u.isSeller ? 'Remove Seller' : 'Make Seller'}
                            </button>
                            {u._id !== user?._id && (
                              <button onClick={() => deleteUser(u._id)} style={{ padding: '4px 10px', fontSize: '0.75rem', border: '1px solid #f44336', borderRadius: 4, background: '#fff', color: '#f44336', cursor: 'pointer' }}>
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Products */}
        {tab === 'Products' && (
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            {loading ? <p style={{ padding: '2rem', textAlign: 'center' }}>Loading…</p> : (
              <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                      {['Product', 'Category', 'Price', 'Seller', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img src={p.image} alt={p.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }} onError={e => { e.target.src = 'https://via.placeholder.com/44?text=?'; }} />
                          <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{p.name}</span>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.category}</td>
                        <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>${p.price}</td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.seller?.name || 'N/A'}</td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <button onClick={() => deleteProduct(p._id)} style={{ padding: '4px 10px', fontSize: '0.75rem', border: '1px solid #f44336', borderRadius: 4, background: '#fff', color: '#f44336', cursor: 'pointer' }}>
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
