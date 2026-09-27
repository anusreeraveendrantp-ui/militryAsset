import React from 'react';

export function Card({ children, style, className }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      ...style,
    }} className={className}>
      {children}
    </div>
  );
}

export function CardHeader({ children, style }) {
  return (
    <div style={{
      padding: '16px 20px',
      borderBottom: '1px solid #f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      ...style,
    }}>
      {children}
    </div>
  );
}

export function CardTitle({ children, style }) {
  return (
    <h2 style={{
      fontSize: '16px',
      fontWeight: '600',
      color: '#1f2937',
      margin: 0,
      ...style,
    }}>
      {children}
    </h2>
  );
}

export function CardBody({ children, style }) {
  return (
    <div style={{ padding: '20px', ...style }}>
      {children}
    </div>
  );
}
