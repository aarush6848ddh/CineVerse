import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiUser, FiLogOut, FiMenu, FiX, 
  FiHome, FiFilm, FiSettings, FiShield, FiHeart
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileMenuRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  // Close profile menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getUserInitials = () => {
    if (!user) return '?';
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username[0].toUpperCase();
  };

  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🎬</span>
          <span className="logo-text">CineVerse</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="navbar-nav hide-mobile">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <FiHome />
            <span>Home</span>
          </Link>
          <Link to="/search" className={`nav-link ${location.pathname.startsWith('/search') ? 'active' : ''}`}>
            <FiFilm />
            <span>Discover</span>
          </Link>
        </nav>

        {/* Search Bar */}
        <form className="navbar-search hide-mobile" onSubmit={handleSearch}>
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </form>

        {/* Right Section */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="profile-menu-container" ref={profileMenuRef}>
              <button 
                className="profile-button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                aria-label="Profile menu"
              >
                <div className="profile-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} />
                  ) : (
                    <span>{getUserInitials()}</span>
                  )}
                </div>
                <span className="profile-name hide-mobile">{user.username}</span>
                {user.role === 'critic' && (
                  <span className="badge badge-critic hide-mobile">Critic</span>
                )}
              </button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    className="profile-menu"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="profile-menu-header">
                      <p className="profile-menu-name">{user.firstName || user.username}</p>
                      <p className="profile-menu-email">{user.email}</p>
                      <span className={`badge ${user.role === 'critic' ? 'badge-critic' : ''}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </div>
                    <div className="profile-menu-divider" />
                    <Link to="/profile" className="profile-menu-item">
                      <FiUser />
                      <span>My Profile</span>
                    </Link>
                    <Link to="/profile" className="profile-menu-item">
                      <FiHeart />
                      <span>Watchlist</span>
                    </Link>
                    <Link to="/edit-profile" className="profile-menu-item">
                      <FiSettings />
                      <span>Settings</span>
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="profile-menu-item">
                        <FiShield />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <div className="profile-menu-divider" />
                    <button onClick={handleLogout} className="profile-menu-item logout">
                      <FiLogOut />
                      <span>Log Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-button hide-desktop"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <form className="mobile-search" onSubmit={handleSearch}>
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <nav className="mobile-nav">
              <Link to="/" className="mobile-nav-link">
                <FiHome />
                <span>Home</span>
              </Link>
              <Link to="/search" className="mobile-nav-link">
                <FiFilm />
                <span>Discover</span>
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/profile" className="mobile-nav-link">
                    <FiUser />
                    <span>Profile</span>
                  </Link>
                  <Link to="/edit-profile" className="mobile-nav-link">
                    <FiSettings />
                    <span>Settings</span>
                  </Link>
                </>
              )}
            </nav>
            {!isAuthenticated && (
              <div className="mobile-auth">
                <Link to="/login" className="btn btn-secondary w-full">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary w-full">
                  Sign Up
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

