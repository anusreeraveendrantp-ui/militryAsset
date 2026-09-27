import React from 'react';

export function Table({ children, style }) {
  return (
    <div style={{ overflowX: 'auto', ...style }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px',
      }}>
        {children}
      </table>
    </div>
  );
}

export function Thead({ children }) {
  return (
    <thead style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
      {children}
    </thead>
  );
}

export function Th({ children, style }) {
  return (
    <th style={{
      padding: '10px 16px',
      textAlign: 'left',
      fontSize: '12px',
      fontWeight: '600',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      whiteSpace: 'nowrap',
      ...style,
    }}>
      {children}
    </th>
  );
}

export function Tbody({ children }) {
  return <tbody>{children}</tbody>;
}

export function Tr({ children, style, onClick }) {
  return (
    <tr
      onClick={onClick}
      style={{
        borderBottom: '1px solid #f3f4f6',
        transition: 'background 0.1s',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onMouseEnter={(e) => { if (onClick) e.currentTarget.style.background = '#f9fafb'; }}
      onMouseLeave={(e) => { if (onClick) e.currentTarget.style.background = 'transparent'; }}
    >
      {children}
    </tr>
  );
}

export function Td({ children, style }) {
  return (
    <td style={{
      padding: '12px 16px',
      color: '#374151',
      verticalAlign: 'middle',
      ...style,
    }}>
      {children}
    </td>
  );
}
