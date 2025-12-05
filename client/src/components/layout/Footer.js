import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiInstagram, FiMail } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          {/* Brand Section */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="logo-icon">🎬</span>
              <span className="logo-text">CineVerse</span>
            </Link>
            <p className="footer-tagline">
              Discover, review, and share your favorite movies with a community of film enthusiasts.
            </p>
            <div className="footer-social">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FiTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FiInstagram />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FiGithub />
              </a>
              <a href="mailto:contact@cineverse.com" aria-label="Email">
                <FiMail />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          <div className="footer-links">
            <div className="footer-section">
              <h4>Discover</h4>
              <ul>
                <li><Link to="/search">Browse Movies</Link></li>
                <li><Link to="/search?sort=popular">Popular</Link></li>
                <li><Link to="/search?sort=top_rated">Top Rated</Link></li>
                <li><Link to="/search?sort=upcoming">Upcoming</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Community</h4>
              <ul>
                <li><Link to="/search">Recent Reviews</Link></li>
                <li><Link to="/search">Top Critics</Link></li>
                <li><Link to="/search">Movie Lists</Link></li>
                <li><Link to="/search">Discussions</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Account</h4>
              <ul>
                <li><Link to="/login">Log In</Link></li>
                <li><Link to="/register">Sign Up</Link></li>
                <li><Link to="/profile">Profile</Link></li>
                <li><Link to="/edit-profile">Settings</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Project</h4>
              <ul>
                <li><Link to="/about">About</Link></li>
                <li><a href="https://github.com/aarush6848ddh/CineVerse" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; {currentYear} CineVerse. All rights reserved.</p>
            <p className="footer-attribution">
              Powered by <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDB</a>
            </p>
          </div>
          <div className="footer-tmdb">
            <img 
              src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" 
              alt="TMDB Logo"
              className="tmdb-logo"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

