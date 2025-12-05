import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiUser, FiMail, FiLock, FiEye, FiEyeOff, 
  FiAlertCircle, FiCheck 
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const { register, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'viewer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
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
    if (!formData.username) {
      setFormError('Username is required');
      return false;
    }
    if (formData.username.length < 3) {
      setFormError('Username must be at least 3 characters');
      return false;
    }
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
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setFormError('');

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: formData.role
    });

    if (result.success) {
      toast.success('Welcome to CineVerse!');
      navigate('/');
    } else {
      setFormError(result.message);
      toast.error(result.message);
    }

    setLoading(false);
  };

  const passwordRequirements = [
    { met: formData.password.length >= 6, text: 'At least 6 characters' },
    { met: formData.password && formData.password === formData.confirmPassword, text: 'Passwords match' }
  ];

  return (
    <div className="auth-page">
      <div className="auth-container">
        <motion.div 
          className="auth-card register-card"
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
            <h1>Create Account</h1>
            <p>Join the movie community today</p>
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
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className="form-input"
                  autoComplete="given-name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="form-input"
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="coolmovielover"
                  className="form-input"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address <span className="required">*</span>
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
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="form-input"
                  autoComplete="new-password"
                  required
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

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="form-input"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {/* Password Requirements */}
            <div className="password-requirements">
              {passwordRequirements.map((req, index) => (
                <div key={index} className={`requirement ${req.met ? 'met' : ''}`}>
                  <FiCheck />
                  <span>{req.text}</span>
                </div>
              ))}
            </div>

            {/* Role Selection */}
            <div className="form-group">
              <label className="form-label">Account Type</label>
              <div className="role-selector">
                <label className={`role-option ${formData.role === 'viewer' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="viewer"
                    checked={formData.role === 'viewer'}
                    onChange={handleChange}
                  />
                  <div className="role-content">
                    <span className="role-icon">👤</span>
                    <span className="role-name">Viewer</span>
                    <span className="role-desc">Browse, rate, and review movies</span>
                  </div>
                </label>
                <label className={`role-option ${formData.role === 'critic' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="critic"
                    checked={formData.role === 'critic'}
                    onChange={handleChange}
                  />
                  <div className="role-content">
                    <span className="role-icon">✍️</span>
                    <span className="role-name">Critic</span>
                    <span className="role-desc">Professional reviews with verified badge</span>
                  </div>
                </label>
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
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>

            <p className="auth-terms">
              By signing up, you agree to our Terms of Service
            </p>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Log in
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Side Content */}
        <div className="auth-side">
          <div className="auth-side-content">
            <h2>Join Our Community</h2>
            <p>
              Create an account to unlock all features and become part of our 
              growing movie community.
            </p>
            <div className="auth-features">
              <div className="auth-feature">
                <span className="feature-icon">🎬</span>
                <span>Access to complete movie database</span>
              </div>
              <div className="auth-feature">
                <span className="feature-icon">⭐</span>
                <span>Rate and review your favorites</span>
              </div>
              <div className="auth-feature">
                <span className="feature-icon">📋</span>
                <span>Create custom watchlists</span>
              </div>
              <div className="auth-feature">
                <span className="feature-icon">🏆</span>
                <span>Earn badges and recognition</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

