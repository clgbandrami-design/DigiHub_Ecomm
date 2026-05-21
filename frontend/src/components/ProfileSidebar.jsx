import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Download, Package, User, MapPin, CreditCard, Heart, Power } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const ProfileSidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    textDecoration: 'none',
    color: isActive(path) ? 'var(--cta)' : 'var(--text-body)',
    fontSize: 'var(--fs-base)',
    fontWeight: isActive(path) ? 700 : 500,
    padding: '8px 0',
    display: 'block',
    borderLeft: isActive(path) ? '3px solid var(--cta)' : '3px solid transparent',
    paddingLeft: '12px',
    transition: 'all 0.15s',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
      {/* Avatar card */}
      <div style={{
        background: 'var(--bg-card)', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px',
        borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--radius-full)',
          background: 'linear-gradient(135deg, var(--cta), var(--primary))', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem', fontWeight: 800, flexShrink: 0, textTransform: 'uppercase',
        }}>
          {user.name?.charAt(0) || 'U'}
        </div>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>Hello,</span>
          <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-heading)' }}>{user.name}</h3>
        </div>
      </div>

      {/* Nav card */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border)', overflow: 'hidden',
      }}>
        {/* My Orders */}
        <Link to="/orders" style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px',
          color: 'var(--cta)', fontWeight: 700, fontSize: 'var(--fs-sm)',
          textDecoration: 'none', borderBottom: '1px solid var(--border)', letterSpacing: '0.03em',
        }}>
          <Package size={16} /> MY ORDERS
        </Link>

        {/* Account Settings */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--cta)', fontWeight: 700, fontSize: 'var(--fs-sm)', marginBottom: '8px', letterSpacing: '0.03em' }}>
            <User size={16} /> ACCOUNT SETTINGS
          </div>
          <div style={{ paddingLeft: '26px', display: 'flex', flexDirection: 'column' }}>
            <Link to="/profile" style={linkStyle('/profile')}>Profile Information</Link>
            <Link to="/profile/addresses" style={linkStyle('/profile/addresses')}>Billing Address</Link>
          </div>
        </div>

        {/* Payments */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--cta)', fontWeight: 700, fontSize: 'var(--fs-sm)', marginBottom: '8px', letterSpacing: '0.03em' }}>
            <CreditCard size={16} /> PAYMENTS
          </div>
          <div style={{ paddingLeft: '26px', display: 'flex', flexDirection: 'column' }}>
            <Link to="/profile/saved-cards" style={linkStyle('/profile/saved-cards')}>Saved Cards</Link>
          </div>
        </div>

        {/* My Stuff */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--cta)', fontWeight: 700, fontSize: 'var(--fs-sm)', marginBottom: '8px', letterSpacing: '0.03em' }}>
            <Heart size={16} /> MY STUFF
          </div>
          <div style={{ paddingLeft: '26px', display: 'flex', flexDirection: 'column' }}>
            <Link to="/profile/downloads" style={linkStyle('/profile/downloads')}><Download size={14} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />My Downloads</Link>
            <Link to="/profile/wishlist" style={linkStyle('/profile/wishlist')}>My Wishlist</Link>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => { logout(); navigate('/login'); }}
          style={{
            width: '100%', padding: '14px 20px', background: 'none', border: 'none',
            display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-body)',
            fontWeight: 700, fontSize: 'var(--fs-sm)', cursor: 'pointer', letterSpacing: '0.03em',
            fontFamily: 'var(--font)', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <Power size={16} color="var(--cta)" /> LOGOUT
        </button>
      </div>
    </div>
  );
};

export default ProfileSidebar;
