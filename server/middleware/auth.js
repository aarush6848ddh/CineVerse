const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    // Get token from header, cookie, or session
    let token = req.headers.authorization?.split(' ')[1] || 
                req.cookies?.token || 
                req.session?.token;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      req.user = null;
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// Require authentication
const requireAuth = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(' ')[1] || 
                req.cookies?.token || 
                req.session?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or account is inactive.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please log in again.'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Authentication error.'
    });
  }
};

// Require specific role(s)
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Require critic or admin
const requireCritic = requireRole('critic', 'admin');

// Require admin
const requireAdmin = requireRole('admin');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

module.exports = {
  verifyToken,
  requireAuth,
  requireRole,
  requireCritic,
  requireAdmin,
  generateToken
};

