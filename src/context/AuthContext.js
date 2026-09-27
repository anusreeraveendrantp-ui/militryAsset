import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('mams_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('mams_token');
    localStorage.removeItem('mams_user');
    setUser(null);
  }, []);

  // Validate token on mount
  useEffect(() => {
    const token = localStorage.getItem('mams_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi.me()
      .then((res) => {
        setUser(res.data);
        localStorage.setItem('mams_user', JSON.stringify(res.data));
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  const login = async (username, password) => {
    const res = await authApi.login({ username, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('mams_token', token);
    localStorage.setItem('mams_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const isAdmin = user?.role === 'ADMIN';
  const isCommander = user?.role === 'BASE_COMMANDER';
  const isLogistics = user?.role === 'LOGISTICS_OFFICER';

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isCommander, isLogistics }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
