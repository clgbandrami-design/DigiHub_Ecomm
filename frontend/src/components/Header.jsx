import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Download,
  Heart,
  Loader,
  LocateFixed,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Package,
  Search,
  Shield,
  ShoppingCart,
  Store,
  Sun,
  User,
  X,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ThemeContext } from '../context/ThemeContext';
import api from '../utils/api';

const reverseGeocode = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=12&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await response.json();
    const address = data.address || {};
    const area =
      address.suburb ||
      address.neighbourhood ||
      address.village ||
      address.town ||
      address.city_district ||
      '';
    const city = address.city || address.town || address.county || '';

    return area ? `${area}, ${city}` : city || data.display_name?.split(',')[0] || 'Your Location';
  } catch {
    return 'Your Location';
  }
};

const formatPrice = (usd) => `Rs. ${Math.round(Number(usd || 0) * 86).toLocaleString('en-IN')}`;

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [sugLoading, setSugLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationLabel, setLocationLabel] = useState(() => localStorage.getItem('dh_location') || '');
  const [locLoading, setLocLoading] = useState(false);
  const [locPopup, setLocPopup] = useState(false);
  const [locError, setLocError] = useState('');
  const [permAsked, setPermAsked] = useState(Boolean(localStorage.getItem('dh_location')));

  const navigate = useNavigate();
  const currentRoute = useLocation();
  const searchRef = useRef(null);
  const locRef = useRef(null);
  const sugTimer = useRef(null);
  const closeTimer = useRef(null);
  const lastScrollY = useRef(0);
  const [headerHidden, setHeaderHidden] = useState(false);

  const cartCount = cartItems?.reduce((total, item) => total + item.qty, 0) || 0;
  const displayLocation = locationLabel
    ? locationLabel.length > 18
      ? `${locationLabel.slice(0, 18)}...`
      : locationLabel
    : 'Select Address';

  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSugLoading(true);
    try {
      const { data } = await api.get('/api/products/ai/search-recommendations', {
        params: { q: query.trim(), limit: 6 },
      });
      setSuggestions(Array.isArray(data.recommendations) ? data.recommendations : []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Search suggestions failed:', error);
      setSuggestions([]);
    } finally {
      setSugLoading(false);
    }
  }, []);

  useEffect(() => {
    const isMobile = () => window.innerWidth <= 768;
    const handleScroll = () => {
      if (!isMobile()) {
        setHeaderHidden(false);
        return;
      }

      const currentY = window.scrollY;
      setHeaderHidden(currentY > lastScrollY.current && currentY > 80);
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const closeSuggestions = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    const closeLocationPopup = (event) => {
      if (locRef.current && !locRef.current.contains(event.target)) {
        setLocPopup(false);
      }
    };

    document.addEventListener('mousedown', closeSuggestions);
    document.addEventListener('mousedown', closeLocationPopup);

    return () => {
      document.removeEventListener('mousedown', closeSuggestions);
      document.removeEventListener('mousedown', closeLocationPopup);
    };
  }, []);

  useEffect(() => {
    if (!permAsked && !locationLabel) {
      const timer = window.setTimeout(() => setLocPopup(true), 1200);
      return () => window.clearTimeout(timer);
    }
  }, [locationLabel, permAsked]);

  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [currentRoute.pathname]);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported in this browser.');
      return;
    }

    setLocLoading(true);
    setLocError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const label = await reverseGeocode(position.coords.latitude, position.coords.longitude);
        setLocationLabel(label);
        localStorage.setItem('dh_location', label);
        setPermAsked(true);
        setLocLoading(false);
        setLocPopup(false);
      },
      (error) => {
        setPermAsked(true);
        setLocLoading(false);
        setLocError(
          error.code === 1
            ? 'Permission denied. Please allow location access.'
            : 'Could not detect location. Please try again.'
        );
      },
      { timeout: 8000 }
    );
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;
    navigate(`/store?search=${encodeURIComponent(query)}`);
    setShowSuggestions(false);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    window.clearTimeout(sugTimer.current);
    sugTimer.current = window.setTimeout(() => fetchSuggestions(value), 250);
  };

  const openDropdown = () => {
    window.clearTimeout(closeTimer.current);
    setDropdownOpen(true);
  };

  const scheduleClose = () => {
    closeTimer.current = window.setTimeout(() => setDropdownOpen(false), 350);
  };

  const accountLinks = user
    ? [
        { to: '/profile', icon: <User size={15} />, label: 'My Profile' },
        { to: '/orders', icon: <Package size={15} />, label: 'Orders' },
        { to: '/profile/downloads', icon: <Download size={15} />, label: 'My Downloads' },
        { to: '/profile/wishlist', icon: <Heart size={15} />, label: 'Wishlist' },
        user.isSeller
          ? { to: '/seller/dashboard', icon: <Store size={15} />, label: 'Seller Dashboard' }
          : { to: '/become-seller', icon: <Store size={15} />, label: 'Become a Seller' },
        ...(user.isAdmin
          ? [{ to: '/admin', icon: <Shield size={15} />, label: 'Admin Panel' }]
          : []),
      ]
    : [];

  return (
    <>
      {locPopup && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '4.5rem',
          }}
        >
          <div
            ref={locRef}
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem 2rem',
              maxWidth: 400,
              width: '90%',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div
                  style={{
                    background: 'var(--cta-light)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px',
                    color: 'var(--cta)',
                  }}
                >
                  <LocateFixed size={18} />
                </div>
                <span style={{ fontWeight: 700, fontSize: 'var(--fs-md)', color: 'var(--text-heading)' }}>
                  Detect your location
                </span>
              </div>
              <button
                onClick={() => {
                  setLocPopup(false);
                  setPermAsked(true);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              Allow DigiHub to access your location for a more realistic marketplace experience.
            </p>

            {locError && (
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--danger)', marginBottom: '0.75rem' }}>
                {locError}
              </p>
            )}

            <button
              onClick={detectLocation}
              disabled={locLoading}
              style={{
                width: '100%',
                background: 'var(--cta)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '11px',
                fontWeight: 700,
                fontSize: 'var(--fs-base)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                opacity: locLoading ? 0.8 : 1,
                marginBottom: '0.6rem',
                fontFamily: 'var(--font)',
              }}
            >
              {locLoading ? (
                <>
                  <Loader size={15} className="spin" /> Detecting...
                </>
              ) : (
                <>
                  <LocateFixed size={15} /> Use My Current Location
                </>
              )}
            </button>

            <button
              onClick={() => {
                navigate('/profile/addresses');
                setLocPopup(false);
                setPermAsked(true);
              }}
              style={{
                width: '100%',
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '10px',
                fontWeight: 600,
                fontSize: 'var(--fs-sm)',
                cursor: 'pointer',
                color: 'var(--text-body)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontFamily: 'var(--font)',
              }}
            >
              <MapPin size={14} /> Enter Address Manually
            </button>
          </div>
        </div>
      )}

      <header
        className={`headroom ${headerHidden ? 'headroom--hidden' : 'headroom--visible'}`}
        style={{
          overflow: 'visible',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: 'var(--header-bg)',
          borderBottom: '1px solid var(--header-border)',
        }}
      >
        <div className="container header-content" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 0 auto' }}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="mobile-menu-toggle"
              style={{ background: 'none', border: 'none', display: 'none', color: 'var(--text-body)', cursor: 'pointer' }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <Link to="/" className="logo">
              DigiHub
            </Link>

            <button
              className="location-widget"
              onClick={() => setLocPopup(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-body)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '1px',
                padding: '4px 8px',
                borderRadius: 'var(--radius-md)',
                transition: 'background 0.15s',
              }}
            >
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Deliver to
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {locLoading ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <MapPin size={12} color="var(--cta)" />}
                <span
                  style={{
                    fontSize: 'var(--fs-sm)',
                    fontWeight: locationLabel ? 700 : 400,
                    color: 'var(--text-heading)',
                    maxWidth: 140,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {locLoading ? 'Detecting...' : displayLocation}
                </span>
                <ChevronDown size={10} color="var(--text-muted)" />
              </div>
            </button>
          </div>

          <div ref={searchRef} className="search-wrapper" style={{ flex: 1, minWidth: '120px', position: 'relative' }}>
            <form className="search-container" onSubmit={handleSearch} style={{ margin: 0 }}>
              <Search className="search-icon" size={16} />
              <input
                type="text"
                className="search-input"
                placeholder="Search for digital products, assets and more"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (searchTerm.trim().length >= 2) setShowSuggestions(true);
                }}
                autoComplete="off"
              />
              {sugLoading && (
                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                  <Loader size={14} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
                </div>
              )}
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 2000,
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                }}
              >
                {suggestions.map((product) => (
                  <button
                    key={product._id}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      navigate(`/product/${product._id}`);
                      setShowSuggestions(false);
                      setSearchTerm('');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      width: '100%',
                      padding: '10px 16px',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: 'var(--bg-page)',
                      }}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(event) => {
                          event.target.onerror = null;
                          event.target.src = `https://placehold.co/36x36/072654/fff?text=${encodeURIComponent((product.name || 'DH').slice(0, 2))}`;
                        }}
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 'var(--fs-sm)',
                          fontWeight: 600,
                          color: 'var(--text-heading)',
                          margin: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {product.name}
                      </p>
                      <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', margin: 0 }}>
                        {product.category} · {formatPrice(product.price)}
                      </p>
                    </div>
                    <Search size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  </button>
                ))}

                <button
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleSearch(event);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    border: 'none',
                    background: 'var(--bg-page)',
                    cursor: 'pointer',
                    fontSize: 'var(--fs-sm)',
                    color: 'var(--cta)',
                    fontWeight: 700,
                    textAlign: 'center',
                    fontFamily: 'var(--font)',
                  }}
                >
                  See all results for "{searchTerm}" →
                </button>
              </div>
            )}
          </div>

          <div className={`nav-actions ${mobileMenuOpen ? 'nav-actions--open' : ''}`}>
            <Link to="/store" className="nav-item" style={{ fontWeight: 600 }}>
              <Store size={18} />
              <span>Store</span>
            </Link>

            <Link to="/cart" className="nav-item">
              <div style={{ position: 'relative' }}>
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -8,
                      background: 'var(--danger)',
                      borderRadius: 'var(--radius-full)',
                      padding: '1px 5px',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      color: '#fff',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </div>
              <span>Cart</span>
            </Link>

            <button
              onClick={toggleTheme}
              className="nav-item"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-body)',
                display: 'flex',
                alignItems: 'center',
                padding: '6px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {isDark ? <Sun size={18} style={{ color: 'var(--accent)' }} /> : <Moon size={18} />}
            </button>

            <div
              className="nav-item"
              onMouseEnter={openDropdown}
              onMouseLeave={scheduleClose}
              style={{ position: 'relative' }}
            >
              {user ? (
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 'var(--radius-full)',
                    background: 'linear-gradient(135deg, var(--cta), var(--primary))',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    flexShrink: 0,
                  }}
                >
                  {user.name?.charAt(0) || 'U'}
                </div>
              ) : (
                <User size={18} />
              )}

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>
                  {user?.name ? user.name.split(' ')[0] : 'Login'}
                </span>
                {user?.isAdmin && (
                  <span
                    style={{
                      fontSize: '0.6rem',
                      background: 'var(--primary)',
                      color: '#fff',
                      padding: '1px 5px',
                      borderRadius: 'var(--radius-sm)',
                      marginTop: 1,
                      fontWeight: 700,
                    }}
                  >
                    ADMIN
                  </span>
                )}
              </div>
              <ChevronDown size={12} color="var(--text-muted)" />

              {dropdownOpen && (
                <div className="dropdown-menu" style={{ display: 'flex' }} onMouseEnter={openDropdown} onMouseLeave={scheduleClose}>
                  {user ? (
                    <>
                      {accountLinks.map((item, index) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="dropdown-item"
                          style={index >= 4 ? { borderTop: '1px solid var(--border)' } : undefined}
                          onClick={() => setDropdownOpen(false)}
                        >
                          {item.icon} {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                        }}
                        className="dropdown-item"
                        style={{
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          borderTop: '1px solid var(--border)',
                          fontFamily: 'var(--font)',
                        }}
                      >
                        <LogOut size={15} /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <div
                        style={{
                          padding: '10px 20px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>New here?</span>
                        <Link
                          to="/register"
                          style={{ fontSize: 'var(--fs-sm)', color: 'var(--cta)', fontWeight: 700 }}
                          onClick={() => setDropdownOpen(false)}
                        >
                          Sign Up
                        </Link>
                      </div>
                      <Link
                        to="/login"
                        className="dropdown-item"
                        style={{
                          background: 'var(--cta)',
                          color: 'white',
                          margin: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          justifyContent: 'center',
                          fontWeight: 700,
                        }}
                        onClick={() => setDropdownOpen(false)}
                      >
                        Login
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
