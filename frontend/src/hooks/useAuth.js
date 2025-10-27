import { useState, useEffect, createContext, useContext } from 'react';
import { authService, userService } from '../api/services';
import { useToast } from './useToast';

const AuthContext = createContext();

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
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // Fetch current user profile from API
          const response = await userService.getCurrentUser();
          setUser(response.data);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // If token is invalid, clear it
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await authService.login({
        username,
        password,
      });

      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // Fetch user profile after successful login
      try {
        const userResponse = await userService.getCurrentUser();
        setUser(userResponse.data);
      } catch (profileError) {
        console.error('Error fetching user profile:', profileError);
        setUser({ username, is_active: true });
      }
      
      showSuccess('Inicio de sesión exitoso');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || 'Error de autenticación';
      showError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    showSuccess('Sesión cerrada exitosamente');
  };

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) {
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshToken(refresh);
      const { access } = response.data;
      localStorage.setItem('access_token', access);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  const value = {
    user,
    login,
    logout,
    refreshToken,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};