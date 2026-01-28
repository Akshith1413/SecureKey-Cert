'use client';

import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaPendingUserId, setMfaPendingUserId] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    setLoading(false);
  }, []);

  const register = async (firstName, lastName, email, password, role = 'developer') => {
    try {
      const response = await api.post('/auth/register', {
        firstName,
        lastName,
        email,
        password,
        role,
      });

      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true, data: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.data.mfaRequired) {
        setMfaRequired(true);
        setMfaPendingUserId(response.data.userId);
        return {
          success: true,
          mfaRequired: true,
          message: 'Please verify your MFA code',
        };
      }

      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true, data: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const verifyMFA = async (token, useBackupCode = false) => {
    try {
      const response = await api.post('/auth/mfa/validate', {
        userId: mfaPendingUserId,
        token,
        useBackupCode,
      });

      const { token: authToken, user: userData } = response.data;

      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setMfaRequired(false);
      setMfaPendingUserId(null);

      return { success: true, data: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'MFA verification failed',
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setMfaRequired(false);
    setMfaPendingUserId(null);
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password change failed',
      };
    }
  };

  const setupMFA = async () => {
    try {
      const response = await api.post('/auth/mfa/setup');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'MFA setup failed',
      };
    }
  };

  const verifyMFASetup = async (secret, token, backupCodes) => {
    try {
      await api.post('/auth/mfa/verify', {
        secret,
        token,
        backupCodes,
      });

      return { success: true, message: 'MFA enabled successfully' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'MFA verification failed',
      };
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/users/profile');
      const userData = response.data.data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, data: userData };
    } catch (error) {
      console.error('Refresh user error:', error);
      return { success: false };
    }
  };

  const value = {
    user,
    loading,
    mfaRequired,
    register,
    login,
    logout,
    verifyMFA,
    changePassword,
    setupMFA,
    verifyMFASetup,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
