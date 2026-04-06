import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ShoppingCart, Check } from 'lucide-react';

const USD_TO_INR = 86;
const toINR = (usd) => Math.round(usd * USD_TO_INR);
const fmtINR = (n) => '₹' + n.toLocaleString('en-IN');

const ProductCard = ({ product }) => {
  const { addToCart, cartItems } = useContext(CartContext);
  const toast = useToast();
  const [added, setAdded] = useState(false);

  const inCart = cartItems?.some(i => i._id === product._id);
  const priceINR = toINR(product.price);
  const origINR = product.originalPrice ? toINR(product.originalPrice) : Math.round(priceINR * 1.5);
  const discount = Math.round(((origINR - priceINR) / origINR) * 100);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="card" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* Discount badge */}
      {discount > 0 && (
        <div style={{
          position: 'absolute', top: 12, left: 12, background: 'var(--success)', color: '#fff',
          fontSize: '0.65rem', fontWeight: 800, padding: '3px 8px', borderRadius: 'var(--radius-full)', zIndex: 1,
          letterSpacing: '0.02em',
        }}>
          {discount}% OFF
        </div>
      )}

      <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ width: '100%', paddingBottom: '65%', position: 'relative', background: 'var(--bg-page)', overflow: 'hidden' }}>
          <img
            src={product.image}
            alt={product.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
            onError={e => {
              e.target.onerror = null;
              const colors = { Templates: '072654', Graphics: '6c4ab6', Audio: 'c93d6e', Photography: 'd45a26', Fonts: '0d8a72', Code: '4a6f8a', Video: 'c93636' };
              const bg = colors[product.category] || '072654';
              e.target.src = `https://placehold.co/400x260/${bg}/fff?text=${encodeURIComponent(product.name?.slice(0, 12) || 'Product')}`;
            }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.target.style.transform = ''}
          />
        </div>

        <div style={{ padding: '14px 16px 8px' }}>
          {/* Category label */}
          <span style={{
            fontSize: '0.65rem', fontWeight: 700, color: 'var(--cta)', textTransform: 'uppercase',
            letterSpacing: '0.06em', display: 'inline-block', marginBottom: '6px',
            background: 'var(--cta-light)', padding: '2px 8px', borderRadius: 'var(--radius-full)',
          }}>
            {product.category || 'Digital'}
          </span>
          {/* Product name */}
          <h3 style={{
            fontSize: 'var(--fs-base)', fontWeight: 700, color: 'var(--text-heading)', lineHeight: 1.4,
            height: '2.45rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', margin: 0,
          }}>
            {product.name}
          </h3>
          {/* Star rating */}
          {product.rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '6px' }}>
              <span style={{
                background: 'var(--success)', color: '#fff', fontSize: '0.65rem', fontWeight: 700,
                padding: '2px 6px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 2,
              }}>
                {product.rating.toFixed(1)} ★
              </span>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>({product.numReviews})</span>
            </div>
          )}
        </div>
      </Link>

      {/* Price row */}
      <div style={{ padding: '6px 16px 14px', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '10px' }}>
          <span style={{ fontWeight: 800, fontSize: 'var(--fs-lg)', color: 'var(--text-heading)' }}>{fmtINR(priceINR)}</span>
          <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: 'var(--fs-sm)' }}>{fmtINR(origINR)}</span>
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAdd}
          style={{
            width: '100%', padding: '9px 0',
            background: inCart || added ? 'var(--success)' : 'var(--cta)',
            color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
            fontSize: 'var(--fs-sm)', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'background 0.2s, transform 0.1s', fontFamily: 'var(--font)',
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
          onMouseUp={e => e.currentTarget.style.transform = ''}
        >
          {inCart || added ? <><Check size={14} /> In Cart</> : <><ShoppingCart size={14} /> Add to Cart</>}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
