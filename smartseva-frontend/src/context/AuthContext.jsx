import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../api/services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('smartseva_token');
    const storedUser = localStorage.getItem('smartseva_user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('smartseva_token');
        localStorage.removeItem('smartseva_user');
      }
    }

    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);

      if (!response.success) {
        throw new Error(response.message || 'Invalid username or password');
      }

      const userData = response.data;

      localStorage.setItem('smartseva_token', userData.token);
      localStorage.setItem('smartseva_user', JSON.stringify(userData));

      setUser(userData);

      return userData;
    } catch (error) {
      throw new Error(
        error?.message ||
        error?.response?.data?.message ||
        'Login failed'
      );
    }
  };

  const logout = () => {
    localStorage.removeItem('smartseva_token');
    localStorage.removeItem('smartseva_user');
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === 'ROLE_ADMIN';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};