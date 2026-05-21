import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  ShieldCheck,
  ShoppingCart,
  Star,
  Trash2,
  Zap,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import api from '../utils/api';

const toInr = (usd) => Math.round(Number(usd || 0) * 86);
const formatInr = (value) => `Rs. ${value.toLocaleString('en-IN')}`;

const StarRating = ({ value, onChange, size = 22 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map((rating) => (
      <Star
        key={rating}
        size={size}
        style={{ cursor: onChange ? 'pointer' : 'default', transition: 'transform 0.15s' }}
        fill={rating <= value ? '#ffc107' : 'none'}
        stroke={rating <= value ? '#ffc107' : '#ccc'}
        onClick={() => onChange?.(rating)}
        onMouseEnter={(event) => {
          if (onChange) event.target.style.transform = 'scale(1.2)';
        }}
        onMouseLeave={(event) => {
          if (onChange) event.target.style.transform = '';
        }}
      />
    ))}
  </div>
);

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useContext(CartContext);
  const { user, getAuthHeader } = useContext(AuthContext);
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [added, setAdded] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [recsMethod, setRecsMethod] = useState('');
  const recsScrollRef = useRef(null);

  const scrollRecs = (direction) => {
    if (!recsScrollRef.current) return;
    const amount = 460;
    recsScrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const inCart = cartItems?.some((item) => item._id === product?._id);

  const priceInr = useMemo(() => toInr(product?.price), [product?.price]);
  const originalInr = useMemo(() => {
    if (!product) return 0;
    return product.originalPrice ? toInr(product.originalPrice) : Math.round(priceInr * 1.5);
  }, [priceInr, product]);
  const discount = originalInr ? Math.max(0, Math.round(((originalInr - priceInr) / originalInr) * 100)) : 0;

  useEffect(() => {
    const fetchPageData = async () => {
      setLoading(true);
      setPageError('');

      try {
        const [productResponse, reviewResponse] = await Promise.all([
          api.get(`/api/products/${id}`),
          api.get(`/api/reviews/${id}`),
        ]);

        setProduct(productResponse.data);
        setReviews(Array.isArray(reviewResponse.data) ? reviewResponse.data : []);
      } catch (error) {
        console.error('Error loading product page:', error);
        setPageError(error.response?.data?.message || 'Could not load this product right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [id]);

  // Fetch AI recommendations
  useEffect(() => {
    if (!id) return;
    setRecsLoading(true);
    api.get(`/api/products/${id}/recommendations`)
      .then(({ data }) => {
        setRecommendations(data.recommendations || []);
        setRecsMethod(data.method || '');
      })
      .catch(() => setRecommendations([]))
      .finally(() => setRecsLoading(false));
  }, [id]);

  const refreshReviews = async () => {
    const [productResponse, reviewResponse] = await Promise.all([
      api.get(`/api/products/${id}`),
      api.get(`/api/reviews/${id}`),
    ]);
    setProduct(productResponse.data);
    setReviews(Array.isArray(reviewResponse.data) ? reviewResponse.data : []);
  };

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    toast.success(`${product.name} added to cart`);
    window.setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart(product);
    navigate('/cart');
  };

  const submitReview = async (event) => {
    event.preventDefault();

    if (!user) {
      toast.warning('Please login to write a review');
      navigate('/login');
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post(
        '/api/reviews',
        { productId: id, ...reviewForm },
        getAuthHeader()
      );
      toast.success('Review submitted');
      setReviewForm({ rating: 5, comment: '' });
      await refreshReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      await api.delete(`/api/reviews/${reviewId}`, getAuthHeader());
      toast.success('Review deleted');
      await refreshReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    }
  };

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--cta)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-base)' }}>Loading product...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (pageError || !product) {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          {pageError || 'Product not found'}
        </p>
        <button onClick={() => navigate('/')} className="btn-primary" style={{ padding: '0.6rem 2rem' }}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div className="container" style={{ padding: '1.5rem 1rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
            marginBottom: '1rem',
            padding: 0,
          }}
        >
          <ArrowLeft size={15} /> Back to Results
        </button>

        <div className="product-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 420px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', overflow: 'hidden', position: 'sticky', top: '5rem' }}>
            <div style={{ width: '100%', paddingBottom: '70%', position: 'relative', background: 'var(--bg-page)' }}>
              <img
                src={product.image}
                alt={product.name}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(event) => {
                  event.target.onerror = null;
                  const colors = { Templates: '2874f0', Graphics: '9c27b0', Audio: 'e91e63', Photography: 'ff5722', Fonts: '009688', Code: '607d8b', Video: 'f44336' };
                  const bg = colors[product.category] || '2874f0';
                  event.target.src = `https://placehold.co/400x280/${bg}/fff?text=${encodeURIComponent(product.name?.slice(0, 16) || 'Product')}`;
                }}
              />
            </div>

            <div style={{ padding: '1rem', display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  background: inCart || added ? 'var(--success)' : 'var(--cta)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                {inCart || added ? (
                  <>
                    <Check size={16} /> IN CART
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} /> ADD TO CART
                  </>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  background: 'var(--primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Zap size={16} /> BUY NOW
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', padding: '1.75rem 2rem' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
              {product.category || 'Digital Asset'}
            </p>

            <h1 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.6rem', color: '#212121', lineHeight: 1.3 }}>
              {product.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              {product.rating > 0 ? (
                <>
                  <span style={{ background: '#388e3c', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 3 }}>
                    {product.rating.toFixed(1)} ★
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {product.numReviews} rating{product.numReviews !== 1 ? 's' : ''}
                  </span>
                </>
              ) : (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No reviews yet</span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#212121' }}>{formatInr(priceInr)}</span>
              <span style={{ color: '#878787', textDecoration: 'line-through', fontSize: '1rem' }}>{formatInr(originalInr)}</span>
              {discount > 0 && <span style={{ color: '#388e3c', fontWeight: 700, fontSize: '0.95rem' }}>{discount}% off</span>}
            </div>

            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: '#212121' }}>Highlights</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {[
                  { icon: <Download size={14} />, text: 'Instant Digital Download' },
                  { icon: <ShieldCheck size={14} />, text: 'Commercial License Included' },
                  { icon: 'Updates', text: 'Free Lifetime Updates' },
                  { icon: 'Support', text: 'Priority Email Support' },
                ].map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#444', padding: '0.35rem 0' }}>
                    <span style={{ color: 'var(--primary)', flexShrink: 0 }}>{item.icon}</span> {item.text}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1.25rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: '#212121' }}>Product Description</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#444' }}>{product.description}</p>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--card-bg, #fff)', borderRadius: 6, boxShadow: 'var(--shadow-sm)', padding: '1.75rem 2rem', marginTop: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)' }}>Ratings & Reviews</h2>

          <form onSubmit={submitReview} style={{ background: 'var(--bg-light, #f9f9f9)', borderRadius: 8, padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid var(--border-light)' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-main)' }}>Write a Review</p>
            <div style={{ marginBottom: '0.75rem' }}>
              <StarRating value={reviewForm.rating} onChange={(rating) => setReviewForm((current) => ({ ...current, rating }))} />
            </div>
            <textarea
              value={reviewForm.comment}
              onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
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

          {reviews.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
              No reviews yet. Be the first to review this product.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map((review) => (
                <div key={review._id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ background: '#388e3c', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                        {review.rating} ★
                      </span>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>{review.name}</span>
                      {review.verifiedPurchase && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2e7d32', background: '#e8f5e9', padding: '2px 8px', borderRadius: 999 }}>
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                      {user && user._id === review.user && (
                        <button onClick={() => deleteReview(review._id)} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', padding: 2 }} title="Delete review">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI-Powered Similar Products */}
        {(recsLoading || recommendations.length > 0) && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              marginBottom: '1rem', flexWrap: 'wrap',
            }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Similar Products You May Like
              </h2>
            </div>

            {recsLoading ? (
              <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{
                    minWidth: 200, height: 280, borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-page)', animation: 'pulse 1.5s ease-in-out infinite',
                    flexShrink: 0,
                  }} />
                ))}
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                {/* Left arrow */}
                <button
                  onClick={() => scrollRecs('left')}
                  style={{
                    position: 'absolute', left: -6, top: '50%', transform: 'translateY(-50%)',
                    zIndex: 2, width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-heading)', transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.18)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'}
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Scrollable row */}
                <div ref={recsScrollRef} className="hide-scrollbar" style={{
                  display: 'flex', gap: '1rem', overflowX: 'auto',
                  paddingBottom: '0.75rem', scrollSnapType: 'x mandatory',
                  scrollBehavior: 'smooth', padding: '0 6px 0.75rem',
                }}>
                  {recommendations.map((rec) => (
                    <div key={rec._id} style={{ minWidth: 210, maxWidth: 240, flexShrink: 0, scrollSnapAlign: 'start' }}>
                      <ProductCard product={rec} />
                    </div>
                  ))}
                </div>

                {/* Right arrow */}
                <button
                  onClick={() => scrollRecs('right')}
                  style={{
                    position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)',
                    zIndex: 2, width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-heading)', transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.18)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProductPage;
