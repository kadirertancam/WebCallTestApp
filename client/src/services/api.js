// client/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false // To enable cookies for refresh tokens
});

// Add token to requests
// In api.js, verify the interceptor is correctly adding the token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Handle token expiration
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh token yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
        
        // If successful, update token and retry request
        const { token } = response.data;
        localStorage.setItem('token', token);
        
        // Update auth header and retry
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (email, password, rememberMe) => api.post('/auth/login', { email, password, rememberMe }),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password })
};

// User services
export const userService = {
  getCurrentUser: () => api.get('/users/me'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  uploadProfileImage: (formData) => api.post('/users/profile/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  changePassword: (currentPassword, newPassword) => api.put('/users/change-password', { currentPassword, newPassword })
};

// Service ad services
export const serviceAdService = {
  createAd: (adData) => api.post('/services', adData),
  updateAd: (id, adData) => api.put(`/services/${id}`, adData),
  deleteAd: (id) => api.delete(`/services/${id}`),
  getServiceById: (id) => api.get(`/services/${id}`),
  getProviderServices: () => api.get('/services/provider'),
  searchServices: (params) => api.get('/services', { params })
};

// Coin services
export const coinService = {
  getPackages: () => api.get('/coins/packages'),
  purchaseCoins: (purchaseData) => api.post('/coins/purchase', purchaseData),
  getTransactionHistory: (params) => api.get('/coins/transactions', { params })
};

// Call services
export const callService = {
  initiateCall: (callData) => api.post('/calls', callData),
  respondToCall: (callId, accept) => api.put(`/calls/${callId}/respond`, { accept }),
  completeCall: (callId, callData) => api.put(`/calls/${callId}/complete`, callData),
  extendCall: (callId, additionalMinutes) => api.put(`/calls/${callId}/extend`, { additionalMinutes }),
  rateCall: (callId, ratingData) => api.post(`/calls/${callId}/rate`, ratingData),
  getCallHistory: (params) => api.get('/calls/history', { params })
};

// Admin services
export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (userId, statusData) => api.put(`/admin/users/${userId}`, statusData),
  getRevenueReport: (params) => api.get('/admin/reports/revenue', { params }),
  getSystemSettings: () => api.get('/admin/settings'),
  updateSystemSettings: (settings) => api.put('/admin/settings', settings)
};

export default {
  authService,
  userService,
  serviceAdService,
  coinService,
  callService,
  adminService
};