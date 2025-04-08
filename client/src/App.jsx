// client/src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/api';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import MemberLayout from './layouts/MemberLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import RevenueReports from './pages/admin/RevenueReports';
import SystemSettings from './pages/admin/SystemSettings';

// Service Provider Pages
import ProviderDashboard from './pages/user/Dashboard';
import CreateServiceAd from './pages/user/CreateServiceAd';
import MyServiceAds from './pages/user/MyServiceAds';
import CallHistory from './pages/user/CallHistory';
import EarningsReport from './pages/user/EarningsReport';

// Member Pages
import MemberDashboard from './pages/member/Dashboard';
import BrowseServices from './pages/member/BrowseServices';
import ServiceDetail from './pages/member/ServiceDetail';
import ServiceCall from './pages/member/ServiceCall';
import PurchaseCoins from './pages/member/PurchaseCoins';
import MemberCallHistory from './pages/member/CallHistory';
import SimplifiedVideoCallInterface from './components/calls/SimplifiedVideoCallInterface';
import CreateServiceSimplified from './pages/provider/CreateServiceSimplified';

// Protected route wrapper
const ProtectedRoute = ({ element, allowedRoles }) => {
  const user = authService.getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the appropriate dashboard based on user role
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" />;
    } else if (user.role === 'user') {
      return <Navigate to="/user/dashboard" />;
    } else {
      return <Navigate to="/member/dashboard" />;
    }
  }
  
  return element;
};

const App = () => {
  const [initialized, setInitialized] = useState(false);
  
  // Initialize application
 // AuthContext veya App bileşeni içinde
useEffect(() => {
  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log(token);
      if (token) {
        const response = await userService.getCurrentUser();
        setCurrentUser(response.data.data || response.data);
        setIsAuthenticated(true); // Token varsa kullanıcıyı giriş yapmış olarak işaretle
      }
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  loadUser();
}, []);
  
  if (!initialized) {
    return <div className="app-loading">Loading application...</div>;
  }
  
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        
        {/* Admin Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={
            <ProtectedRoute 
              element={<AdminDashboard />} 
              allowedRoles={['admin']} 
            />
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute 
              element={<UserManagement />} 
              allowedRoles={['admin']} 
            />
          } />
          <Route path="/admin/reports/revenue" element={
            <ProtectedRoute 
              element={<RevenueReports />} 
              allowedRoles={['admin']} 
            />
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute 
              element={<SystemSettings />} 
              allowedRoles={['admin']} 
            />
          } />
        </Route>
        
        {/* Service Provider Routes */}
        <Route element={<UserLayout />}>
          <Route path="/user/dashboard" element={
            <ProtectedRoute 
              element={<ProviderDashboard />} 
              allowedRoles={['user']} 
            />
          } />
          <Route path="/user/services/create" element={
            <ProtectedRoute 
              element={<CreateServiceAd />} 
              allowedRoles={['user']} 
            />
          } />
          <Route path="/user/services" element={
            <ProtectedRoute 
              element={<MyServiceAds />} 
              allowedRoles={['user']} 
            />
          } />
          <Route path="/user/calls" element={
            <ProtectedRoute 
              element={<CallHistory />} 
              allowedRoles={['user']} 
            />
          } />
          <Route path="/user/earnings" element={
            <ProtectedRoute 
              element={<EarningsReport />} 
              allowedRoles={['user']} 
            />
          } />
        </Route>
        
        {/* Member Routes */}
        <Route path="/member/services" element={<BrowseServices />} />
        <Route path="/member/call/:serviceId" element={<SimplifiedVideoCallInterface />} />
        <Route path="/provider/services/create" element={<CreateServiceSimplified />} />
        <Route element={<MemberLayout />}>
          <Route  path="/member/*" element={
            <ProtectedRoute 
              element={<MemberDashboard />} 
              allowedRoles={['member']} 
            />
          } />
          <Route path="/member/services" element={
            <ProtectedRoute 
              element={<BrowseServices />} 
              allowedRoles={['member']} 
            />
          } />
          <Route path="/member/services/:serviceId" element={
            <ProtectedRoute 
              element={<ServiceDetail />} 
              allowedRoles={['member']} 
            />
          } />
          <Route path="/member/call/:serviceId" element={
            <ProtectedRoute 
              element={<ServiceCall />} 
              allowedRoles={['member']} 
            />
          } />
          <Route path="/member/coins/purchase" element={
            <ProtectedRoute 
              element={<PurchaseCoins />} 
              allowedRoles={['member']} 
            />
          } />
          <Route path="/member/calls" element={
            <ProtectedRoute 
              element={<MemberCallHistory />} 
              allowedRoles={['member']} 
            />
          } />
        </Route>
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;