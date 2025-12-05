import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiMessageCircle, FiList, FiActivity,
  FiSearch, FiTrash2, FiEdit2, FiShield, FiStar
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReviews: 0,
    totalCritics: 0,
    recentActivity: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, reviewsRes] = await Promise.all([
        api.get('/users'),
        api.get('/reviews?limit=50')
      ]);

      setUsers(usersRes.data.users || []);
      setReviews(reviewsRes.data.reviews || []);

      // Calculate stats
      const allUsers = usersRes.data.users || [];
      setStats({
        totalUsers: usersRes.data.pagination?.total || allUsers.length,
        totalReviews: reviewsRes.data.pagination?.total || reviewsRes.data.reviews?.length || 0,
        totalCritics: allUsers.filter(u => u.role === 'critic').length,
        recentActivity: allUsers.filter(u => {
          const date = new Date(u.createdAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return date > weekAgo;
        }).length
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;

    try {
      await api.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success('User deactivated');
    } catch (error) {
      toast.error('Failed to deactivate user');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(prev => prev.filter(r => r._id !== reviewId));
      toast.success('Review deleted');
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReviews = reviews.filter(r =>
    r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.movieTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="container">
        <header className="admin-header">
          <div className="admin-header-content">
            <h1>
              <FiShield /> Admin Dashboard
            </h1>
            <p>Manage users, reviews, and content</p>
          </div>
          <div className="admin-user">
            <span>Logged in as</span>
            <strong>{user?.username}</strong>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="stats-grid">
          <motion.div 
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-icon users">
              <FiUsers />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalUsers}</span>
              <span className="stat-label">Total Users</span>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-icon reviews">
              <FiMessageCircle />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalReviews}</span>
              <span className="stat-label">Total Reviews</span>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="stat-icon critics">
              <FiStar />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalCritics}</span>
              <span className="stat-label">Critics</span>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="stat-icon activity">
              <FiActivity />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.recentActivity}</span>
              <span className="stat-label">New This Week</span>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FiActivity /> Overview
          </button>
          <button
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <FiUsers /> Users
          </button>
          <button
            className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <FiMessageCircle /> Reviews
          </button>
        </div>

        {/* Search */}
        {(activeTab === 'users' || activeTab === 'reviews') && (
          <div className="admin-search">
            <FiSearch />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* Content */}
        <div className="admin-content">
          {loading ? (
            <div className="admin-loading">
              <div className="loading-spinner" />
              <p>Loading data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="overview-content">
                  <div className="recent-section">
                    <h3>Recent Users</h3>
                    <div className="recent-list">
                      {users.slice(0, 5).map(u => (
                        <div key={u._id} className="recent-item">
                          <div className="item-avatar">
                            {u.username[0].toUpperCase()}
                          </div>
                          <div className="item-info">
                            <span className="item-name">{u.username}</span>
                            <span className="item-meta">{u.role}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="recent-section">
                    <h3>Recent Reviews</h3>
                    <div className="recent-list">
                      {reviews.slice(0, 5).map(r => (
                        <div key={r._id} className="recent-item">
                          <div className="item-info">
                            <span className="item-name">{r.title}</span>
                            <span className="item-meta">{r.movieTitle}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="users-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u._id}>
                          <td>
                            <div className="table-user">
                              <div className="user-avatar-small">
                                {u.username[0].toUpperCase()}
                              </div>
                              <span>{u.username}</span>
                            </div>
                          </td>
                          <td className="text-muted">{u.email || '—'}</td>
                          <td>
                            <span className={`role-badge ${u.role}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="text-muted">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <div className="table-actions">
                              <button 
                                className="action-btn delete"
                                onClick={() => handleDeleteUser(u._id)}
                                title="Deactivate User"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="reviews-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Review</th>
                        <th>Movie</th>
                        <th>Author</th>
                        <th>Rating</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReviews.map(r => (
                        <tr key={r._id}>
                          <td>
                            <span className="table-title">{r.title}</span>
                          </td>
                          <td className="text-muted">{r.movieTitle}</td>
                          <td>{r.author?.username || 'Unknown'}</td>
                          <td>
                            <span className={`rating-badge ${r.rating >= 7 ? 'high' : r.rating >= 5 ? 'mid' : 'low'}`}>
                              {r.rating}/10
                            </span>
                          </td>
                          <td className="text-muted">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <div className="table-actions">
                              <button 
                                className="action-btn delete"
                                onClick={() => handleDeleteReview(r._id)}
                                title="Delete Review"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

