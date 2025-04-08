// client/src/layouts/MemberLayout.jsx
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const MemberLayout = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  return (
    <div className="member-layout">
      <header className="member-header">
        <div className="logo">
          <h1>Member Dashboard</h1>
        </div>
        <div className="user-menu">
          <div className="user-info">
            <span className="username">{user?.profile?.firstName || 'Member'}</span>
            <img 
              src={user?.profile?.profileImage || '/assets/images/default-avatar.png'} 
              alt="Member" 
              className="user-avatar"
            />
          </div>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      
      <div className="member-container">
        <aside className="member-sidebar">
          <nav className="member-nav">
            <ul>
              <li>
                <NavLink to="/member/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
                  <i className="fas fa-tachometer-alt"></i>
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/member/services" className={({ isActive }) => isActive ? 'active' : ''}>
                  <i className="fas fa-list"></i>
                  Browse Services
                </NavLink>
              </li>
              <li>
                <NavLink to="/member/coins/purchase" className={({ isActive }) => isActive ? 'active' : ''}>
                  <i className="fas fa-coins"></i>
                  Purchase Coins
                </NavLink>
              </li>
              <li>
                <NavLink to="/member/calls" className={({ isActive }) => isActive ? 'active' : ''}>
                  <i className="fas fa-phone"></i>
                  Call History
                </NavLink>
              </li>
            </ul>
          </nav>
        </aside>
        
        <main className="member-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MemberLayout;