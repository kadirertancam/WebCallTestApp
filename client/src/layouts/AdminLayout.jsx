// client/src/layouts/AdminLayout.jsx
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const AdminLayout = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="logo">
          <h1>Admin Panel</h1>
        </div>
        <div className="user-menu">
          <div className="user-info">
            <span className="username">{user?.profile?.firstName || 'Admin'}</span>
            <img 
              src={user?.profile?.profileImage || '/assets/images/default-avatar.png'} 
              alt="Admin" 
              className="user-avatar"
            />
          </div>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      
      <div className="admin-container">
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            <ul>
              <li>
                <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
                  <i className="fas fa-tachometer-alt"></i>
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
                  <i className="fas fa-users"></i>
                  User Management
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/reports/revenue" className={({ isActive }) => isActive ? 'active' : ''}>
                  <i className="fas fa-chart-line"></i>
                  Revenue Reports
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/settings" className={({ isActive }) => isActive ? 'active' : ''}>
                  <i className="fas fa-cog"></i>
                  System Settings
                </NavLink>
              </li>
            </ul>
          </nav>
        </aside>
        
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;