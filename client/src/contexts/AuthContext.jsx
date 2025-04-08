// client/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, userService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Make sure this is defined in this component
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Load user on initial mount using token
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await userService.getCurrentUser();
        setCurrentUser(response.data.data || response.data);
        setIsAuthenticated(true); // Set authenticated to true when user is loaded
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = async (email, password, rememberMe = false) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await authService.login(email, password, rememberMe);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      setIsAuthenticated(true); // This should now work since we defined the state in this component
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'user') {
        navigate('/provider/dashboard');
      } else {
        navigate('/member/dashboard');
      }
      
      return user;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      setIsAuthenticated(false); // Set authenticated to false on logout
      navigate('/login');
    }
  };

  // Include isAuthenticated in the value object
  const value = {
    currentUser,
    loading,
    error,
    isAuthenticated, // Make sure you include this in the context value
    login,
    logout,
    // Include other functions you have
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}