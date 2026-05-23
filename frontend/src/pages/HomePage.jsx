import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import HeroSlider from '../components/HeroSlider';
import CategoryBar from '../components/CategoryBar';
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import Footer from '../components/Footer';
import api from '../utils/api';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);

  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const [aiRecs, setAiRecs] = useState([]);
  const [aiRecsLoading, setAiRecsLoading] = useState(false);
  const [aiMethod, setAiMethod] = useState('');
  const aiScrollRef = useRef(null);

  const scrollAiRecs = (direction) => {
    if (!aiScrollRef.current) return;
    const amount = 440;
    aiScrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const searchQuery = searchParams.get('search') || '';

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
    setProducts([]);
  }, [activeCategory, searchQuery, sortBy]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);
      setError('');

      try {
        const { data } = await api.get('/api/products', {
          params: {
            category: activeCategory !== 'All' ? activeCategory : undefined,
            sort: sortBy,
            keyword: searchQuery || undefined,
            page: page,
            limit: 12,
          },
        });
        
        // Handle new pagination response format
        const fetchedProducts = data.products || (Array.isArray(data) ? data : []);
        
        if (page === 1) {
          setProducts(fetchedProducts);
        } else {
          setProducts(prev => [...prev, ...fetchedProducts]);
        }
        
        setHasMore(data.page < data.pages);
        setTotalProducts(data.total || fetchedProducts.length);
      } catch (fetchError) {
        console.error('Error fetching products:', fetchError);
        setError('Could not load products right now. Please try again.');
        if (page === 1) setProducts([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchProducts();
  }, [activeCategory, searchQuery, sortBy, page]);

  // AI-powered search recommendations
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setAiRecs([]);
      setAiMethod('');
      return;
    }

    setAiRecsLoading(true);
    api.get('/api/products/ai/search-recommendations', { params: { q: searchQuery, limit: 8 } })
      .then(({ data }) => {
        setAiRecs(data.recommendations || []);
        setAiMethod(data.method || '');
      })
      .catch(() => { setAiRecs([]); setAiMethod(''); })
      .finally(() => setAiRecsLoading(false));
  }, [searchQuery]);

  const sectionTitle = searchQuery
    ? `Search results for "${searchQuery}"`
    : activeCategory === 'All'
      ? 'All Digital Products'
      : activeCategory;

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div className="container">
        <div
          style={{
            background: 'var(--bg-card)',
            marginTop: '0.75rem',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          <CategoryBar active={activeCategory} onSelect={setActiveCategory} />
        </div>

        <HeroSlider />

        <div
          style={{
            background: 'var(--bg-card)',
            marginTop: '1.5rem',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div>
              <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, margin: 0, color: 'var(--text-heading)' }}>
                {sectionTitle}
              </h2>
              {!loading && !error && (
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {totalProducts} product{totalProducts !== 1 ? 's' : ''} found
                </p>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--fs-sm)',
                  color: 'var(--text-body)',
                  background: 'var(--bg-card)',
                  cursor: 'pointer',
                  outline: 'none',
                  fontFamily: 'var(--font)',
                }}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* AI Recommendations Section (visible when searching) */}
          {searchQuery && (aiRecsLoading || aiRecs.length > 0) && (
            <div style={{ padding: '0 20px 16px' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.08) 100%)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                border: '1px solid rgba(102,126,234,0.15)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.2rem' }}>✨</span>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-heading)' }}>
                    AI Recommends
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    Based on your search
                  </span>
                </div>

                {aiRecsLoading ? (
                  <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} style={{
                        minWidth: 190, height: 260, borderRadius: 'var(--radius-lg)',
                        background: 'var(--bg-page)', animation: 'pulse 1.5s ease-in-out infinite',
                        flexShrink: 0,
                      }} />
                    ))}
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    {/* Left arrow */}
                    <button
                      onClick={() => scrollAiRecs('left')}
                      style={{
                        position: 'absolute', left: -6, top: '50%', transform: 'translateY(-50%)',
                        zIndex: 2, width: 32, height: 32, borderRadius: '50%',
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-heading)',
                      }}
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div ref={aiScrollRef} className="hide-scrollbar" style={{
                      display: 'flex', gap: '0.75rem', overflowX: 'auto',
                      paddingBottom: '0.5rem', scrollSnapType: 'x mandatory',
                      scrollBehavior: 'smooth', padding: '0 6px 0.5rem',
                    }}>
                      {aiRecs.map((rec) => (
                        <div key={rec._id} style={{ minWidth: 195, maxWidth: 220, flexShrink: 0, scrollSnapAlign: 'start' }}>
                          <ProductCard product={rec} />
                        </div>
                      ))}
                    </div>

                    {/* Right arrow */}
                    <button
                      onClick={() => scrollAiRecs('right')}
                      style={{
                        position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)',
                        zIndex: 2, width: 32, height: 32, borderRadius: '50%',
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-heading)',
                      }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{ padding: '0 20px 24px' }}>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    style={{
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      background: 'var(--bg-page)',
                      height: 280,
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                ))}
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger)' }}>
                <p style={{ fontSize: 'var(--fs-md)' }}>{error}</p>
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: 'var(--fs-md)' }}>
                  {searchQuery
                    ? 'No products matched your search.'
                    : 'No products found in this category.'}
                </p>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
                
                {hasMore && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
                    <button 
                      onClick={() => setPage(p => p + 1)} 
                      disabled={loadingMore}
                      style={{ 
                        background: 'var(--bg-page)', 
                        color: 'var(--text-heading)', 
                        border: '1px solid var(--border)', 
                        padding: '0.875rem 2.5rem', 
                        borderRadius: '999px', 
                        fontSize: '0.95rem', 
                        fontWeight: 700, 
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--cta-light)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-page)'}
                    >
                      {loadingMore ? <><Loader size={16} className="spin" /> Loading...</> : 'Show More Products'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
