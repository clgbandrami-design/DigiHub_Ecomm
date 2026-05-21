import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Package,
  Shield,
  ShoppingBag,
  Store,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

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
  }, [navigate, user]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/api/admin/stats', getAuthHeader());
      setStats(data);
    } catch (error) {
      console.error('Failed to load admin stats:', error);
      setMessage('Could not load admin stats.');
    }
  }, [getAuthHeader]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/users', getAuthHeader());
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load users:', error);
      setMessage('Could not load users.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/products', getAuthHeader());
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load products:', error);
      setMessage('Could not load products.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    if (tab === 'Overview') fetchStats();
    if (tab === 'Users') fetchUsers();
    if (tab === 'Products') fetchProducts();
  }, [fetchProducts, fetchStats, fetchUsers, tab]);

  const showTemporaryMessage = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 2500);
  };

  const toggleRole = async (userId, field, currentValue) => {
    try {
      const { data } = await api.put(
        `/api/admin/users/${userId}/role`,
        { [field]: !currentValue },
        getAuthHeader()
      );
      setUsers((current) => current.map((entry) => (entry._id === userId ? { ...entry, ...data } : entry)));
      showTemporaryMessage(`User ${field === 'isAdmin' ? 'admin' : 'seller'} status updated.`);
    } catch (error) {
      console.error('Failed to update role:', error);
      showTemporaryMessage(error.response?.data?.message || 'Failed to update role.');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/api/admin/users/${id}`, getAuthHeader());
      setUsers((current) => current.filter((entry) => entry._id !== id));
      showTemporaryMessage('User deleted.');
    } catch (error) {
      console.error('Failed to delete user:', error);
      showTemporaryMessage(error.response?.data?.message || 'Failed to delete user.');
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/api/admin/products/${id}`, getAuthHeader());
      setProducts((current) => current.filter((entry) => entry._id !== id));
      showTemporaryMessage('Product deleted.');
    } catch (error) {
      console.error('Failed to delete product:', error);
      showTemporaryMessage(error.response?.data?.message || 'Failed to delete product.');
    }
  };

  const card = (icon, label, value, color) => (
    <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
      <div style={{ background: `${color}20`, borderRadius: 'var(--radius-lg)', padding: '1rem', color }}>{icon}</div>
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{label}</p>
        <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>{value ?? '...'}</p>
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
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 4, padding: '0.6rem 1rem', marginBottom: '1rem', color: '#166534', fontSize: '0.85rem' }}>
            {message}
          </div>
        )}

        <div className="dashboard-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'var(--bg-card)', padding: '0.5rem', borderRadius: 'var(--radius-lg)', width: 'fit-content', boxShadow: 'var(--shadow-xs)', border: '1px solid var(--border)' }}>
          {TABS.map((tabName) => (
            <button
              key={tabName}
              onClick={() => setTab(tabName)}
              style={{ padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 'var(--fs-base)', background: tab === tabName ? 'var(--cta)' : 'transparent', color: tab === tabName ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s', fontFamily: 'var(--font)' }}
            >
              {tabName}
            </button>
          ))}
        </div>

        {tab === 'Overview' && (
          <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {card(<Users size={24} />, 'Total Users', stats?.userCount, '#1976d2')}
            {card(<Store size={24} />, 'Total Sellers', stats?.sellerCount, '#388e3c')}
            {card(<Package size={24} />, 'Total Products', stats?.productCount, '#f57c00')}
            {card(<ShoppingBag size={24} />, 'Total Orders', stats?.orderCount, '#7b1fa2')}
          </div>
        )}

        {tab === 'Users' && (
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            {loading ? (
              <p style={{ padding: '2rem', textAlign: 'center' }}>Loading...</p>
            ) : (
              <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                      {['Name', 'Email', 'Roles', 'Joined', 'Actions'].map((heading) => (
                        <th key={heading} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((entry) => (
                      <tr key={entry._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '0.875rem 1rem', fontWeight: 500, fontSize: '0.9rem' }}>{entry.name}</td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{entry.email}</td>
                        <td style={{ padding: '0.875rem 1rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {badge(entry.isAdmin, 'Admin')}
                          {badge(entry.isSeller, 'Seller')}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(entry.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <button onClick={() => toggleRole(entry._id, 'isAdmin', entry.isAdmin)} style={{ padding: '4px 10px', fontSize: '0.75rem', border: `1px solid ${entry.isAdmin ? '#f44336' : '#1976d2'}`, borderRadius: 4, background: '#fff', color: entry.isAdmin ? '#f44336' : '#1976d2', cursor: 'pointer', fontWeight: 500 }}>
                              {entry.isAdmin ? 'Remove Admin' : 'Make Admin'}
                            </button>
                            <button onClick={() => toggleRole(entry._id, 'isSeller', entry.isSeller)} style={{ padding: '4px 10px', fontSize: '0.75rem', border: `1px solid ${entry.isSeller ? '#f44336' : '#388e3c'}`, borderRadius: 4, background: '#fff', color: entry.isSeller ? '#f44336' : '#388e3c', cursor: 'pointer', fontWeight: 500 }}>
                              {entry.isSeller ? 'Remove Seller' : 'Make Seller'}
                            </button>
                            {entry._id !== user?._id && (
                              <button onClick={() => deleteUser(entry._id)} style={{ padding: '4px 10px', fontSize: '0.75rem', border: '1px solid #f44336', borderRadius: 4, background: '#fff', color: '#f44336', cursor: 'pointer' }}>
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

        {tab === 'Products' && (
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            {loading ? (
              <p style={{ padding: '2rem', textAlign: 'center' }}>Loading...</p>
            ) : (
              <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                      {['Product', 'Category', 'Price', 'Seller', 'Actions'].map((heading) => (
                        <th key={heading} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((entry) => (
                      <tr key={entry._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img src={entry.image} alt={entry.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }} onError={(event) => { event.target.src = 'https://via.placeholder.com/44?text=?'; }} />
                          <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{entry.name}</span>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{entry.category}</td>
                        <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>${entry.price}</td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{entry.seller?.name || 'N/A'}</td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <button onClick={() => deleteProduct(entry._id)} style={{ padding: '4px 10px', fontSize: '0.75rem', border: '1px solid #f44336', borderRadius: 4, background: '#fff', color: '#f44336', cursor: 'pointer' }}>
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
