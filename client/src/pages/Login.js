import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
  const { login, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirect = sessionStorage.getItem('redirectAfterLogin') || '/';
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(redirect);
    }
  }, [isAuthenticated, navigate]);

  // Clear errors on mount
  useEffect(() => {
    clearError();
    setFormError('');
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const validateForm = () => {
    if (!formData.email) {
      setFormError('Email is required');
      return false;
    }
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) {
      setFormError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setFormError('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setFormError('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success('Welcome back!');
      const redirect = sessionStorage.getItem('redirectAfterLogin') || '/';
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(redirect);
    } else {
      setFormError(result.message);
      toast.error(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <span className="logo-icon">🎬</span>
              <span className="logo-text">CineVerse</span>
            </Link>
            <h1>Welcome Back</h1>
            <p>Log in to continue your movie journey</p>
          </div>

          {/* Error Message */}
          {(formError || error) && (
            <motion.div 
              className="auth-error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <FiAlertCircle />
              <span>{formError || error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="form-input"
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="form-input"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="loading-spinner small" />
                  Logging in...
                </span>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Sign up for free
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Side Content */}
        <div className="auth-side">
          <div className="auth-side-content">
            <h2>Discover. Review. Share.</h2>
            <p>
              Join thousands of movie enthusiasts. Write reviews, create lists, 
              and connect with fellow film lovers.
            </p>
            <div className="auth-features">
              <div className="auth-feature">
                <span className="feature-icon">🎬</span>
                <span>Explore thousands of movies</span>
              </div>
              <div className="auth-feature">
                <span className="feature-icon">✍️</span>
                <span>Write and share reviews</span>
              </div>
              <div className="auth-feature">
                <span className="feature-icon">📝</span>
                <span>Create personalized lists</span>
              </div>
              <div className="auth-feature">
                <span className="feature-icon">👥</span>
                <span>Follow critics and friends</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

