'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // null = unknown, false = definitely not logged in, true = server unreachable
  const [serverError, setServerError] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await authApi.getMe();
      setUser(data.user);
      setServerError(false);
    } catch (err) {
      setUser(null);
      // Network error (server down) vs real 401 (not logged in)
      if (!err.response) {
        setServerError(true);
      } else {
        setServerError(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials);
    setUser(data.user);
    setServerError(false);
    return data.user;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const updateUser = (updatedUser) => setUser(updatedUser);

  return (
    <AuthContext.Provider value={{ user, loading, serverError, login, logout, updateUser, refetch: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
