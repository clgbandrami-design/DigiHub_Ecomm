import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import HeroSlider from '../components/HeroSlider';
import CategoryBar from '../components/CategoryBar';
import Footer from '../components/Footer';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'All') params.append('category', activeCategory);
      params.append('sort', sortBy);
      const { data } = await api.get(`/api/products?${params}`);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products', error);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, sortBy]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div className="container">
        {/* ── Category Icon Bar (Flipkart-style) ── */}
        <div style={{
          background: 'var(--bg-card)',
          marginTop: '0.75rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          <CategoryBar active={activeCategory} onSelect={setActiveCategory} />
        </div>

        <HeroSlider />

        {/* Product Section */}
        <div style={{
          background: 'var(--bg-card)', marginTop: '1.5rem', borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', overflow: 'hidden',
        }}>

          {/* Header row */}
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, margin: 0, color: 'var(--text-heading)' }}>
                {activeCategory === 'All' ? 'All Digital Products' : activeCategory}
              </h2>
              {!loading && <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>{products.length} product{products.length !== 1 ? 's' : ''} found</p>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{
                  padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--fs-sm)', color: 'var(--text-body)', background: 'var(--bg-card)',
                  cursor: 'pointer', outline: 'none', fontFamily: 'var(--font)',
                }}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div style={{ padding: '0 20px 24px' }}>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--bg-page)', height: 280, animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: 'var(--fs-md)' }}>No products found in this category.</p>
              </div>
            ) : (
              <div className="product-grid">
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
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

export default HomePage;
