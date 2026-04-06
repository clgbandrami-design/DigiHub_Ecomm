import React, { createContext, useState, useCallback, useContext } from 'react';

export const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
    return id;
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
  };

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  const colors = {
    success: { bg: '#e8f5e9', border: '#4caf50', text: '#2e7d32', icon: '#388e3c' },
    error: { bg: '#ffebee', border: '#f44336', text: '#c62828', icon: '#d32f2f' },
    info: { bg: '#e3f2fd', border: '#2196f3', text: '#1565c0', icon: '#1976d2' },
    warning: { bg: '#fff8e1', border: '#ff9800', text: '#e65100', icon: '#f57c00' },
  };

  const darkColors = {
    success: { bg: '#1b3d1e', border: '#4caf50', text: '#a5d6a7', icon: '#66bb6a' },
    error: { bg: '#3d1b1b', border: '#f44336', text: '#ef9a9a', icon: '#ef5350' },
    info: { bg: '#1b2d3d', border: '#2196f3', text: '#90caf9', icon: '#42a5f5' },
    warning: { bg: '#3d3017', border: '#ff9800', text: '#ffe082', icon: '#ffa726' },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast container */}
      <div style={{
        position: 'fixed', top: 16, right: 16, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
        maxWidth: 380, width: 'calc(100% - 32px)', pointerEvents: 'none',
      }}>
        {toasts.map(t => {
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          const c = isDark ? darkColors[t.type] : colors[t.type];
          return (
            <div
              key={t.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.65rem',
                padding: '0.75rem 1rem', borderRadius: 8,
                background: c.bg, borderLeft: `4px solid ${c.border}`,
                color: c.text, fontSize: '0.85rem', fontWeight: 500,
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                animation: 'toastSlideIn 0.3s ease-out',
                pointerEvents: 'auto', cursor: 'pointer',
              }}
              onClick={() => removeToast(t.id)}
            >
              <span style={{ fontSize: '1.1rem', color: c.icon, fontWeight: 800, flexShrink: 0 }}>
                {icons[t.type]}
              </span>
              <span style={{ flex: 1 }}>{t.message}</span>
              <span style={{ opacity: 0.5, fontSize: '0.75rem', flexShrink: 0 }}>✕</span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
