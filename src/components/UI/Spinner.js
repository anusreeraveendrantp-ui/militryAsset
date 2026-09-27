import React from 'react';

export default function Spinner({ size = 32, center = false }) {
  const el = (
    <div style={{
      width: size,
      height: size,
      border: `${size / 8}px solid #e5e7eb`,
      borderTopColor: '#1e3a5f',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  );

  if (center) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        {el}
      </div>
    );
  }

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {el}
    </>
  );
}
