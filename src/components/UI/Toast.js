import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const colors = {
    success: { bg: '#d1fae5', border: '#a7f3d0', color: '#065f46' },
    error: { bg: '#fee2e2', border: '#fca5a5', color: '#991b1b' },
    warning: { bg: '#fef3c7', border: '#fcd34d', color: '#92400e' },
    info: { bg: '#dbeafe', border: '#93c5fd', color: '#1e40af' },
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '380px',
      }}>
        {toasts.map((t) => {
          const c = colors[t.type] || colors.info;
          return (
            <div key={t.id} style={{
              background: c.bg,
              border: `1px solid ${c.border}`,
              color: c.color,
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              animation: 'slideIn 0.2s ease',
            }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{icons[t.type]}</span>
              <span style={{ fontSize: '14px', flex: 1, fontWeight: '500' }}>{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.color, fontSize: '14px', flexShrink: 0, opacity: 0.7 }}
              >✕</button>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
