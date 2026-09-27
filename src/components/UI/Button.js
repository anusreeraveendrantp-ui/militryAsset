import React from 'react';

const variants = {
  primary: {
    background: '#1e3a5f',
    color: 'white',
    border: '1px solid #1e3a5f',
    hoverBg: '#0f2137',
  },
  secondary: {
    background: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
    hoverBg: '#f9fafb',
  },
  danger: {
    background: '#ef4444',
    color: 'white',
    border: '1px solid #ef4444',
    hoverBg: '#dc2626',
  },
  success: {
    background: '#10b981',
    color: 'white',
    border: '1px solid #10b981',
    hoverBg: '#059669',
  },
  warning: {
    background: '#f59e0b',
    color: 'white',
    border: '1px solid #f59e0b',
    hoverBg: '#d97706',
  },
  ghost: {
    background: 'transparent',
    color: '#6b7280',
    border: '1px solid transparent',
    hoverBg: '#f3f4f6',
  },
};

const sizes = {
  sm: { padding: '6px 12px', fontSize: '12px', borderRadius: '6px' },
  md: { padding: '8px 16px', fontSize: '14px', borderRadius: '8px' },
  lg: { padding: '11px 22px', fontSize: '15px', borderRadius: '8px' },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  style,
  icon,
}) {
  const v = variants[variant];
  const s = sizes[size];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...s,
        background: v.background,
        color: v.color,
        border: v.border,
        fontWeight: '500',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) e.currentTarget.style.background = v.hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) e.currentTarget.style.background = v.background;
      }}
    >
      {loading ? <span>⏳</span> : icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
