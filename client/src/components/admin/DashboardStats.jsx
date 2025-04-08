// client/src/components/admin/DashboardStats.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setStats(response.data);
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <div className="dashboard-stats">
      <div className="stats-grid">
        <div className="stats-card user-stats">
          <h3>User Statistics</h3>
          <div className="stats-numbers">
            <div className="stat-item">
              <span className="stat-value">{stats.users.total}</span>
              <span className="stat-label">Total Users</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.users.providers}</span>
              <span className="stat-label">Service Providers</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.users.members}</span>
              <span className="stat-label">Members</span>
            </div>
          </div>
        </div>
        
        <div className="stats-card service-stats">
          <h3>Service Statistics</h3>
          <div className="stats-numbers">
            <div className="stat-item">
              <span className="stat-value">{stats.services.activeAds}</span>
              <span className="stat-label">Active Service Ads</span>
            </div>
          </div>
        </div>
        
        <div className="stats-card financial-stats">
          <h3>Financial Overview</h3>
          <div className="stats-numbers">
            <div className="stat-item">
              <span className="stat-value">${stats.financial.totalRevenue.toFixed(2)}</span>
              <span className="stat-label">Total Revenue</span>
            </div>
          </div>
        </div>
        
        <div className="stats-card call-stats">
          <h3>Call Statistics</h3>
          <div className="stats-numbers">
            <div className="stat-item">
              <span className="stat-value">{stats.calls.total}</span>
              <span className="stat-label">Total Calls</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.calls.completed}</span>
              <span className="stat-label">Completed Calls</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.calls.totalMinutes}</span>
              <span className="stat-label">Total Minutes</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.calls.avgRating.toFixed(1)}</span>
              <span className="stat-label">Avg. Rating</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="charts-container">
        <div className="chart-card">
          <h3>Call Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={generateMockCallData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="calls" fill="#8884d8" />
              <Bar dataKey="minutes" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-card">
          <h3>Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={generateMockRevenueData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="recent-transactions">
        <h3>Recent Transactions</h3>
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.financial.recentTransactions.map((transaction, index) => (
              <tr key={index}>
                <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                <td>{transaction.type}</td>
                <td>${transaction.amount.toFixed(2)}</td>
                <td>{transaction.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Mock data generator functions
const generateMockCallData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    date: day,
    calls: Math.floor(Math.random() * 50) + 10,
    minutes: Math.floor(Math.random() * 500) + 100
  }));
};

const generateMockRevenueData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    date: day,
    revenue: Math.floor(Math.random() * 2000) + 500
  }));
};

export default DashboardStats;