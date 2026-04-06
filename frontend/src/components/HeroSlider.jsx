import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
      title: 'Digital Assets for Everyone',
      subtitle: 'Premium templates, icons, and creative resources at your fingertips.'
    },
    {
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1200',
      title: 'New 3D Icon Packs',
      subtitle: 'Upgrade your UI with modern 3D icons and illustrations.'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goTo = (idx) => setCurrent(idx);
  const prev = () => setCurrent(c => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent(c => (c + 1) % slides.length);

  const arrowStyle = {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 'var(--radius-full)',
    width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#fff', transition: 'background 0.2s', backdropFilter: 'blur(4px)',
    zIndex: 2,
  };

  return (
    <div className="hero-slider" style={{ position: 'relative' }}>
      {slides.map((slide, index) => (
        <div
          key={index}
          className="slide"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(7,38,84,0.85) 0%, rgba(13,59,122,0.7) 50%, rgba(27,94,192,0.5) 100%), url(${slide.image})`,
            display: index === current ? 'flex' : 'none',
          }}
        >
          <div style={{ maxWidth: 480 }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.2, letterSpacing: '-0.3px' }}>{slide.title}</h2>
            <p style={{ fontSize: 'var(--fs-base)', opacity: 0.85, lineHeight: 1.5 }}>{slide.subtitle}</p>
            <button style={{
              marginTop: '1rem', padding: '9px 24px', background: 'var(--accent)', color: 'var(--primary)',
              border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: 'var(--fs-sm)',
              cursor: 'pointer', fontFamily: 'var(--font)', transition: 'transform 0.15s',
            }}
              onMouseDown={e => e.target.style.transform = 'scale(0.96)'}
              onMouseUp={e => e.target.style.transform = ''}
            >
              Explore Now →
            </button>
          </div>
        </div>
      ))}

      {/* Arrows */}
      <button style={{ ...arrowStyle, left: 12 }} onClick={prev}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
      >
        <ChevronLeft size={18} />
      </button>
      <button style={{ ...arrowStyle, right: 12 }} onClick={next}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
      >
        <ChevronRight size={18} />
      </button>

      {/* Dot indicators */}
      <div style={{
        position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 8,
      }}>
        {slides.map((_, i) => (
          <button key={i}
            onClick={() => goTo(i)}
            style={{
              width: current === i ? 20 : 8, height: 8,
              borderRadius: 'var(--radius-full)', border: 'none',
              background: current === i ? '#fff' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer', transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
