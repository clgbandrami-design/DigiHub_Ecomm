import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Footer from '../components/Footer';
import { ShoppingCart, Zap, ShieldCheck, Download, Check, ArrowLeft, Star, Trash2 } from 'lucide-react';

const USD_TO_INR = 86;
const toINR = (usd) => Math.round(usd * USD_TO_INR);
const fmtINR = (n) => '₹' + n.toLocaleString('en-IN');

const StarRating = ({ value, onChange, size = 22 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Star
        key={i}
        size={size}
        style={{ cursor: onChange ? 'pointer' : 'default', transition: 'transform 0.15s' }}
        fill={i <= value ? '#ffc107' : 'none'}
        stroke={i <= value ? '#ffc107' : '#ccc'}
        onClick={() => onChange?.(i)}
        onMouseEnter={e => onChange && (e.target.style.transform = 'scale(1.2)')}
        onMouseLeave={e => onChange && (e.target.style.transform = '')}
      />
    ))}
  </div>
);

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { addToCart, cartItems } = useContext(CartContext);
  const { user, getAuthHeader } = useContext(AuthContext);
  const toast = useToast();

  // Review state
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const inCart = cartItems?.some(i => i._id === product?._id);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    api.get(`/api/reviews/${id}`).then(res => setReviews(res.data)).catch(() => {});
  }, [id]);

  if (loading) return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--cta)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-base)' }}>Loading product…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!product) return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Product not found</p>
      <button onClick={() => navigate('/')} className="btn-primary" style={{ padding: '0.6rem 2rem' }}>Back to Home</button>
    </div>
  );

  const priceINR = toINR(product.price);
  const origINR = product.originalPrice ? toINR(product.originalPrice) : Math.round(priceINR * 1.5);
  const discount = Math.round(((origINR - priceINR) / origINR) * 100);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setAdded(false), 1500);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.warning('Please login to write a review'); navigate('/login'); return; }
    setSubmittingReview(true);
    try {
      await api.post('/api/reviews', { productId: id, ...reviewForm }, getAuthHeader());
      toast.success('Review submitted!');
      setReviewForm({ rating: 5, comment: '' });
      // Refresh
      const [prodRes, revRes] = await Promise.all([api.get(`/api/products/${id}`), api.get(`/api/reviews/${id}`)]);
      setProduct(prodRes.data);
      setReviews(revRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
    setSubmittingReview(false);
  };

  const deleteReview = async (reviewId) => {
    try {
      await api.delete(`/api/reviews/${reviewId}`, getAuthHeader());
      toast.success('Review deleted');
      const [prodRes, revRes] = await Promise.all([api.get(`/api/products/${id}`), api.get(`/api/reviews/${id}`)]);
      setProduct(prodRes.data);
      setReviews(revRes.data);
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const handleBuyNow = () => {
    addToCart(product);
    navigate('/cart');
  };

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div className="container" style={{ padding: '1.5rem 1rem' }}>
        {/* Breadcrumb */}
        <button onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', marginBottom: '1rem', padding: 0 }}>
          <ArrowLeft size={15} /> Back to Results
        </button>

        <div className="product-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 420px) 1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* ── Left: Image ── */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', overflow: 'hidden', position: 'sticky', top: '5rem' }}>
            <div style={{ width: '100%', paddingBottom: '70%', position: 'relative', background: 'var(--bg-page)' }}>
              <img
                src={product.image}
                alt={product.name}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => {
                  e.target.onerror = null;
                  const colors = { Templates: '2874f0', Graphics: '9c27b0', Audio: 'e91e63', Photography: 'ff5722', Fonts: '009688', Code: '607d8b', Video: 'f44336' };
                  const bg = colors[product.category] || '2874f0';
                  e.target.src = `https://placehold.co/400x280/${bg}/fff?text=${encodeURIComponent(product.name?.slice(0, 16) || 'Product')}`;
                }}
              />
            </div>

            {/* Action buttons (sticky below image on desktop) */}
            <div style={{ padding: '1rem', display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleAddToCart}
                style={{
                  flex: 1, padding: '0.85rem', fontWeight: 700, fontSize: '0.9rem',
                  border: 'none', borderRadius: 4, cursor: 'pointer',
                  background: inCart || added ? 'var(--success)' : 'var(--cta)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: 'background 0.2s',
                }}
              >
                {inCart || added ? <><Check size={16} /> IN CART</> : <><ShoppingCart size={16} /> ADD TO CART</>}
              </button>
              <button
                onClick={handleBuyNow}
                style={{
                  flex: 1, padding: '0.85rem', fontWeight: 700, fontSize: '0.9rem',
                  border: 'none', borderRadius: 4, cursor: 'pointer',
                  background: 'var(--primary)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <Zap size={16} /> BUY NOW
              </button>
            </div>
          </div>

          {/* ── Right: Details ── */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', padding: '1.75rem 2rem' }}>

            {/* Category badge */}
            <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
              {product.category || 'Digital Asset'}
            </p>

            <h1 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.6rem', color: '#212121', lineHeight: 1.3 }}>{product.name}</h1>

            {/* Rating — real data */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              {product.rating > 0 ? (
                <>
                  <span style={{ background: '#388e3c', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 3 }}>{product.rating.toFixed(1)} ★</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{product.numReviews} rating{product.numReviews !== 1 ? 's' : ''}</span>
                </>
              ) : (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No reviews yet</span>
              )}
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#212121' }}>{fmtINR(priceINR)}</span>
              <span style={{ color: '#878787', textDecoration: 'line-through', fontSize: '1rem' }}>{fmtINR(origINR)}</span>
              {discount > 0 && <span style={{ color: '#388e3c', fontWeight: 700, fontSize: '0.95rem' }}>{discount}% off</span>}
            </div>

            {/* Highlights */}
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: '#212121' }}>Highlights</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {[
                  { icon: <Download size={14} />, text: 'Instant Digital Download' },
                  { icon: <ShieldCheck size={14} />, text: 'Commercial License Included' },
                  { icon: '🔄', text: 'Free Lifetime Updates' },
                  { icon: '💬', text: 'Priority Email Support' },
                ].map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#444', padding: '0.35rem 0' }}>
                    <span style={{ color: 'var(--primary)', flexShrink: 0 }}>{h.icon}</span> {h.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1.25rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: '#212121' }}>Product Description</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#444' }}>{product.description}</p>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f0f0f0', flexWrap: 'wrap' }}>
              {[
                { icon: '🛡️', label: 'Secure Payment' },
                { icon: '📥', label: 'Instant Access' },
                { icon: '💯', label: '7 Day Refund' },
              ].map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#666', fontWeight: 600 }}>
                  <span>{b.icon}</span> {b.label}
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── Reviews Section ── */}
        <div style={{ background: 'var(--card-bg, #fff)', borderRadius: 6, boxShadow: 'var(--shadow-sm)', padding: '1.75rem 2rem', marginTop: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)' }}>Ratings & Reviews</h2>

          {/* Review form */}
          <form onSubmit={submitReview} style={{ background: 'var(--bg-light, #f9f9f9)', borderRadius: 8, padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid var(--border-light)' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-main)' }}>Write a Review</p>
            <div style={{ marginBottom: '0.75rem' }}>
              <StarRating value={reviewForm.rating} onChange={r => setReviewForm(f => ({ ...f, rating: r }))} />
            </div>
            <textarea
              value={reviewForm.comment}
              onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
              placeholder="Share your experience with this product..."
              required
              rows={3}
              style={{ width: '100%', padding: '0.7rem', border: '1px solid var(--border-light)', borderRadius: 6, outline: 'none', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.85rem', background: 'var(--input-bg, #fff)', color: 'var(--text-main)' }}
            />
            <button
              type="submit"
              disabled={submittingReview || !reviewForm.comment.trim()}
              style={{ marginTop: '0.6rem', padding: '0.55rem 1.5rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 6, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', opacity: submittingReview ? 0.6 : 1 }}
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>No reviews yet. Be the first to review this product!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map(rev => (
                <div key={rev._id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ background: '#388e3c', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                        {rev.rating} ★
                      </span>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>{rev.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                      {user && user._id === rev.user && (
                        <button onClick={() => deleteReview(rev._id)} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', padding: 2 }} title="Delete review">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default ProductPage;
