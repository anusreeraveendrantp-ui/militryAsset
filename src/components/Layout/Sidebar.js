import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
   
    roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'],
  },
  {
    path: '/purchases',
    label: 'Purchases',
   
    roles: ['ADMIN', 'LOGISTICS_OFFICER'],
  },
  {
    path: '/transfers',
    label: 'Transfers',
    
    roles: ['ADMIN', 'LOGISTICS_OFFICER'],
  },
  {
    path: '/assignments',
    label: 'Assignments',
   
    roles: ['ADMIN', 'BASE_COMMANDER'],
  },
  {
    path: '/expenditures',
    label: 'Expenditures',
    
    roles: ['ADMIN', 'BASE_COMMANDER'],
  },
  {
    path: '/audit-logs',
    label: 'Audit Logs',
    
    roles: ['ADMIN'],
  },
  {
    path: '/users',
    label: 'Users',
  
    roles: ['ADMIN'],
  },
];

const roleColors = {
  ADMIN: '#ef4444',
  BASE_COMMANDER: '#f59e0b',
  LOGISTICS_OFFICER: '#10b981',
};

const roleLabels = {
  ADMIN: 'Admin',
  BASE_COMMANDER: 'Base Commander',
  LOGISTICS_OFFICER: 'Logistics Officer',
};

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const accessible = navItems.filter((item) => item.roles.includes(user?.role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{
      width: collapsed ? '64px' : '260px',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f2137 0%, #1e3a5f 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 100,
      boxShadow: '2px 0 8px rgba(0,0,0,0.3)',
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minHeight: '64px',
        justifyContent: collapsed ? 'center' : 'space-between',
      }}>
        {!collapsed && (
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '0.5px' }}>⚔️ MAMS</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Asset Management</div>
          </div>
        )}
        {collapsed && <span style={{ fontSize: '22px' }}>⚔️</span>}
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)',
        }}>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.username}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: roleColors[user?.role] || '#6b7280',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
              {roleLabels[user?.role]}
            </span>
          </div>
          {user?.base && (
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
              📍 {user.base.name}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {accessible.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: collapsed ? '12px 0' : '12px 24px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
              background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
              borderLeft: isActive ? '3px solid #f59e0b' : '3px solid transparent',
              fontSize: '14px',
              fontWeight: isActive ? '600' : '400',
              transition: 'all 0.15s',
              textDecoration: 'none',
            })}
          >
            <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: collapsed ? '12px 0' : '12px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#fca5a5',
            borderRadius: '6px',
            padding: collapsed ? '10px 0' : '10px 16px',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '8px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
        >
          <span>🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
