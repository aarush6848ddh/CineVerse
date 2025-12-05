import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status on mount
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get('/auth/me');
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
      
      return { success: false, message: response.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      return { success: false, message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
      
      return { success: false, message: response.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      return { success: false, message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      setError(null);
      const response = await api.put('/users/profile', updates);
      
      if (response.data.success) {
        setUser(response.data.user);
        return { success: true };
      }
      
      return { success: false, message: response.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Profile update failed.';
      setError(message);
      return { success: false, message };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      const response = await api.put('/auth/password', { currentPassword, newPassword });
      
      if (response.data.success) {
        return { success: true, message: response.data.message };
      }
      
      return { success: false, message: response.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Password change failed.';
      setError(message);
      return { success: false, message };
    }
  };

  // Update user's watchlist locally
  const updateWatchlist = (movieId, inWatchlist) => {
    if (!user) return;
    
    setUser(prev => ({
      ...prev,
      watchlist: inWatchlist 
        ? [...prev.watchlist, { movieId, addedAt: new Date() }]
        : prev.watchlist.filter(m => m.movieId !== movieId)
    }));
  };

  // Update user's favorites locally
  const updateFavorites = (movieId, isFavorite) => {
    if (!user) return;
    
    setUser(prev => ({
      ...prev,
      favorites: isFavorite 
        ? [...prev.favorites, { movieId, addedAt: new Date() }]
        : prev.favorites.filter(m => m.movieId !== movieId)
    }));
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isViewer: user?.role === 'viewer',
    isCritic: user?.role === 'critic',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    updateWatchlist,
    updateFavorites,
    refreshUser,
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

