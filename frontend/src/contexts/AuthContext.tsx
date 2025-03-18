import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, User } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (localStorage.getItem('access_token')) {
        const user = await auth.getCurrentUser();
        setUser(user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setError(null);
      await auth.login({ username, password });
      const user = await auth.getCurrentUser();
      setUser(user);
      navigate('/dashboard');
    } catch (error) {
      setError('Login failed. Please check your credentials.');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const register = async (email: string, username: string, password: string) => {
    try {
      setError(null);
      await auth.register({ email, username, password });
      await login(username, password);
    } catch (error) {
      setError('Registration failed. Please try again.');
      throw error;
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      setError(null);
      await auth.requestPasswordReset(email);
    } catch (error) {
      setError('Password reset request failed. Please try again.');
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      setError(null);
      await auth.resetPassword(token, newPassword);
      navigate('/login');
    } catch (error) {
      setError('Password reset failed. Please try again.');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    requestPasswordReset,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 