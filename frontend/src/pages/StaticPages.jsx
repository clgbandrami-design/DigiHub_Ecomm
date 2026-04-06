import React from 'react';
import Footer from '../components/Footer';

// Reusable static page layout for footer pages
const StaticPage = ({ title, children }) => (
  <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', padding: '2rem 2.5rem', maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-heading)', borderBottom: '2px solid var(--cta)', paddingBottom: '0.75rem', display: 'inline-block' }}>{title}</h1>
        <div style={{ color: 'var(--text-body)', lineHeight: 1.8, fontSize: 'var(--fs-base)' }}>{children}</div>
      </div>
    </div>
    <Footer />
  </div>
);

// ── About pages ─────────────────────────────────

export const AboutPage = () => (
  <StaticPage title="About DigiHub">
    <p>DigiHub is India's premier marketplace for high-quality digital assets. We connect talented creators with professionals and businesses seeking premium digital resources.</p>
    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '1.5rem 0 0.75rem' }}>Our Mission</h2>
    <p>To democratize access to world-class digital tools and empower every creator, developer, and business with the assets they need to succeed.</p>
    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '1.5rem 0 0.75rem' }}>What We Offer</h2>
    <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <li>UI/UX Templates & Design Systems</li>
      <li>Royalty-free audio tracks and sound effects</li>
      <li>Photography presets and stock photo bundles</li>
      <li>Premium font collections</li>
      <li>Code libraries and developer tools</li>
      <li>Motion graphics and video LUTs</li>
    </ul>
  </StaticPage>
);

export const ContactPage = () => (
  <StaticPage title="Contact Us">
    <p>We'd love to hear from you. Reach out to us through any of the channels below:</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
      {[
        { icon: '📧', label: 'Email', value: 'clgbandrami@gmail.com' },
        { icon: '💬', label: 'Live Chat', value: 'Available Mon–Sat, 9AM–6PM IST' },
        { icon: '📍', label: 'Office', value: 'Bangalore, Karnataka, India' },
        { icon: '⏱️', label: 'Response Time', value: 'Within 24 business hours' },
      ].map(c => (
        <div key={c.label} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{c.icon}</div>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>{c.label}</div>
          <div style={{ color: '#666', fontSize: '0.82rem' }}>{c.value}</div>
        </div>
      ))}
    </div>
  </StaticPage>
);

export const CareersPage = () => {
  const [applying, setApplying] = React.useState(null); // job object user is applying to
  const [form, setForm] = React.useState({ name: '', email: '', resumeUrl: '', cover: '' });
  const [submitted, setSubmitted] = React.useState(false);

  const jobs = [
    { role: 'Full Stack Developer', type: 'Remote · Full-time', dept: 'Engineering', icon: '💻', desc: 'Build and maintain scalable features across the DigiHub platform using React, Node.js, and MongoDB.' },
    { role: 'UI/UX Designer', type: 'Bangalore · Full-time', dept: 'Design', icon: '🎨', desc: 'Design beautiful, intuitive product experiences for web and mobile, using Figma and modern design systems.' },
    { role: 'Product Manager', type: 'Remote · Full-time', dept: 'Product', icon: '📊', desc: 'Define product roadmaps, prioritize features, and work closely with engineering and design teams.' },
    { role: 'Digital Marketing Lead', type: 'Remote · Full-time', dept: 'Marketing', icon: '📣', desc: 'Drive growth through SEO, content marketing, paid ads, and creator partnerships.' },
    { role: 'Customer Support Lead', type: 'Remote · Part-time', dept: 'Operations', icon: '🤝', desc: 'Help buyers and sellers resolve issues and ensure a smooth experience on the platform.' },
  ];

  const openApply = (job) => {
    setApplying(job);
    setSubmitted(false);
    setForm({ name: '', email: '', resumeUrl: '', cover: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputSt = { width: '100%', padding: '11px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--fs-base)', outline: 'none', fontFamily: 'var(--font)' };
  const labelSt = { display: 'block', fontWeight: 600, fontSize: 'var(--fs-sm)', marginBottom: '6px', color: 'var(--text-muted)' };

  return (
    <>
      {/* Apply Modal */}
      {applying && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: '2rem', maxWidth: 480, width: '100%', boxShadow: 'var(--shadow-xl)', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border)' }}>
            {!submitted ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{applying.dept}</p>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Apply: {applying.role}</h3>
                    <p style={{ fontSize: '0.78rem', color: '#666', marginTop: '0.2rem' }}>{applying.type}</p>
                  </div>
                  <button onClick={() => setApplying(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#666', padding: '0 0.25rem' }}>✕</button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <div>
                    <label style={labelSt}>Full Name *</label>
                    <input style={inputSt} required placeholder="Your full name" value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelSt}>Email Address *</label>
                    <input style={inputSt} required type="email" placeholder="you@example.com" value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelSt}>Resume / Portfolio Link *</label>
                    <input style={inputSt} required type="url" placeholder="https://drive.google.com/... or LinkedIn" value={form.resumeUrl}
                      onChange={e => setForm(f => ({ ...f, resumeUrl: e.target.value }))} />
                    <p style={{ fontSize: '0.72rem', color: '#888', marginTop: '0.3rem' }}>Google Drive, Dropbox, LinkedIn, Portfolio, GitHub — any public link works.</p>
                  </div>
                  <div>
                    <label style={labelSt}>Cover Note (optional)</label>
                    <textarea style={{ ...inputSt, resize: 'vertical' }} rows={3} placeholder="Why do you want to join DigiHub? What makes you a great fit?" value={form.cover}
                      onChange={e => setForm(f => ({ ...f, cover: e.target.value }))} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button type="submit" style={{ flex: 1, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 6, padding: '0.75rem', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                      Submit Application
                    </button>
                    <button type="button" onClick={() => setApplying(null)} style={{ padding: '0.75rem 1.25rem', border: '1px solid #ddd', borderRadius: 6, background: 'none', cursor: 'pointer', color: '#555', fontWeight: 600, fontSize: '0.875rem' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Application Sent!</h3>
                <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Thank you for applying for <strong>{applying.role}</strong>. Our team will review your application and get back to you at <strong>{form.email}</strong> within 5–7 business days.
                </p>
                <button onClick={() => setApplying(null)} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 6, padding: '0.7rem 2rem', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                  Back to Careers
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <StaticPage title="Careers at DigiHub">
        <p>Join our fast-growing team and help build the future of digital commerce in India.</p>

        {/* Culture bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', margin: '1.25rem 0 1.75rem' }}>
          {[['🏠', 'Remote First'], ['📈', 'Fast Growth'], ['💰', 'Competitive Pay'], ['🎯', 'Ownership Culture']].map(([icon, label]) => (
            <div key={label} style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: '0.85rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{icon}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#333' }}>{label}</div>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Open Positions</h2>
        {jobs.map(j => (
          <div key={j.role} style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: '1rem 1.25rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flex: 1 }}>
                <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{j.icon}</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{j.role}</p>
                  <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.4rem' }}>{j.dept} · {j.type}</p>
                  <p style={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.5 }}>{j.desc}</p>
                </div>
              </div>
              <button
                onClick={() => openApply(j)}
                style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '0.45rem 1.1rem', borderRadius: 5, fontSize: '0.82rem', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                Apply →
              </button>
            </div>
          </div>
        ))}
        <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '1rem' }}>
          Don't see a role that fits? Send your profile to <strong>careers@digihub.com</strong> — we're always looking for great people.
        </p>
      </StaticPage>
    </>
  );
};

export const StoriesPage = () => (
  <StaticPage title="DigiHub Stories">
    <p>Discover how creators and businesses across India are using DigiHub to grow faster.</p>
    {[
      { name: 'Priya Sharma', role: 'UI Designer · Mumbai', story: 'I sold my first UI kit on DigiHub and earned ₹40,000 in the first month. The platform makes it incredibly easy to reach buyers.', avatar: '🎨' },
      { name: 'Arjun Mehta', role: 'Developer · Bangalore', story: 'My React component library went from ₹0 to ₹1.5L in passive income within 6 months. DigiHub is a game changer for developers.', avatar: '💻' },
      { name: 'Nisha Patel', role: 'Photographer · Ahmedabad', story: 'I listed my Lightroom preset packs and the orders just kept coming. DigiHub handles payments so I can focus on creating.', avatar: '📸' },
    ].map(s => (
      <div key={s.name} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.25rem', marginBottom: '1rem', background: '#fafafa' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>{s.avatar}</div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>{s.name}</p>
            <p style={{ fontSize: '0.75rem', color: '#666', margin: 0 }}>{s.role}</p>
          </div>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#444', fontStyle: 'italic' }}>"{s.story}"</p>
      </div>
    ))}
  </StaticPage>
);

// ── Help pages ─────────────────────────────────

export const PaymentsHelpPage = () => (
  <StaticPage title="Payments">
    <p>DigiHub supports multiple secure payment methods for your convenience.</p>
    {[
      { icon: '💳', title: 'Credit / Debit Cards', desc: 'Visa, Mastercard, and RuPay cards accepted.' },
      { icon: '📱', title: 'UPI', desc: 'Pay instantly with GPay, PhonePe, Paytm, or any UPI app.' },
      { icon: '🏦', title: 'Net Banking', desc: 'Supported by 30+ Indian banks.' },
      { icon: '💰', title: 'EMI', desc: 'No-cost EMI available on select cards for orders above ₹3,000.' },
    ].map(p => (
      <div key={p.title} style={{ display: 'flex', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid #f0f0f0' }}>
        <span style={{ fontSize: '1.5rem' }}>{p.icon}</span>
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{p.title}</p>
          <p style={{ fontSize: '0.875rem', color: '#555' }}>{p.desc}</p>
        </div>
      </div>
    ))}
  </StaticPage>
);

export const ShippingPage = () => (
  <StaticPage title="Delivery & Access">
    <p>All products on DigiHub are <strong>instant digital downloads</strong> — no physical shipping involved.</p>
    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '1.5rem 0 0.75rem' }}>How it works</h2>
    {['After payment, your download link is instantly available in your account.','Access your purchases anytime from My Account → My Purchased Assets.','All files are hosted on secure servers with 99.9% uptime.'].map((step, i) => (
      <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
        <p style={{ fontSize: '0.875rem', color: '#444' }}>{step}</p>
      </div>
    ))}
  </StaticPage>
);

export const ReturnsHelpPage = () => (
  <StaticPage title="Cancellation & Returns">
    <p>Due to the digital nature of our products, we have a clear and fair refund policy.</p>
    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '1.5rem 0 0.75rem' }}>Eligibility for Refund</h2>
    <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#444' }}>
      <li>You can request a refund within <strong>7 days</strong> of purchase if the product does not match its description.</li>
      <li>If the download link is broken or the file is corrupted, we will send a replacement or full refund.</li>
      <li>Refunds are not available after the file has been successfully downloaded and accessed.</li>
    </ul>
    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '1.5rem 0 0.75rem' }}>How to Request</h2>
    <p style={{ fontSize: '0.875rem', color: '#444' }}>Email <strong>refunds@digihub.com</strong> with your order ID and reason. Our team will respond within 24 hours.</p>
  </StaticPage>
);

export const FaqPage = () => (
  <StaticPage title="Frequently Asked Questions">
    {[
      { q: 'What is DigiHub?', a: 'DigiHub is a marketplace for premium digital assets including UI kits, fonts, audio, code, photography presets, and more.' },
      { q: 'Are the products royalty-free?', a: 'Yes. All products on DigiHub include a commercial license allowing use in personal and client projects.' },
      { q: 'How do I access my purchases?', a: 'After payment, go to My Account → My Purchased Assets. Download links are available instantly.' },
      { q: 'Can I sell my own products?', a: 'Yes! Apply to become a seller from the Account menu. Our team reviews applications within 48 hours.' },
      { q: 'Is my payment information secure?', a: 'Absolutely. We never store card details. All transactions are processed through PCI-DSS compliant gateways.' },
    ].map((item, i) => (
      <div key={i} style={{ paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid #f0f0f0' }}>
        <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem', color: '#212121' }}>Q. {item.q}</p>
        <p style={{ fontSize: '0.875rem', color: '#555' }}>A. {item.a}</p>
      </div>
    ))}
  </StaticPage>
);

// ── Policy pages ─────────────────────────────────

export const ReturnPolicyPage = () => (
  <StaticPage title="Return Policy">
    <p>Last updated: March 2026</p>
    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '1.5rem 0 0.5rem' }}>Digital Products</h2>
    <p style={{ fontSize: '0.875rem', color: '#444' }}>All purchases are final once a digital file has been downloaded. We offer refunds only in cases where: (1) the file is corrupt or inaccessible, or (2) the product materially differs from its description.</p>
    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '1.5rem 0 0.5rem' }}>Refund Process</h2>
    <p style={{ fontSize: '0.875rem', color: '#444' }}>Approved refunds are processed within 5–7 business days to the original payment method.</p>
  </StaticPage>
);

export const TermsPage = () => (
  <StaticPage title="Terms of Use">
    <p style={{ fontSize: '0.875rem', color: '#444' }}>By using DigiHub, you agree to these terms. Please read them carefully.</p>
    {['You must be 18 years or older to make purchases.','Commercial license included with every purchase for use in client projects.','Redistribution or resale of raw asset files is strictly prohibited.','DigiHub reserves the right to remove products that violate intellectual property rights.','We are not liable for indirect damages arising from the use of purchased assets.'].map((t, i) => (
      <p key={i} style={{ fontSize: '0.875rem', color: '#444', padding: '0.6rem 0', borderBottom: '1px solid #f0f0f0' }}><strong>{i + 1}.</strong> {t}</p>
    ))}
  </StaticPage>
);

export const SecurityPage = () => (
  <StaticPage title="Security">
    <p>Your security is our top priority. Here's how we protect you:</p>
    {[
      { icon: '🔒', title: 'SSL Encryption', desc: 'All data is transmitted over HTTPS using 256-bit SSL encryption.' },
      { icon: '🛡️', title: 'PCI-DSS Compliance', desc: 'Payments are processed through certified gateways. We never store card numbers.' },
      { icon: '🔑', title: 'Account Security', desc: 'All accounts require email OTP verification. Passwords are hashed with bcrypt.' },
      { icon: '📊', title: 'Data Protection', desc: 'Your personal information is never sold to third parties.' },
    ].map(s => (
      <div key={s.title} style={{ display: 'flex', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid #f0f0f0' }}>
        <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{s.title}</p>
          <p style={{ fontSize: '0.875rem', color: '#555' }}>{s.desc}</p>
        </div>
      </div>
    ))}
  </StaticPage>
);

export const PrivacyPage = () => (
  <StaticPage title="Privacy Policy">
    <p style={{ fontSize: '0.875rem', color: '#444' }}>Last updated: March 2026. DigiHub is committed to protecting your privacy.</p>
    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '1.5rem 0 0.5rem' }}>What we collect</h2>
    <p style={{ fontSize: '0.875rem', color: '#444' }}>Name, email address, purchase history, and device information for analytics.</p>
    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '1.5rem 0 0.5rem' }}>How we use it</h2>
    <p style={{ fontSize: '0.875rem', color: '#444' }}>To process orders, provide customer support, and improve our platform experience. We do not sell your data.</p>
    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '1.5rem 0 0.5rem' }}>Your rights</h2>
    <p style={{ fontSize: '0.875rem', color: '#444' }}>You may request access, correction, or deletion of your data at any time by emailing privacy@digihub.com.</p>
  </StaticPage>
);

export default StaticPage;
