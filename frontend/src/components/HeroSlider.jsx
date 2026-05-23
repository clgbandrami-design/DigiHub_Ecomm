import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      title: 'Premium Digital Assets',
      subtitle: 'Elevate your next project with world-class UI kits, 3D icons, and beautiful typography crafted by top designers.',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
      cta: 'Explore UI Kits',
      badge: 'Best Sellers',
      link: '/store?category=UI Kits',
      background: 'linear-gradient(135deg, rgba(82, 143, 240, 0.1) 0%, rgba(82, 143, 240, 0.02) 100%)',
    },
    {
      title: 'Stunning 3D Elements',
      subtitle: 'Add depth to your designs with our new highly-detailed 3D illustration packs, fully customizable in Blender and Figma.',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=600',
      cta: 'View 3D Assets',
      badge: 'New Arrivals',
      link: '/store?category=Icons',
      background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(233, 30, 99, 0.02) 100%)',
    },
    {
      title: 'Launch Your Own Store',
      subtitle: 'Join thousands of creators selling their digital products on DigiHub. Zero setup fees and instant payouts.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600',
      cta: 'Become a Seller',
      badge: 'Creators',
      link: '/become-seller',
      background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.02) 100%)',
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goTo = (idx) => setCurrent(idx);
  const prev = () => setCurrent(c => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent(c => (c + 1) % slides.length);

  const arrowStyle = {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    background: 'var(--bg-nav)', border: '1px solid var(--border)', borderRadius: '50%',
    width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'var(--text-body)', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)',
    zIndex: 10,
  };

  return (
    <div className="hero-slider-container">
      <div 
        className="hero-slider-track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className="hero-slide"
            style={{ background: slide.background }}
          >
            <div className="hero-content">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--bg-page)', padding: '4px 12px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '1.5rem', border: '1px solid var(--border-focus)' }}>
                <Zap size={14} fill="currentColor" /> {slide.badge}
              </div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.1, letterSpacing: '-0.5px', color: 'var(--text-main)' }}>
                {slide.title}
              </h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '90%' }}>
                {slide.subtitle}
              </p>
              <button 
                onClick={() => navigate(slide.link)}
                style={{
                  padding: '12px 32px', background: 'var(--primary)', color: '#fff',
                  border: 'none', borderRadius: 'var(--radius-lg)', fontWeight: 600, fontSize: '0.95rem',
                  cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
                  boxShadow: '0 8px 20px rgba(82,143,240,0.3)'
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(82,143,240,0.4)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(82,143,240,0.3)'; }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
                onMouseUp={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              >
                {slide.cta}
              </button>
            </div>
            
            <div className="hero-image-wrapper">
              <img src={slide.image} alt={slide.title} className="hero-image" style={{ borderRadius: '24px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button style={{ ...arrowStyle, left: -22, opacity: current === 0 ? 0 : 1, pointerEvents: current === 0 ? 'none' : 'auto' }} onClick={prev}
        onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--primary)'; }}
        onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-nav)'; e.currentTarget.style.color = 'var(--text-body)'; }}
      >
        <ChevronLeft size={24} />
      </button>
      <button style={{ ...arrowStyle, right: -22, opacity: current === slides.length - 1 ? 0 : 1, pointerEvents: current === slides.length - 1 ? 'none' : 'auto' }} onClick={next}
        onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--primary)'; }}
        onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-nav)'; e.currentTarget.style.color = 'var(--text-body)'; }}
      >
        <ChevronRight size={24} />
      </button>

      {/* Dot Indicators */}
      <div style={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 10, zIndex: 10
      }}>
        {slides.map((_, i) => (
          <button key={i}
            onClick={() => goTo(i)}
            style={{
              width: current === i ? 24 : 8, height: 8,
              borderRadius: 'var(--radius-full)', border: 'none',
              background: current === i ? 'var(--primary)' : 'var(--border-focus)',
              cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
