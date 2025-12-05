import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiSearch, FiArrowLeft } from 'react-icons/fi';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <motion.div 
        className="not-found-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="not-found-icon">🎬</div>
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Scene Not Found</h2>
        <p className="not-found-text">
          Looks like this movie scene ended up on the cutting room floor. 
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary btn-lg">
            <FiHome /> Go Home
          </Link>
          <Link to="/search" className="btn btn-secondary btn-lg">
            <FiSearch /> Search Movies
          </Link>
        </div>

        <button 
          onClick={() => window.history.back()} 
          className="back-button"
        >
          <FiArrowLeft /> Go Back
        </button>
      </motion.div>

      {/* Decorative Elements */}
      <div className="decoration decoration-1">🎥</div>
      <div className="decoration decoration-2">🎞️</div>
      <div className="decoration decoration-3">🎭</div>
      <div className="decoration decoration-4">🍿</div>
    </div>
  );
};

export default NotFound;

