import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

/**
 * Walk the DOM and add .dark-bg / .dark-bg-deep classes to elements
 * whose inline background is white or light gray.
 */
function applyDarkClasses() {
  document.querySelectorAll('[style]').forEach(el => {
    const bg = el.style.background || el.style.backgroundColor;
    if (!bg) return;
    if (bg.includes('rgb(255, 255, 255)') || bg === '#fff' || bg === '#ffffff' || bg === 'white') {
      el.classList.add('dark-bg');
    } else if (
      bg.includes('rgb(247, 248, 250)') || bg.includes('rgb(241, 243, 246)') ||
      bg.includes('rgb(249, 249, 249)') || bg.includes('rgb(245, 245, 245)') ||
      bg.includes('rgb(240, 240, 240)') || bg.includes('rgb(248, 249, 250)') ||
      bg.includes('rgb(250, 250, 250)') ||
      bg === '#f7f8fa' || bg === '#f1f3f6' || bg === '#f9f9f9' || bg === '#f5f5f5' || bg === '#f8f9fa'
    ) {
      el.classList.add('dark-bg-deep');
    }
  });
}

function removeDarkClasses() {
  document.querySelectorAll('.dark-bg, .dark-bg-deep').forEach(el => {
    el.classList.remove('dark-bg', 'dark-bg-deep');
  });
}

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('digihub-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches || false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      // Apply dark classes after a tick so React has finished rendering
      setTimeout(applyDarkClasses, 50);
      // Re-apply on DOM mutations (navigation, lazy loading)
      const observer = new MutationObserver(() => applyDarkClasses());
      observer.observe(document.body, { childList: true, subtree: true });
      return () => observer.disconnect();
    } else {
      root.removeAttribute('data-theme');
      removeDarkClasses();
    }
    localStorage.setItem('digihub-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
