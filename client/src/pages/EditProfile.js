import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiUser, FiMail, FiMapPin, FiLink, FiPhone, FiCalendar,
  FiLock, FiEye, FiEyeOff, FiSave, FiArrowLeft, FiShield
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './EditProfile.css';

const EditProfile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    website: '',
    phone: '',
    dateOfBirth: '',
    specialization: ''
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    showEmail: false,
    showPhone: false,
    showDateOfBirth: false,
    showWatchlist: true,
    showFavorites: true
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState(false);

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        specialization: user.specialization?.join(', ') || ''
      });
      
      if (user.privacySettings) {
        setPrivacySettings(user.privacySettings);
      }
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrivacyChange = (e) => {
    const { name, checked } = e.target;
    setPrivacySettings(prev => ({ ...prev, [name]: checked }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const updates = {
      ...profileData,
      specialization: profileData.specialization 
        ? profileData.specialization.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      privacySettings
    };

    const result = await updateProfile(updates);

    if (result.success) {
      toast.success('Profile updated successfully!');
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await changePassword(
      passwordData.currentPassword,
      passwordData.newPassword
    );

    if (result.success) {
      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="edit-profile-page">
      <div className="container">
        <div className="edit-profile-header">
          <Link to="/profile" className="back-link">
            <FiArrowLeft /> Back to Profile
          </Link>
          <h1>Account Settings</h1>
        </div>

        <div className="edit-profile-layout">
          {/* Sidebar */}
          <nav className="settings-nav">
            <button
              className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveSection('profile')}
            >
              <FiUser /> Profile
            </button>
            <button
              className={`nav-item ${activeSection === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveSection('privacy')}
            >
              <FiShield /> Privacy
            </button>
            <button
              className={`nav-item ${activeSection === 'security' ? 'active' : ''}`}
              onClick={() => setActiveSection('security')}
            >
              <FiLock /> Security
            </button>
          </nav>

          {/* Content */}
          <div className="settings-content">
            {activeSection === 'profile' && (
              <motion.form
                className="settings-form"
                onSubmit={handleProfileSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h2>Profile Information</h2>
                <p className="settings-desc">
                  Update your personal information. Your username cannot be changed.
                </p>

                {/* Username (read-only) */}
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <div className="form-input-readonly">
                    <FiUser />
                    <span>@{user.username}</span>
                    <span className="readonly-badge">Cannot be changed</span>
                  </div>
                </div>

                {/* Email (read-only) */}
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <div className="form-input-readonly">
                    <FiMail />
                    <span>{user.email}</span>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                      className="form-input"
                      placeholder="John"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                      className="form-input"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    className="form-input form-textarea"
                    placeholder="Tell us about yourself..."
                    rows={4}
                    maxLength={500}
                  />
                  <span className="char-count">{profileData.bio.length}/500</span>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="location">
                      <FiMapPin /> Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={profileData.location}
                      onChange={handleProfileChange}
                      className="form-input"
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="website">
                      <FiLink /> Website
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={profileData.website}
                      onChange={handleProfileChange}
                      className="form-input"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">
                      <FiPhone /> Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="form-input"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="dateOfBirth">
                      <FiCalendar /> Date of Birth
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={profileData.dateOfBirth}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  </div>
                </div>

                {user.role === 'critic' && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="specialization">
                      Specialization (comma separated)
                    </label>
                    <input
                      type="text"
                      id="specialization"
                      name="specialization"
                      value={profileData.specialization}
                      onChange={handleProfileChange}
                      className="form-input"
                      placeholder="Horror, Sci-Fi, Drama"
                    />
                  </div>
                )}

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </motion.form>
            )}

            {activeSection === 'privacy' && (
              <motion.form
                className="settings-form"
                onSubmit={handleProfileSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h2>Privacy Settings</h2>
                <p className="settings-desc">
                  Control what information is visible to other users.
                </p>

                <div className="privacy-options">
                  <label className="privacy-option">
                    <div className="option-info">
                      <span className="option-label">Show Email</span>
                      <span className="option-desc">Display your email on your public profile</span>
                    </div>
                    <input
                      type="checkbox"
                      name="showEmail"
                      checked={privacySettings.showEmail}
                      onChange={handlePrivacyChange}
                      className="toggle-input"
                    />
                  </label>

                  <label className="privacy-option">
                    <div className="option-info">
                      <span className="option-label">Show Phone</span>
                      <span className="option-desc">Display your phone number on your public profile</span>
                    </div>
                    <input
                      type="checkbox"
                      name="showPhone"
                      checked={privacySettings.showPhone}
                      onChange={handlePrivacyChange}
                      className="toggle-input"
                    />
                  </label>

                  <label className="privacy-option">
                    <div className="option-info">
                      <span className="option-label">Show Date of Birth</span>
                      <span className="option-desc">Display your birthday on your public profile</span>
                    </div>
                    <input
                      type="checkbox"
                      name="showDateOfBirth"
                      checked={privacySettings.showDateOfBirth}
                      onChange={handlePrivacyChange}
                      className="toggle-input"
                    />
                  </label>

                  <label className="privacy-option">
                    <div className="option-info">
                      <span className="option-label">Show Watchlist</span>
                      <span className="option-desc">Allow others to see your watchlist</span>
                    </div>
                    <input
                      type="checkbox"
                      name="showWatchlist"
                      checked={privacySettings.showWatchlist}
                      onChange={handlePrivacyChange}
                      className="toggle-input"
                    />
                  </label>

                  <label className="privacy-option">
                    <div className="option-info">
                      <span className="option-label">Show Favorites</span>
                      <span className="option-desc">Allow others to see your favorite movies</span>
                    </div>
                    <input
                      type="checkbox"
                      name="showFavorites"
                      checked={privacySettings.showFavorites}
                      onChange={handlePrivacyChange}
                      className="toggle-input"
                    />
                  </label>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    <FiSave /> {loading ? 'Saving...' : 'Save Privacy Settings'}
                  </button>
                </div>
              </motion.form>
            )}

            {activeSection === 'security' && (
              <motion.form
                className="settings-form"
                onSubmit={handlePasswordSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h2>Change Password</h2>
                <p className="settings-desc">
                  Update your password to keep your account secure.
                </p>

                <div className="form-group">
                  <label className="form-label" htmlFor="currentPassword">
                    Current Password
                  </label>
                  <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="form-input"
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="newPassword">
                    New Password
                  </label>
                  <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="form-input"
                      placeholder="Enter new password"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPassword">
                    Confirm New Password
                  </label>
                  <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="form-input"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    <FiLock /> {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </motion.form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;

