import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/UI/Toast';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Purchases from './pages/Purchases';
import Transfers from './pages/Transfers';
import Assignments from './pages/Assignments';
import Expenditures from './pages/Expenditures';
import AuditLogs from './pages/AuditLogs';
import Users from './pages/Users';
import Spinner from './components/UI/Spinner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30 * 1000, // 30 seconds
      refetchOnWindowFocus: false,
    },
  },
});

// Route guard
function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚔️</div>
          <Spinner size={36} />
          <p style={{ color: '#6b7280', marginTop: '12px', fontSize: '14px' }}>Loading MAMS...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected — all authenticated users */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* Admin + Logistics Officer */}
      <Route
        path="/purchases"
        element={
          <PrivateRoute roles={['ADMIN', 'LOGISTICS_OFFICER']}>
            <Purchases />
          </PrivateRoute>
        }
      />
      <Route
        path="/transfers"
        element={
          <PrivateRoute roles={['ADMIN', 'LOGISTICS_OFFICER']}>
            <Transfers />
          </PrivateRoute>
        }
      />

      {/* Admin + Base Commander */}
      <Route
        path="/assignments"
        element={
          <PrivateRoute roles={['ADMIN', 'BASE_COMMANDER']}>
            <Assignments />
          </PrivateRoute>
        }
      />
      <Route
        path="/expenditures"
        element={
          <PrivateRoute roles={['ADMIN', 'BASE_COMMANDER']}>
            <Expenditures />
          </PrivateRoute>
        }
      />

      {/* Admin only */}
      <Route
        path="/audit-logs"
        element={
          <PrivateRoute roles={['ADMIN']}>
            <AuditLogs />
          </PrivateRoute>
        }
      />
      <Route
        path="/users"
        element={
          <PrivateRoute roles={['ADMIN']}>
            <Users />
          </PrivateRoute>
        }
      />

      {/* Fallback */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
