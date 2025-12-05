import React from 'react';
import { FiGithub, FiExternalLink } from 'react-icons/fi';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <h1>About CineVerse</h1>
        <p className="about-description">
          A full-stack movie discovery and review platform built for the Web Development Final Project.
        </p>

        <section className="team-section">
          <h2>Team Members</h2>
          <div className="team-grid">
            <div className="team-card">
              <div className="team-avatar">AS</div>
              <h3>Aarush Singh</h3>
              <p className="team-section-info">Section: CS4550</p>
            </div>
          </div>
        </section>

        <section className="links-section">
          <h2>Project Links</h2>
          <div className="links-grid">
            <a 
              href="https://github.com/aarush6848ddh/CineVerse" 
              target="_blank" 
              rel="noopener noreferrer"
              className="link-card"
            >
              <FiGithub className="link-icon" />
              <div>
                <h3>Frontend Repository</h3>
                <p>React application source code</p>
              </div>
              <FiExternalLink className="external-icon" />
            </a>
            <a 
              href="https://github.com/aarush6848ddh/CineVerse" 
              target="_blank" 
              rel="noopener noreferrer"
              className="link-card"
            >
              <FiGithub className="link-icon" />
              <div>
                <h3>Backend Repository</h3>
                <p>Node.js/Express server source code</p>
              </div>
              <FiExternalLink className="external-icon" />
            </a>
          </div>
        </section>

        <section className="tech-section">
          <h2>Technologies Used</h2>
          <div className="tech-grid">
            <span className="tech-badge">React</span>
            <span className="tech-badge">Node.js</span>
            <span className="tech-badge">Express</span>
            <span className="tech-badge">MongoDB</span>
            <span className="tech-badge">JWT</span>
            <span className="tech-badge">TMDB API</span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;

