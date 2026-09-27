import React from 'react';

export default function FormField({ label, error, required, children, hint }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '6px',
        }}>
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{hint}</p>
      )}
      {error && (
        <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>⚠ {error}</p>
      )}
    </div>
  );
}

export function Input({ error, ...props }) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        padding: '8px 12px',
        border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
        borderRadius: '8px',
        fontSize: '14px',
        color: '#1f2937',
        background: 'white',
        outline: 'none',
        transition: 'border-color 0.15s',
        ...props.style,
      }}
      onFocus={(e) => {
        e.target.style.borderColor = error ? '#ef4444' : '#2563eb';
        e.target.style.boxShadow = `0 0 0 3px ${error ? 'rgba(239,68,68,0.1)' : 'rgba(37,99,235,0.1)'}`;
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = error ? '#ef4444' : '#d1d5db';
        e.target.style.boxShadow = 'none';
        props.onBlur?.(e);
      }}
    />
  );
}

export function Select({ error, children, ...props }) {
  return (
    <select
      {...props}
      style={{
        width: '100%',
        padding: '8px 12px',
        border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
        borderRadius: '8px',
        fontSize: '14px',
        color: '#1f2937',
        background: 'white',
        outline: 'none',
        cursor: 'pointer',
        ...props.style,
      }}
    >
      {children}
    </select>
  );
}

export function Textarea({ error, ...props }) {
  return (
    <textarea
      {...props}
      style={{
        width: '100%',
        padding: '8px 12px',
        border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
        borderRadius: '8px',
        fontSize: '14px',
        color: '#1f2937',
        background: 'white',
        outline: 'none',
        resize: 'vertical',
        minHeight: '80px',
        ...props.style,
      }}
    />
  );
}
