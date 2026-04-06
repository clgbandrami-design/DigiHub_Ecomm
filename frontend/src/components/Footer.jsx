import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const sections = [
  { title: 'About', links: [['Contact Us', '/contact'], ['About Us', '/about'], ['Careers', '/careers'], ['DigiHub Stories', '/stories']] },
  { title: 'Help', links: [['Payments', '/help/payments'], ['Shipping', '/help/shipping'], ['Cancellation & Returns', '/help/returns'], ['FAQ', '/help/faq']] },
  { title: 'Policy', links: [['Return Policy', '/policy/returns'], ['Terms of Use', '/policy/terms'], ['Security', '/policy/security'], ['Privacy', '/policy/privacy']] },
  { title: 'Social', links: [['Facebook', 'https://facebook.com'], ['Twitter', 'https://twitter.com'], ['YouTube', 'https://youtube.com']], external: true },
];

const Footer = () => {
  const [openSection, setOpenSection] = useState(null);

  return (
    <footer className="site-footer" style={{ background: 'var(--footer-bg)', color: 'rgba(255,255,255,0.85)', marginTop: '3rem' }}>
      <div className="container">

        {/* Desktop footer */}
        <div className="footer-desktop" style={{
          display: 'grid', gridTemplateColumns: '1.5fr repeat(3, 1fr)',
          gap: '2rem', padding: '2.5rem 0 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          {/* Brand column */}
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, fontStyle: 'italic', color: '#fff', marginBottom: '0.75rem' }}>DigiHub</h3>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 280 }}>
              Your premium marketplace for digital assets, templates, and creative resources. Trusted by 50K+ creators worldwide.
            </p>
          </div>

          {sections.map(sec => (
            <div key={sec.title}>
              <h4 style={{ color: '#f5a623', fontSize: 'var(--fs-xs)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '1rem', fontWeight: 700 }}>{sec.title}</h4>
              <ul style={{ listStyle: 'none' }}>
                {sec.links.map(([label, to]) => (
                  <li key={to} style={{ marginBottom: '0.5rem' }}>
                    {sec.external
                      ? <a href={to} target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 'var(--fs-sm)', transition: 'color 0.15s' }}
                          onMouseEnter={e => e.target.style.color = '#fff'}
                          onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
                        >{label}</a>
                      : <Link to={to} style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 'var(--fs-sm)', transition: 'color 0.15s' }}
                          onMouseEnter={e => e.target.style.color = '#fff'}
                          onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
                        >{label}</Link>
                    }
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile footer — accordion */}
        <div className="footer-mobile" style={{ display: 'none', padding: '0.75rem 0 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, fontStyle: 'italic', color: '#fff' }}>DigiHub</h3>
          </div>
          {sections.map(sec => (
            <div key={sec.title} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                onClick={() => setOpenSection(openSection === sec.title ? null : sec.title)}
                style={{
                  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', padding: '0.7rem 0', cursor: 'pointer',
                  fontSize: 'var(--fs-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font)',
                }}
              >
                {sec.title}
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', transition: 'transform 0.2s', transform: openSection === sec.title ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
              </button>
              {openSection === sec.title && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem 0.75rem', paddingBottom: '0.7rem' }}>
                  {sec.links.map(([label, to]) => (
                    sec.external
                      ? <a key={to} href={to} target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: 'var(--fs-xs)' }}>{label}</a>
                      : <Link key={to} to={to} style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: 'var(--fs-xs)' }}>{label}</Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ padding: '1rem 0', fontSize: 'var(--fs-xs)', color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
          © {new Date().getFullYear()} DigiHub — All rights reserved. Powered with ❤️
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .footer-desktop { display: none !important; }
          .footer-mobile { display: block !important; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
