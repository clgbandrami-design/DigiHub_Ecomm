import React from 'react';

/**
 * CategoryBar — Flipkart-style horizontal category strip with simple
 * monochrome line-art SVG icons + short labels. No colour fills.
 *
 * Each icon is a hand-crafted, minimal SVG that conveys the category
 * at a glance, similar to the reference image the user provided.
 */

/* ── SVG icon components (stroke-only, 28×28 viewBox) ── */
const iconStyle = { width: 28, height: 28, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

const Icons = {
  All: (
    <svg style={iconStyle} viewBox="0 0 28 28">
      {/* Grid / dashboard */}
      <rect x="4" y="4" width="8" height="8" rx="1.5" />
      <rect x="16" y="4" width="8" height="8" rx="1.5" />
      <rect x="4" y="16" width="8" height="8" rx="1.5" />
      <rect x="16" y="16" width="8" height="8" rx="1.5" />
    </svg>
  ),
  Templates: (
    <svg style={iconStyle} viewBox="0 0 28 28">
      {/* Document / page template */}
      <rect x="5" y="3" width="18" height="22" rx="2" />
      <line x1="9" y1="8" x2="19" y2="8" />
      <line x1="9" y1="12" x2="19" y2="12" />
      <line x1="9" y1="16" x2="15" y2="16" />
    </svg>
  ),
  Graphics: (
    <svg style={iconStyle} viewBox="0 0 28 28">
      {/* Pen tool / bezier */}
      <path d="M14 4 L4 20 L14 16 L24 20 Z" />
      <circle cx="14" cy="4" r="1.5" />
      <circle cx="4" cy="20" r="1.5" />
      <circle cx="24" cy="20" r="1.5" />
    </svg>
  ),
  Audio: (
    <svg style={iconStyle} viewBox="0 0 28 28">
      {/* Headphones */}
      <path d="M6 16 V14 A8 8 0 0 1 22 14 V16" />
      <rect x="3" y="16" width="4" height="7" rx="1.5" />
      <rect x="21" y="16" width="4" height="7" rx="1.5" />
    </svg>
  ),
  Photography: (
    <svg style={iconStyle} viewBox="0 0 28 28">
      {/* Camera */}
      <rect x="3" y="9" width="22" height="14" rx="2.5" />
      <path d="M10 9 L11.5 5.5 H16.5 L18 9" />
      <circle cx="14" cy="16" r="4" />
      <circle cx="14" cy="16" r="1.5" />
    </svg>
  ),
  Fonts: (
    <svg style={iconStyle} viewBox="0 0 28 28">
      {/* Typography "A" */}
      <path d="M8 22 L14 6 L20 22" />
      <line x1="10" y1="17" x2="18" y2="17" />
      <line x1="6" y1="22" x2="10" y2="22" />
      <line x1="18" y1="22" x2="22" y2="22" />
    </svg>
  ),
  Code: (
    <svg style={iconStyle} viewBox="0 0 28 28">
      {/* Code brackets */}
      <polyline points="10,7 5,14 10,21" />
      <polyline points="18,7 23,14 18,21" />
      <line x1="15" y1="5" x2="13" y2="23" />
    </svg>
  ),
  Video: (
    <svg style={iconStyle} viewBox="0 0 28 28">
      {/* Play button / clapperboard */}
      <rect x="3" y="6" width="22" height="16" rx="2.5" />
      <polygon points="12,10 12,18 19,14" />
    </svg>
  ),
};

/* ── Styles ── */
const barStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 0,
  overflowX: 'auto',
  overflowY: 'hidden',
  padding: '10px 0 6px',
  background: 'var(--bg-card)',
  borderBottom: '1px solid var(--border)',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  WebkitOverflowScrolling: 'touch',
};

const itemBaseStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: '4px',
  minWidth: 90,
  padding: '6px 8px 8px',
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  color: 'var(--text-body)',
  transition: 'color 0.15s',
  position: 'relative',
  flexShrink: 0,
};

const labelStyle = {
  fontSize: '0.7rem',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  letterSpacing: '0.01em',
  lineHeight: 1.2,
  fontFamily: 'var(--font)',
};

const underlineStyle = {
  position: 'absolute',
  bottom: 0,
  left: '20%',
  right: '20%',
  height: 2.5,
  borderRadius: 2,
  background: 'var(--cta)',
  transition: 'opacity 0.15s',
};

const CategoryBar = ({ active, onSelect }) => {
  const categories = ['All', 'Templates', 'Graphics', 'Audio', 'Photography', 'Fonts', 'Code', 'Video'];

  return (
    <div className="category-bar hide-scrollbar" style={barStyle}>
      {categories.map((cat) => {
        const isActive = active === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            style={{
              ...itemBaseStyle,
              color: isActive ? 'var(--cta)' : 'var(--text-body)',
              fontWeight: isActive ? 700 : 500,
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.color = 'var(--text-heading)';
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.color = 'var(--text-body)';
            }}
            title={cat}
          >
            {/* Icon */}
            <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {Icons[cat]}
            </div>
            {/* Label */}
            <span style={{
              ...labelStyle,
              color: isActive ? 'var(--cta)' : 'var(--text-body)',
            }}>
              {cat === 'Photography' ? 'Photos' : cat}
            </span>
            {/* Active underline */}
            <span style={{ ...underlineStyle, opacity: isActive ? 1 : 0 }} />
          </button>
        );
      })}
    </div>
  );
};

export default CategoryBar;
