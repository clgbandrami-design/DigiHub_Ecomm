import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Code, Image as ImageIcon, Music, MonitorPlay, Zap, ShieldCheck, Download, Star } from 'lucide-react';
import Footer from '../components/Footer';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    { icon: <Zap size={24} />, title: "Instant Access", desc: "Download your purchased digital assets instantly. No waiting, no shipping." },
    { icon: <ShieldCheck size={24} />, title: "Secure Transactions", desc: "Bank-grade encryption ensures your payment data is always protected." },
    { icon: <Download size={24} />, title: "Lifetime Updates", desc: "Get free updates forever on supported premium assets." },
  ];

  const categories = [
    { icon: <MonitorPlay size={32} />, name: "UI Templates", dbCategory: "Templates", color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
    { icon: <ImageIcon size={32} />, name: "Graphics", dbCategory: "Graphics", color: "linear-gradient(135deg, #ff0844 0%, #ffb199 100%)" },
    { icon: <Code size={32} />, name: "Code Kits", dbCategory: "Code", color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
    { icon: <Music size={32} />, name: "Audio Loops", dbCategory: "Audio", color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
  ];

  const testimonials = [
    { name: "Sarah J.", role: "UI Designer", quote: "DigiHub has completely transformed my workflow. The UI kits are world-class and saved me weeks of work.", rating: 5 },
    { name: "Michael T.", role: "Indie Developer", quote: "The best marketplace for digital assets. The codebase I bought was pristine and well-documented.", rating: 5 },
    { name: "Priya R.", role: "Content Creator", quote: "Found the exact cinematic LUTs and audio tracks I needed for my YouTube channel. Outstanding quality!", rating: 5 },
  ];

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Hero Section */}
      <section style={{ 
        position: 'relative', 
        padding: '8rem 1rem 6rem', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        {/* Background Gradients */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(102,126,234,0.15) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(60px)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(251,100,27,0.1) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(60px)', zIndex: 0 }} />

        <div style={{ 
          position: 'relative', 
          zIndex: 1, 
          maxWidth: 900,
          opacity: isVisible ? 1 : 0, 
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)', 
          transition: 'opacity 0.8s ease-out, transform 0.8s ease-out' 
        }}>
          <span style={{ 
            display: 'inline-block', 
            background: 'var(--cta-light)', 
            color: 'var(--cta)', 
            padding: '6px 16px', 
            borderRadius: 999, 
            fontSize: '0.85rem', 
            fontWeight: 700, 
            letterSpacing: '0.05em', 
            textTransform: 'uppercase', 
            marginBottom: '1.5rem',
            border: '1px solid rgba(102,126,234,0.2)'
          }}>
            India's Premium Digital Marketplace
          </span>
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', 
            fontWeight: 900, 
            lineHeight: 1.1, 
            color: 'var(--text-heading)', 
            marginBottom: '1.5rem',
            letterSpacing: '-0.02em'
          }}>
            Unlock World-Class <br />
            <span style={{ 
              background: 'linear-gradient(135deg, var(--cta) 0%, #e052a0 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent' 
            }}>Digital Assets</span>
          </h1>
          <p style={{ 
            fontSize: 'clamp(1rem, 2vw, 1.25rem)', 
            color: 'var(--text-muted)', 
            maxWidth: 700, 
            margin: '0 auto 2.5rem', 
            lineHeight: 1.6 
          }}>
            Accelerate your creative projects with high-quality UI kits, templates, graphics, audio tracks, and codebases from top creators.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/store')} 
              style={{ 
                background: 'var(--cta)', 
                color: '#fff', 
                border: 'none', 
                padding: '1rem 2.5rem', 
                borderRadius: 'var(--radius-lg)', 
                fontSize: '1.1rem', 
                fontWeight: 700, 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                boxShadow: '0 8px 20px rgba(102,126,234,0.3)',
                transition: 'transform 0.2s, boxShadow 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(102,126,234,0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(102,126,234,0.3)'; }}
            >
              Explore Marketplace <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => navigate('/become-seller')} 
              style={{ 
                background: 'var(--bg-card)', 
                color: 'var(--text-heading)', 
                border: '1px solid var(--border)', 
                padding: '1rem 2.5rem', 
                borderRadius: 'var(--radius-lg)', 
                fontSize: '1.1rem', 
                fontWeight: 700, 
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-page)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
            >
              Become a Seller
            </button>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section style={{ padding: '4rem 1rem', background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-heading)' }}>Browse by Category</h2>
            <p style={{ color: 'var(--text-muted)' }}>Everything you need for your next big project.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {categories.map((cat, idx) => (
              <div 
                key={idx} 
                onClick={() => navigate(`/store?category=${encodeURIComponent(cat.dbCategory)}`)}
                style={{ 
                  background: 'var(--bg-page)', 
                  padding: '2rem', 
                  borderRadius: 'var(--radius-xl)', 
                  border: '1px solid var(--border)', 
                  textAlign: 'center', 
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ 
                  width: 64, 
                  height: 64, 
                  background: cat.color, 
                  borderRadius: '1rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#fff', 
                  margin: '0 auto 1.5rem' 
                }}>
                  {cat.icon}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-heading)' }}>{cat.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '5rem 1rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '1.5rem', lineHeight: 1.2 }}>
                Why choose <span style={{ color: 'var(--cta)' }}>DigiHub?</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                We've built a platform that puts creators and buyers first. Experience a seamless, secure, and blazing-fast marketplace designed for the modern digital age.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {features.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: '50%', 
                      background: 'rgba(102,126,234,0.1)', 
                      color: 'var(--cta)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {feat.icon}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.3rem' }}>{feat.title}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Visual Glassmorphism Card Element */}
            <div style={{ position: 'relative', height: 400, width: '100%' }}>
               <div style={{ position: 'absolute', top: '10%', right: '10%', width: '80%', height: '80%', background: 'linear-gradient(135deg, var(--cta) 0%, #e052a0 100%)', borderRadius: 'var(--radius-xl)', filter: 'blur(40px)', opacity: 0.4 }} />
               <div style={{ 
                 position: 'absolute', 
                 inset: '10%', 
                 background: 'rgba(255, 255, 255, 0.05)', 
                 backdropFilter: 'blur(20px)', 
                 WebkitBackdropFilter: 'blur(20px)', 
                 borderRadius: 'var(--radius-xl)', 
                 border: '1px solid rgba(255,255,255,0.1)', 
                 boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                 display: 'flex',
                 flexDirection: 'column',
                 alignItems: 'center',
                 justifyContent: 'center',
                 padding: '2rem',
                 textAlign: 'center'
               }}>
                 <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop" alt="Abstract 3D" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', marginBottom: '1.5rem', border: '4px solid rgba(255,255,255,0.2)' }} />
                 <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.5rem' }}>Premium Quality</h3>
                 <p style={{ color: 'var(--text-muted)' }}>Curated by top professionals</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '5rem 1rem', background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-heading)' }}>Loved by Creators</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ 
                background: 'var(--bg-page)', 
                padding: '2rem', 
                borderRadius: 'var(--radius-xl)', 
                border: '1px solid var(--border)' 
              }}>
                <div style={{ display: 'flex', gap: 4, color: '#ffc107', marginBottom: '1rem' }}>
                  {[...Array(t.rating)].map((_, idx) => <Star key={idx} size={18} fill="#ffc107" />)}
                </div>
                <p style={{ fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--text-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>"{t.quote}"</p>
                <div>
                  <h4 style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{t.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-heading)', marginBottom: '1.5rem' }}>Ready to create something amazing?</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Join thousands of creators who are building the future with DigiHub.</p>
          <button 
            onClick={() => navigate('/store')} 
            style={{ 
              background: 'var(--text-heading)', 
              color: 'var(--bg-page)', 
              border: 'none', 
              padding: '1.25rem 3rem', 
              borderRadius: '999px', 
              fontSize: '1.1rem', 
              fontWeight: 800, 
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Go to Store
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
