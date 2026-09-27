import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/purchases': 'Purchases',
  '/transfers': 'Transfers',
  '/assignments': 'Assignments',
  '/expenditures': 'Expenditures',
  '/audit-logs': 'Audit Logs',
  '/users': 'User Management',
};

export default function Header({ sidebarCollapsed }) {
  const location = useLocation();
  const { user } = useAuth();
  const title = pageTitles[location.pathname] || 'MAMS';

  return (
    <header style={{
      height: '64px',
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#0f2137',
          margin: 0,
        }}>
          {title}
        </h1>
        <span style={{
          fontSize: '12px',
          background: '#f3f4f6',
          color: '#6b7280',
          padding: '2px 8px',
          borderRadius: '12px',
        }}>
          Military Asset Management System
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '6px 12px',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '700',
            fontSize: '13px',
          }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
              {user?.username?.split('@')[0]}
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>
              {user?.role?.replace('_', ' ')}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
