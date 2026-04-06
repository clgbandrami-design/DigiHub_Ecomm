import React, { useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, MapPin, ChevronDown, Package, Heart, LogOut, Store, Shield, Menu, X, LocateFixed, Loader, Moon, Sun } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ThemeContext } from '../context/ThemeContext';

/* ── Location helpers ─────────────────────────── */
const reverseGeocode = async (lat, lon) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=12&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const a = data.address;
    const area = a.suburb || a.neighbourhood || a.village || a.town || a.city_district || '';
    const city = a.city || a.town || a.county || '';
    return area ? `${area}, ${city}` : city || data.display_name?.split(',')[0] || 'Your Location';
  } catch {
    return 'Your Location';
  }
};

/* ── Styles ─────────────────────────────────────── */
const S = {
  header: {
    overflow: 'visible', position: 'sticky', top: 0, zIndex: 1000,
    background: 'var(--header-bg)', borderBottom: '1px solid var(--header-border)',
  },
  logoArea: { display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 0 auto' },
  locationBtn: {
    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-body)',
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1px', padding: '4px 8px',
    borderRadius: 'var(--radius-md)', transition: 'background 0.15s',
  },
  searchWrap: { flex: '1', minWidth: '120px', position: 'relative' },
  sugBox: {
    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
    background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-lg)', zIndex: 2000, overflow: 'hidden',
    border: '1px solid var(--border)',
  },
  sugItem: {
    display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
    padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer',
    textAlign: 'left', borderBottom: '1px solid var(--border)',
    transition: 'background 0.12s',
  },
  avatar: (char) => ({
    width: 30, height: 30, borderRadius: 'var(--radius-full)',
    background: 'linear-gradient(135deg, var(--cta), var(--primary))', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', flexShrink: 0,
  }),
  badge: {
    position: 'absolute', top: -6, right: -8, background: 'var(--danger)',
    borderRadius: 'var(--radius-full)', padding: '1px 5px', fontSize: '0.65rem',
    fontWeight: 800, color: '#fff', boxShadow: 'var(--shadow-xs)',
  },
  popup: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000,
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '4.5rem',
  },
  popupCard: {
    background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: '1.75rem 2rem',
    maxWidth: 400, width: '90%', boxShadow: 'var(--shadow-xl)', animation: 'slideDown 0.25s ease',
  },
  themeBtn: {
    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-body)',
    display: 'flex', alignItems: 'center', padding: '6px',
    borderRadius: 'var(--radius-full)', transition: 'background 0.15s',
  },
};

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [sugLoading, setSugLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef(null);
  const sugTimer = useRef(null);

  // Location state
  const [location, setLocation] = useState(() => localStorage.getItem('dh_location') || '');
  const [locLoading, setLocLoading] = useState(false);
  const [locPopup, setLocPopup] = useState(false);
  const [locError, setLocError] = useState('');
  const [permAsked, setPermAsked] = useState(!!localStorage.getItem('dh_location'));

  const navigate = useNavigate();
  const closeTimer = useRef(null);
  const locRef = useRef(null);

  const cartCount = cartItems?.reduce((acc, item) => acc + item.qty, 0) || 0;

  // ── Headroom: auto-hide header on scroll down, show on scroll up (mobile) ──
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const isMobile = () => window.innerWidth <= 768;
    const handleScroll = () => {
      if (!isMobile()) { setHeaderHidden(false); return; }
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 80) setHeaderHidden(true);
      else setHeaderHidden(false);
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Search suggestions ──
  const fetchSuggestions = useCallback(async (q) => {
    if (!q || q.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    setSugLoading(true);
    try {
      const res = await fetch(`/api/products?keyword=${encodeURIComponent(q)}&limit=6`);
      const data = await res.json();
      setSuggestions(Array.isArray(data) ? data.slice(0, 6) : []);
      setShowSuggestions(true);
    } catch { setSuggestions([]); }
    finally { setSugLoading(false); }
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    clearTimeout(sugTimer.current);
    sugTimer.current = setTimeout(() => fetchSuggestions(val), 280);
  };

  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!permAsked && !location) {
      const timer = setTimeout(() => setLocPopup(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (locRef.current && !locRef.current.contains(e.target)) setLocPopup(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) { setLocError('Geolocation is not supported.'); return; }
    setLocLoading(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const label = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        setLocation(label);
        localStorage.setItem('dh_location', label);
        setLocLoading(false);
        setLocPopup(false);
        setPermAsked(true);
      },
      (err) => {
        setLocLoading(false);
        setPermAsked(true);
        if (err.code === 1) setLocError('Permission denied. Please allow location access.');
        else setLocError('Could not get location. Please try again.');
      },
      { timeout: 8000 }
    );
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) navigate(`/?search=${searchTerm}`);
  };

  const openDropdown = () => { clearTimeout(closeTimer.current); setDropdownOpen(true); };
  const scheduleClose = () => { closeTimer.current = setTimeout(() => setDropdownOpen(false), 150); };

  useEffect(() => { setDropdownOpen(false); }, [navigate]);

  const displayLocation = location
    ? (location.length > 18 ? location.slice(0, 18) + '…' : location)
    : 'Select Address';

  return (
    <>
      {/* Location popup */}
      {locPopup && (
        <div style={S.popup}>
          <div ref={locRef} style={S.popupCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ background: 'var(--cta-light)', borderRadius: 'var(--radius-md)', padding: '8px', color: 'var(--cta)' }}>
                  <LocateFixed size={18} />
                </div>
                <span style={{ fontWeight: 700, fontSize: 'var(--fs-md)', color: 'var(--text-heading)' }}>Detect your location</span>
              </div>
              <button onClick={() => { setLocPopup(false); setPermAsked(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              Allow DigiHub to access your location for personalized delivery and experience.
            </p>
            {locError && <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--danger)', marginBottom: '0.75rem' }}>{locError}</p>}
            <button
              onClick={detectLocation}
              disabled={locLoading}
              style={{
                width: '100%', background: 'var(--cta)', color: '#fff', border: 'none',
                borderRadius: 'var(--radius-md)', padding: '11px', fontWeight: 700, fontSize: 'var(--fs-base)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                opacity: locLoading ? 0.8 : 1, marginBottom: '0.6rem', fontFamily: 'var(--font)',
              }}
            >
              {locLoading ? <><Loader size={15} className="spin" /> Detecting…</> : <><LocateFixed size={15} /> Use My Current Location</>}
            </button>
            <button
              onClick={() => { navigate('/profile/addresses'); setLocPopup(false); setPermAsked(true); }}
              style={{
                width: '100%', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                padding: '10px', fontWeight: 600, fontSize: 'var(--fs-sm)', cursor: 'pointer', color: 'var(--text-body)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'var(--font)',
              }}
            >
              <MapPin size={14} /> Enter Address Manually
            </button>
          </div>
        </div>
      )}

      <header className={`headroom ${headerHidden ? 'headroom--hidden' : 'headroom--visible'}`} style={S.header}>
        <div className="container header-content" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>

          {/* Logo + Location */}
          <div style={S.logoArea}>
            <Link to="/" className="logo">DigiHub</Link>

            {/* Location widget */}
            <button
              className="location-widget"
              onClick={() => setLocPopup(true)}
              style={S.locationBtn}
              title="Change delivery location"
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>Deliver to</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {locLoading
                  ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} />
                  : <MapPin size={12} color="var(--cta)" />
                }
                <span style={{ fontSize: 'var(--fs-sm)', fontWeight: location ? 700 : 400, color: 'var(--text-heading)', maxWidth: 140, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {locLoading ? 'Detecting…' : displayLocation}
                </span>
                <ChevronDown size={10} color="var(--text-muted)" />
              </div>
            </button>
          </div>

          {/* Search with live suggestions */}
          <div ref={searchRef} className="search-wrapper" style={S.searchWrap}>
            <form className="search-container" onSubmit={handleSearch} style={{ margin: 0 }}>
              <Search className="search-icon" size={16} />
              <input
                type="text"
                className="search-input"
                placeholder="Search for digital products, assets and more"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => { if (searchTerm.length >= 2) setShowSuggestions(true); }}
                autoComplete="off"
              />
              {sugLoading && (
                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                  <Loader size={14} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
                </div>
              )}
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div style={S.sugBox}>
                {suggestions.map(p => (
                  <button key={p._id}
                    onMouseDown={(e) => { e.preventDefault(); navigate(`/product/${p._id}`); setShowSuggestions(false); setSearchTerm(''); }}
                    style={S.sugItem}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-page)' }}>
                      <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.onerror = null; e.target.src = `https://placehold.co/36x36/072654/fff?text=${encodeURIComponent((p.name||'DH').slice(0,2))}`; }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--text-heading)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                      <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', margin: 0 }}>{p.category} · ₹{Math.round(p.price * 86).toLocaleString('en-IN')}</p>
                    </div>
                    <Search size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  </button>
                ))}
                <button
                  onMouseDown={(e) => { e.preventDefault(); handleSearch(e); setShowSuggestions(false); }}
                  style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'var(--bg-page)', cursor: 'pointer', fontSize: 'var(--fs-sm)', color: 'var(--cta)', fontWeight: 700, textAlign: 'center', fontFamily: 'var(--font)' }}
                >
                  See all results for "{searchTerm}" →
                </button>
              </div>
            )}
          </div>

          <div className="nav-actions">
            {/* Account Dropdown */}
            <div className="nav-item" onMouseEnter={openDropdown} onMouseLeave={scheduleClose} style={{ position: 'relative' }}>
              {user
                ? <div style={S.avatar()}>{user.name?.charAt(0) || 'U'}</div>
                : <User size={18} />
              }
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>{user?.name ? user.name.split(' ')[0] : 'Login'}</span>
                {user?.isAdmin && (
                  <span style={{ fontSize: '0.6rem', background: 'var(--primary)', color: '#fff', padding: '1px 5px', borderRadius: 'var(--radius-sm)', marginTop: 1, fontWeight: 700 }}>ADMIN</span>
                )}
              </div>
              <ChevronDown size={12} color="var(--text-muted)" />

              {dropdownOpen && (
                <div className="dropdown-menu" style={{ display: 'flex' }} onMouseEnter={openDropdown} onMouseLeave={scheduleClose}>
                  {user ? (
                    <>
                      <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}><User size={15} /> My Profile</Link>
                      <Link to="/orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}><Package size={15} /> Orders</Link>
                      <Link to="/profile/wishlist" className="dropdown-item" onClick={() => setDropdownOpen(false)}><Heart size={15} /> Wishlist</Link>
                      {user.isSeller
                        ? <Link to="/seller/dashboard" className="dropdown-item" style={{ borderTop: '1px solid var(--border)' }} onClick={() => setDropdownOpen(false)}><Store size={15} /> Seller Dashboard</Link>
                        : <Link to="/become-seller" className="dropdown-item" onClick={() => setDropdownOpen(false)}><Store size={15} /> Become a Seller</Link>
                      }
                      {user.isAdmin && (
                        <Link to="/admin" className="dropdown-item" style={{ borderTop: '1px solid var(--border)' }} onClick={() => setDropdownOpen(false)}><Shield size={15} /> Admin Panel</Link>
                      )}
                      <button onClick={() => { logout(); setDropdownOpen(false); }} className="dropdown-item" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', borderTop: '1px solid var(--border)', fontFamily: 'var(--font)' }}>
                        <LogOut size={15} /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>New here?</span>
                        <Link to="/register" style={{ fontSize: 'var(--fs-sm)', color: 'var(--cta)', fontWeight: 700 }} onClick={() => setDropdownOpen(false)}>Sign Up</Link>
                      </div>
                      <Link to="/login" className="dropdown-item" style={{ background: 'var(--cta)', color: 'white', margin: '8px 12px', borderRadius: 'var(--radius-md)', justifyContent: 'center', fontWeight: 700 }} onClick={() => setDropdownOpen(false)}>
                        Login
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => toggleTheme()}
              className="nav-item"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={S.themeBtn}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              {isDark ? <Sun size={18} style={{ color: 'var(--accent)' }} /> : <Moon size={18} />}
            </button>

            {/* Cart */}
            <Link to="/cart" className="nav-item">
              <div style={{ position: 'relative' }}>
                <ShoppingCart size={18} />
                {cartCount > 0 && <span style={S.badge}>{cartCount}</span>}
              </div>
              <span>Cart</span>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
