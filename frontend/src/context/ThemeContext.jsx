import React, { createContext, useEffect, useState } from 'react';

export const ThemeContext = createContext();

function applyDarkClasses() {
  document.querySelectorAll('[style]').forEach((element) => {
    const bg = element.style.background || element.style.backgroundColor;
    if (!bg) return;

    if (
      bg.includes('rgb(255, 255, 255)') ||
      bg === '#fff' ||
      bg === '#ffffff' ||
      bg === 'white'
    ) {
      element.classList.add('dark-bg');
      return;
    }

    if (
      bg.includes('rgb(247, 248, 250)') ||
      bg.includes('rgb(241, 243, 246)') ||
      bg.includes('rgb(249, 249, 249)') ||
      bg.includes('rgb(245, 245, 245)') ||
      bg.includes('rgb(240, 240, 240)') ||
      bg.includes('rgb(248, 249, 250)') ||
      bg.includes('rgb(250, 250, 250)') ||
      bg === '#f7f8fa' ||
      bg === '#f1f3f6' ||
      bg === '#f9f9f9' ||
      bg === '#f5f5f5' ||
      bg === '#f8f9fa'
    ) {
      element.classList.add('dark-bg-deep');
    }
  });
}

function removeDarkClasses() {
  document.querySelectorAll('.dark-bg, .dark-bg-deep').forEach((element) => {
    element.classList.remove('dark-bg', 'dark-bg-deep');
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
    let observer;
    let timeoutId;

    localStorage.setItem('digihub-theme', isDark ? 'dark' : 'light');

    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      timeoutId = window.setTimeout(applyDarkClasses, 50);
      observer = new MutationObserver(() => applyDarkClasses());
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      root.removeAttribute('data-theme');
      removeDarkClasses();
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (observer) observer.disconnect();
    };
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
