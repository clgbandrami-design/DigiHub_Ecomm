import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Package, Plus, Edit2, Trash2, Store, BarChart2, X } from 'lucide-react';

const TABS = ['My Products', 'Add Product', 'Analytics'];

const SellerDashboardPage = () => {
  const { user, getAuthHeader, loginFromOAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tab, setTab] = useState('My Products');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', image: '', description: '', price: '', originalPrice: '', category: '', fileUrl: '', badge: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user]);

  useEffect(() => {
    if (tab === 'My Products') fetchProducts();
  }, [tab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/seller/my-products', getAuthHeader());
      setProducts(data);
    } catch { setProducts([]); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/api/seller/products/${editingId}`, formData, getAuthHeader());
        setMessage('Product updated!');
      } else {
        await api.post('/api/seller/products', formData, getAuthHeader());
        setMessage('Product created!');
      }
      setFormData({ name: '', image: '', description: '', price: '', originalPrice: '', category: '', fileUrl: '', badge: '' });
      setEditingId(null);
      setTab('My Products');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error saving product');
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleEdit = (p) => {
    setFormData({ name: p.name, image: p.image, description: p.description, price: p.price, originalPrice: p.originalPrice || '', category: p.category, fileUrl: p.fileUrl, badge: p.badge || '' });
    setEditingId(p._id);
    setTab('Add Product');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/api/seller/products/${id}`, getAuthHeader());
    fetchProducts();
  };

  const s = { card: { background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', marginBottom: '1rem' } };

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--cta)', borderRadius: 'var(--radius-lg)', padding: '0.75rem', display: 'flex' }}>
            <Store size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Seller Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user?.sellerInfo?.storeName || `${user?.name}'s Store`}</p>
          </div>
        </div>

        {message && (
          <div style={{ background: message.includes('Error') ? '#fff3f3' : '#f0fdf4', border: `1px solid ${message.includes('Error') ? '#ffcccc' : '#bbf7d0'}`, borderRadius: 4, padding: '0.75rem 1rem', marginBottom: '1rem', color: message.includes('Error') ? '#d32f2f' : '#166534', fontSize: '0.9rem' }}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="dashboard-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'var(--bg-card)', padding: '0.5rem', borderRadius: 'var(--radius-lg)', width: 'fit-content', boxShadow: 'var(--shadow-xs)', border: '1px solid var(--border)' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => { setTab(t); if (t !== 'Add Product') setEditingId(null); }}
              style={{ padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 'var(--fs-base)', background: tab === t ? 'var(--cta)' : 'transparent', color: tab === t ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s', fontFamily: 'var(--font)' }}>
              {t}
            </button>
          ))}
        </div>

        {/* My Products Tab */}
        {tab === 'My Products' && (
          <div>
            {loading ? <p>Loading…</p> : products.length === 0 ? (
              <div style={{ ...s.card, textAlign: 'center', padding: '3rem' }}>
                <Package size={48} style={{ color: '#ccc', margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--text-muted)' }}>No products yet. Add your first product!</p>
                <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => setTab('Add Product')}>+ Add Product</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {products.map(p => (
                  <div key={p._id} style={s.card}>
                    <img src={p.image} alt={p.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 6, marginBottom: '0.75rem' }} onError={e => { e.target.src = 'https://via.placeholder.com/280x140?text=No+Image'; }} />
                    <h3 style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.95rem' }}>{p.name}</h3>
                    <p style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '0.5rem' }}>${p.price}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: '#f5f5f5', padding: '2px 8px', borderRadius: 12, width: 'fit-content' }}>{p.category}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button onClick={() => handleEdit(p)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--primary)', background: '#fff', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                        <Edit2 size={14} /> Edit
                      </button>
                      <button onClick={() => handleDelete(p._id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem', borderRadius: 4, border: '1px solid #f44336', background: '#fff', color: '#f44336', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Product Tab */}
        {tab === 'Add Product' && (
          <div style={{ ...s.card, maxWidth: 640 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit}>
              {[
                { label: 'Product Name', key: 'name', type: 'text', placeholder: 'e.g. Modern UI Kit' },
                { label: 'Image URL', key: 'image', type: 'url', placeholder: 'https://...' },
                { label: 'Price ($)', key: 'price', type: 'number', placeholder: '29.99' },
                { label: 'Original Price ($)', key: 'originalPrice', type: 'number', placeholder: '49.99' },
                { label: 'Category', key: 'category', type: 'text', placeholder: 'UI Kits, Icons, Fonts…' },
                { label: 'File/Download URL', key: 'fileUrl', type: 'url', placeholder: 'https://...' },
                { label: 'Badge (optional)', key: 'badge', type: 'text', placeholder: 'New, Hot, Special Feature…' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} className="form-group">
                  <label>{label}</label>
                  <input type={type} placeholder={placeholder} value={formData[key]} onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))} required={key !== 'badge' && key !== 'originalPrice'} />
                </div>
              ))}
              <div className="form-group">
                <label>Description</label>
                <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Describe your product..." rows={4} required style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-light)', borderRadius: 2, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', image: '', description: '', price: '', originalPrice: '', category: '', fileUrl: '', badge: '' }); }} style={{ flex: 1, padding: '0.75rem', border: '1px solid #ccc', borderRadius: 2, cursor: 'pointer', background: '#fff', fontWeight: 500 }}>
                    Cancel
                  </button>
                )}
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>
                  {loading ? 'Saving…' : editingId ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Analytics Tab */}
        {tab === 'Analytics' && (
          <div style={{ ...s.card, textAlign: 'center', padding: '3rem' }}>
            <BarChart2 size={48} style={{ color: '#ccc', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Analytics coming soon</h3>
            <p style={{ color: 'var(--text-muted)' }}>Track your sales, views, and revenue here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboardPage;
