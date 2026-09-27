import React from 'react';

const variantStyles = {
  success: { background: '#d1fae5', color: '#065f46' },
  danger: { background: '#fee2e2', color: '#991b1b' },
  warning: { background: '#fef3c7', color: '#92400e' },
  info: { background: '#dbeafe', color: '#1e40af' },
  gray: { background: '#f3f4f6', color: '#374151' },
  purple: { background: '#ede9fe', color: '#5b21b6' },
  blue: { background: '#dbeafe', color: '#1e40af' },
};

export default function Badge({ children, variant = 'gray', style }) {
  return (
    <span style={{
      ...variantStyles[variant],
      padding: '2px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '600',
      display: 'inline-block',
      whiteSpace: 'nowrap',
      ...style,
    }}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    PENDING: { variant: 'warning', label: 'Pending' },
    COMPLETED: { variant: 'success', label: 'Completed' },
    CANCELLED: { variant: 'danger', label: 'Cancelled' },
    ASSIGNED: { variant: 'info', label: 'Assigned' },
    RETURNED: { variant: 'gray', label: 'Returned' },
    EXPENDED: { variant: 'danger', label: 'Expended' },
    ADMIN: { variant: 'purple', label: 'Admin' },
    BASE_COMMANDER: { variant: 'warning', label: 'Base Commander' },
    LOGISTICS_OFFICER: { variant: 'success', label: 'Logistics Officer' },
  };
  const { variant, label } = map[status] || { variant: 'gray', label: status };
  return <Badge variant={variant}>{label}</Badge>;
}
