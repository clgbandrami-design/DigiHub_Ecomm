import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, Edit2, Package, Plus, Store, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const EMPTY_FORM = {
  name: '',
  image: '',
  description: '',
  price: '',
  originalPrice: '',
  category: '',
  fileUrl: '',
  badge: '',
};

const TABS = ['My Products', 'Add Product', 'Analytics'];
const formatInr = (amount) => `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`;

const SellerDashboardPage = () => {
  const { user, getAuthHeader } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tab, setTab] = useState('My Products');
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) navigate('/login');
    else if (!user.isSeller) navigate('/become-seller');
  }, [navigate, user]);

  const showMessage = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3000);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/seller/my-products', getAuthHeader());
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load seller products:', error);
      setProducts([]);
      showMessage('Could not load your products.');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/seller/analytics', getAuthHeader());
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load seller analytics:', error);
      setAnalytics(null);
      showMessage('Could not load analytics.');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    if (tab === 'My Products') fetchProducts();
    if (tab === 'Analytics') fetchAnalytics();
  }, [fetchAnalytics, fetchProducts, tab]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await api.put(`/api/seller/products/${editingId}`, formData, getAuthHeader());
        showMessage('Product updated.');
      } else {
        await api.post('/api/seller/products', formData, getAuthHeader());
        showMessage('Product created.');
      }

      setFormData(EMPTY_FORM);
      setEditingId(null);
      setTab('My Products');
      await fetchProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
      showMessage(error.response?.data?.message || 'Error saving product.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      image: product.image,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || '',
      category: product.category,
      fileUrl: product.fileUrl,
      badge: product.badge || '',
    });
    setEditingId(product._id);
    setTab('Add Product');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/api/seller/products/${id}`, getAuthHeader());
      setProducts((current) => current.filter((item) => item._id !== id));
      showMessage('Product deleted.');
    } catch (error) {
      console.error('Failed to delete product:', error);
      showMessage(error.response?.data?.message || 'Failed to delete product.');
    }
  };

  const topProducts = useMemo(() => analytics?.topProducts || [], [analytics]);
  const recentSales = useMemo(() => analytics?.recentSales || [], [analytics]);
  const cardStyle = {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--border)',
    marginBottom: '1rem',
  };

  if (!user) return null;

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="container">
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
          <div style={{ background: message.toLowerCase().includes('could not') || message.toLowerCase().includes('error') ? '#fff3f3' : '#f0fdf4', border: `1px solid ${message.toLowerCase().includes('could not') || message.toLowerCase().includes('error') ? '#ffcccc' : '#bbf7d0'}`, borderRadius: 4, padding: '0.75rem 1rem', marginBottom: '1rem', color: message.toLowerCase().includes('could not') || message.toLowerCase().includes('error') ? '#d32f2f' : '#166534', fontSize: '0.9rem' }}>
            {message}
          </div>
        )}

        <div className="dashboard-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'var(--bg-card)', padding: '0.5rem', borderRadius: 'var(--radius-lg)', width: 'fit-content', boxShadow: 'var(--shadow-xs)', border: '1px solid var(--border)' }}>
          {TABS.map((tabName) => (
            <button
              key={tabName}
              onClick={() => {
                setTab(tabName);
                if (tabName !== 'Add Product') {
                  setEditingId(null);
                  setFormData(EMPTY_FORM);
                }
              }}
              style={{ padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 'var(--fs-base)', background: tab === tabName ? 'var(--cta)' : 'transparent', color: tab === tabName ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s', fontFamily: 'var(--font)' }}
            >
              {tabName}
            </button>
          ))}
        </div>

        {tab === 'My Products' && (
          <div>
            {loading ? (
              <p>Loading...</p>
            ) : products.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
                <Package size={48} style={{ color: '#ccc', margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--text-muted)' }}>No products yet. Add your first product.</p>
                <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => setTab('Add Product')}>
                  + Add Product
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {products.map((product) => (
                  <div key={product._id} style={cardStyle}>
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 6, marginBottom: '0.75rem' }} onError={(event) => { event.target.src = 'https://via.placeholder.com/280x140?text=No+Image'; }} />
                    <h3 style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.95rem' }}>{product.name}</h3>
                    <p style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '0.5rem' }}>{formatInr(Math.round(Number(product.price || 0) * 86))}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: '#f5f5f5', padding: '2px 8px', borderRadius: 12, width: 'fit-content' }}>{product.category}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button onClick={() => handleEdit(product)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem', borderRadius: 4, border: '1px solid var(--primary)', background: '#fff', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                        <Edit2 size={14} /> Edit
                      </button>
                      <button onClick={() => handleDelete(product._id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem', borderRadius: 4, border: '1px solid #f44336', background: '#fff', color: '#f44336', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'Add Product' && (
          <div style={{ ...cardStyle, maxWidth: 640 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit}>
              {[
                { label: 'Product Name', key: 'name', type: 'text', placeholder: 'e.g. Modern UI Kit' },
                { label: 'Image URL', key: 'image', type: 'url', placeholder: 'https://...' },
                { label: 'Price (USD)', key: 'price', type: 'number', placeholder: '29.99' },
                { label: 'Original Price (USD)', key: 'originalPrice', type: 'number', placeholder: '49.99' },
                { label: 'Category', key: 'category', type: 'text', placeholder: 'UI Kits, Icons, Fonts...' },
                { label: 'File / Download URL', key: 'fileUrl', type: 'url', placeholder: 'https://...' },
                { label: 'Badge (optional)', key: 'badge', type: 'text', placeholder: 'New, Hot, Featured...' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} className="form-group">
                  <label>{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={formData[key]}
                    onChange={(event) => setFormData((current) => ({ ...current, [key]: event.target.value }))}
                    required={key !== 'badge' && key !== 'originalPrice'}
                  />
                </div>
              ))}

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Describe your product..."
                  rows={4}
                  required
                  style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-light)', borderRadius: 2, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setFormData(EMPTY_FORM); }} style={{ flex: 1, padding: '0.75rem', border: '1px solid #ccc', borderRadius: 2, cursor: 'pointer', background: '#fff', fontWeight: 500 }}>
                    Cancel
                  </button>
                )}
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>
                  {loading ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        )}

        {tab === 'Analytics' && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={cardStyle}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Products</p>
                <h3 style={{ fontSize: '1.75rem' }}>{analytics?.totalProducts ?? 0}</h3>
              </div>
              <div style={cardStyle}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Paid Orders</p>
                <h3 style={{ fontSize: '1.75rem' }}>{analytics?.totalOrders ?? 0}</h3>
              </div>
              <div style={cardStyle}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Revenue</p>
                <h3 style={{ fontSize: '1.75rem' }}>{formatInr(analytics?.totalRevenue ?? 0)}</h3>
              </div>
            </div>

            <div style={{ ...cardStyle, marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <BarChart2 size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Top Products</h3>
              </div>

              {topProducts.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>Sales data will appear here after your first paid order.</p>
              ) : (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {topProducts.map((product) => (
                    <div key={product.productId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={product.image} alt={product.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                        <div>
                          <p style={{ fontWeight: 700 }}>{product.name}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product.unitsSold} unit(s) sold</p>
                        </div>
                      </div>
                      <strong>{formatInr(product.revenue)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ ...cardStyle, marginBottom: 0 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Recent Sales</h3>
              {recentSales.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>Recent sales will appear here once customers start buying.</p>
              ) : (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {recentSales.map((sale, index) => (
                    <div key={`${sale.orderId}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                      <div>
                        <p style={{ fontWeight: 700 }}>{sale.productName}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Qty {sale.qty} · {new Date(sale.purchasedAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <strong>{formatInr(sale.amount)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboardPage;
