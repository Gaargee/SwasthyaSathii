import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const token = localStorage.getItem('swasthyasathi_token');
    const savedUser = localStorage.getItem('swasthyasathi_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch { /* ignore */ }
    }
    setLoading(false);

    // Validate token with server in the background.
    // If token is invalid/expired, the centralized handler in api.js will redirect to login.
    if (token) {
      api.getProfile().catch(() => {
        // Token invalid/expired — api.js already handles the redirect
      });
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const login = async (identifier, password) => {
    const data = await api.login(identifier, password);
    return data; // Returns { otp_demo, worker_id }
  };

  const verifyOtp = async (identifier, otp, workerId) => {
    const data = await api.verifyOtp(identifier, otp, workerId);
    localStorage.setItem('swasthyasathi_token', data.token);
    localStorage.setItem('swasthyasathi_user', JSON.stringify(data.worker));
    setUser(data.worker);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('swasthyasathi_token');
    localStorage.removeItem('swasthyasathi_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isOnline, login, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
