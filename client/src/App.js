// client/src/App.js
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Grid } from '@mui/material';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
// Member pages
import MemberDashboard from './pages/member/Dashboard';
import BrowseServices from './pages/member/BrowseServices';
import ServiceDetail from './pages/member/ServiceDetail';
import PurchaseCoins from './pages/member/PurchaseCoins';
import CallHistory from './pages/member/CallHistory';

// Provider pages
import ProviderDashboard from './pages/provider/Dashboard';
import MyServices from './pages/provider/MyServices';
import CreateService from './pages/provider/CreateService';
import Earnings from './pages/provider/Earnings';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import RevenueReports from './pages/admin/RevenueReports';

// Simple landing page
import LandingPage from './pages/LandingPage';

// Placeholder component for routes under development
const UnderDevelopment = ({ pageName }) => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <h2>{pageName} Page</h2>
    <p>This page is currently under development. Check back soon!</p>
  </Box>
);

function App() {
  // For demo purposes, simulate authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('member'); // 'member', 'provider', 'admin'
  
  // Simple auth functions
  const login = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };
  
  const logout = () => {
    setIsAuthenticated(false);
    setUserRole('');
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login onLogin={login} />} />
        <Route path="/register" element={<Register onRegister={Register} />} />
        <Route path="/forgot-password" element={<ForgotPassword/>} />
      </Route>
      
      {/* Member routes */}
      <Route path="/member" element={
        <DashboardLayout 
          userRole="member" 
          isAuthenticated={isAuthenticated && userRole === 'member'} 
          onLogout={logout}
        />
      }>
        <Route index element={<Navigate to="/member/dashboard" replace />} />
        <Route path="dashboard" element={<MemberDashboard />} />
        <Route path="services" element={<BrowseServices />} />
        <Route path="services/:id" element={<ServiceDetail />} />
        <Route path="coins" element={<PurchaseCoins />} />
        <Route path="calls" element={<CallHistory />} />
        <Route path="profile" element={<UnderDevelopment pageName="Profile" />} />
      </Route>
      
      {/* Provider routes */}
      <Route path="/provider" element={
        <DashboardLayout 
          userRole="provider" 
          isAuthenticated={isAuthenticated && userRole === 'provider'} 
          onLogout={logout}
        />
      }>
        <Route index element={<Navigate to="/provider/dashboard" replace />} />
        <Route path="dashboard" element={<ProviderDashboard />} />
        <Route path="services" element={<MyServices />} />
        <Route path="services/create" element={<CreateService />} />
        <Route path="earnings" element={<Earnings />} />
        <Route path="profile" element={<UnderDevelopment pageName="Profile" />} />
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin" element={
        <DashboardLayout 
          userRole="admin" 
          isAuthenticated={isAuthenticated && userRole === 'admin'} 
          onLogout={logout}
        />
      }>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="reports" element={<RevenueReports />} />
        <Route path="settings" element={<UnderDevelopment pageName="Settings" />} />
      </Route>
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;