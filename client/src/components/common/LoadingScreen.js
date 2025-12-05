import React from 'react';
import { motion } from 'framer-motion';
import './LoadingScreen.css';

const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-screen">
      <motion.div 
        className="loading-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="loading-logo">
          <span className="logo-icon">🎬</span>
          <motion.span 
            className="logo-text"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            CineVerse
          </motion.span>
        </div>
        
        <div className="loading-spinner-container">
          <motion.div 
            className="loading-ring"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div 
            className="loading-ring inner"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        
        <p className="loading-message">{message}</p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;

