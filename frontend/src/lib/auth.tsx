'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { authAPI } from './api';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  username: string;
  role: 'ADMIN' | 'STUDENT';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = Cookies.get('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user from cookie:', error);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const { access, refresh, user: userData } = response.data;

      // Store tokens and user info
      Cookies.set('access_token', access, { expires: 1/96 }); // 15 minutes
      Cookies.set('refresh_token', refresh, { expires: 7 }); // 7 days
      Cookies.set('user', JSON.stringify(userData));

      setUser(userData);

      // Redirect based on role
      if (userData.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/student');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  };

  const logout = () => {
    const refreshToken = Cookies.get('refresh_token');
    if (refreshToken) {
      authAPI.logout(refreshToken).catch(() => {
        // Ignore errors on logout
      });
    }

    // Clear all auth data
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    Cookies.remove('user');
    setUser(null);
    router.push('/auth/login');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'ADMIN',
    isStudent: user?.role === 'STUDENT',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
