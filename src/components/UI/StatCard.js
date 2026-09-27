import React from 'react';

export default function StatCard({ title, value, icon, color = '#1e3a5f', subtitle, trend }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
            {title}
          </p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', margin: '4px 0 0', lineHeight: 1 }}>
            {value?.toLocaleString?.() ?? value}
          </p>
        </div>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          background: `${color}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
      {subtitle && (
        <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{subtitle}</p>
      )}
      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            fontSize: '12px',
            color: trend >= 0 ? '#10b981' : '#ef4444',
            fontWeight: '600',
          }}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}
          </span>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>net movement</span>
        </div>
      )}
    </div>
  );
}
