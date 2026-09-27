import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 64 : 260;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div style={{
        marginLeft: `${sidebarWidth}px`,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        transition: 'margin-left 0.2s ease',
      }}>
        <Header sidebarCollapsed={collapsed} />
        <main style={{
          flex: 1,
          padding: '24px',
          background: '#f9fafb',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
