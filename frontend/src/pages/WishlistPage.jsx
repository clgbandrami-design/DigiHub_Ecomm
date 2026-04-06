import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import ProfileSidebar from '../components/ProfileSidebar';
import Footer from '../components/Footer';
import { Heart, Trash2, ShoppingCart, Check } from 'lucide-react';

const WishlistPage = () => {
  const { user } = useContext(AuthContext);
  const { addToCart, cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const [items, setItems] = useState([
    { _id: 'w1', name: 'Premium UI Kit', price: 1499, originalPrice: 2499, image: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=400', category: 'Templates', inr: true },
    { _id: 'w2', name: 'Logo Pack Pro', price: 899, originalPrice: 1999, image: 'https://images.unsplash.com/photo-1493421419110-74f4e85ba126?auto=format&fit=crop&q=80&w=400', category: 'Graphics', inr: true },
  ]);
  const [added, setAdded] = useState({});

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  const discount = (price, orig) => Math.round(((orig - price) / orig) * 100);

  const handleAddToCart = (item) => {
    addToCart({ ...item, qty: 1 });
    setAdded(prev => ({ ...prev, [item._id]: true }));
    setTimeout(() => setAdded(prev => ({ ...prev, [item._id]: false })), 2000);
  };

  const isInCart = (id) => cartItems.some(c => c._id === id);

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div className="container" style={{ padding: '1.5rem 1rem' }}>
        <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '16px', alignItems: 'start' }}>
          <ProfileSidebar />

          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                My Wishlist <span style={{ color: '#878787', fontWeight: 400, fontSize: '0.9rem' }}>({items.length} items)</span>
              </h2>
              {items.length > 0 && (
                <button
                  onClick={() => { items.forEach(i => addToCart({ ...i, qty: 1 })); navigate('/cart'); }}
                  style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)', background: 'none', border: '1px solid var(--primary)', padding: '0.35rem 0.9rem', borderRadius: '3px', cursor: 'pointer' }}
                >
                  Add All to Cart
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#878787' }}>
                <Heart size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p style={{ fontSize: '0.9rem' }}>Your wishlist is empty.</p>
                <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '1rem', padding: '0.5rem 1.5rem' }}>
                  Start Shopping
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {items.map(item => (
                  <div key={item._id} style={{ border: '1px solid #f0f0f0', borderRadius: '4px', overflow: 'hidden', transition: 'box-shadow 0.2s', position: 'relative' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <button
                      onClick={() => setItems(prev => prev.filter(i => i._id !== item._id))}
                      style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', zIndex: 2, background: '#fff', border: '1px solid #ddd', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                    >
                      <Trash2 size={13} color="#d32f2f" />
                    </button>

                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />

                    <div style={{ padding: '0.75rem' }}>
                      <span style={{ fontSize: '0.68rem', color: '#878787', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.category}</span>
                      <p style={{ fontSize: '0.87rem', fontWeight: 600, margin: '0.25rem 0 0.5rem', color: '#212121', lineHeight: 1.3 }}>{item.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>₹{item.price.toLocaleString()}</span>
                        <span style={{ textDecoration: 'line-through', color: '#878787', fontSize: '0.78rem' }}>₹{item.originalPrice.toLocaleString()}</span>
                        <span style={{ color: '#388e3c', fontSize: '0.75rem', fontWeight: 600 }}>{discount(item.price, item.originalPrice)}% off</span>
                      </div>
                      <button
                        className="btn-primary"
                        style={{
                          width: '100%', fontSize: '0.78rem', padding: '0.45rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                          background: isInCart(item._id) || added[item._id] ? '#388e3c' : undefined,
                          transition: 'background 0.3s'
                        }}
                        onClick={() => handleAddToCart(item)}
                      >
                        {isInCart(item._id) || added[item._id]
                          ? <><Check size={13} /> Added</>
                          : <><ShoppingCart size={13} /> Add to Cart</>
                        }
                      </button>
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

export default WishlistPage;

