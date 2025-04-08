// client/src/components/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ role: '', query: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fetch users on component mount and when filters/pagination change
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await adminService.getAllUsers({
          page: pagination.page,
          limit: 10,
          ...filters
        });
        
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      } catch (err) {
        setError('Failed to load users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [pagination.page, filters]);
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filters change
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // The search is already handled by the useEffect that watches filter changes
  };
  
  // Handle user selection for detailed view/edit
  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };
  
  // Handle user status update
  const handleStatusUpdate = async (userId, updates) => {
    try {
      setLoading(true);
      await adminService.updateUserStatus(userId, updates);
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, ...updates } : user
      ));
      
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(prev => ({ ...prev, ...updates }));
      }
      
    } catch (err) {
      setError('Failed to update user status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  return (
    <div className="user-management">
      <h2>User Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="filter-group">
            <label htmlFor="role">Role:</label>
            <select 
              id="role" 
              name="role" 
              value={filters.role} 
              onChange={handleFilterChange}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">Service Provider</option>
              <option value="member">Member</option>
            </select>
          </div>
          
          <div className="filter-group search-input">
            <input 
              type="text" 
              name="query" 
              placeholder="Search by name or email" 
              value={filters.query}
              onChange={handleFilterChange}
            />
            <button type="submit" className="search-button">Search</button>
          </div>
        </form>
      </div>
      
      <div className="user-list-container">
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : (
          <>
            <table className="user-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className={selectedUser?._id === user._id ? 'selected' : ''}>
                    <td>
                      {user.profile?.firstName} {user.profile?.lastName}
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role === 'user' ? 'Provider' : user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.isVerified ? 'verified' : 'unverified'}`}>
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button 
                        className="view-btn"
                        onClick={() => handleUserSelect(user)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="pagination">
              <button 
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Previous
              </button>
              
              <span className="page-info">
                Page {pagination.page} of {pagination.pages}
              </span>
              
              <button 
                disabled={pagination.page === pagination.pages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
        
        {selectedUser && (
          <div className="user-detail-panel">
            <div className="panel-header">
              <h3>User Details</h3>
              <button className="close-panel" onClick={() => setSelectedUser(null)}>×</button>
            </div>
            
            <div className="user-profile">
              <div className="profile-header">
                <img 
                  src={selectedUser.profile?.profileImage || '/assets/images/default-avatar.png'} 
                  alt="User" 
                  className="profile-image"
                />
                <div className="profile-info">
                  <h4>{selectedUser.profile?.firstName} {selectedUser.profile?.lastName}</h4>
                  <p>{selectedUser.email}</p>
                  <p className="joined-date">
                    Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="user-actions">
                <div className="action-group">
                  <h5>Verification Status</h5>
                  <div className="toggle-buttons">
                    <button 
                      className={selectedUser.isVerified ? 'active' : ''}
                      onClick={() => handleStatusUpdate(selectedUser._id, { isVerified: true })}
                    >
                      Verified
                    </button>
                    <button 
                      className={!selectedUser.isVerified ? 'active' : ''}
                      onClick={() => handleStatusUpdate(selectedUser._id, { isVerified: false })}
                    >
                      Unverified
                    </button>
                  </div>
                </div>
                
                <div className="action-group">
                  <h5>User Role</h5>
                  <div className="role-buttons">
                    <button 
                      className={selectedUser.role === 'admin' ? 'active' : ''}
                      onClick={() => handleStatusUpdate(selectedUser._id, { role: 'admin' })}
                    >
                      Admin
                    </button>
                    <button 
                      className={selectedUser.role === 'user' ? 'active' : ''}
                      onClick={() => handleStatusUpdate(selectedUser._id, { role: 'user' })}
                    >
                      Provider
                    </button>
                    <button 
                      className={selectedUser.role === 'member' ? 'active' : ''}
                      onClick={() => handleStatusUpdate(selectedUser._id, { role: 'member' })}
                    >
                      Member
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="user-stats">
                <div className="stat-item">
                  <span className="stat-label">Coin Balance:</span>
                  <span className="stat-value">{selectedUser.coins || 0}</span>
                </div>
                
                {/* Additional user statistics would go here */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;