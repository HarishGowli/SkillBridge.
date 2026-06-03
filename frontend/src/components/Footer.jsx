import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        
        <div className="footer-section brand-info">
          <div className="logo">
            <span className="logo-icon">SB</span> 
            <span className="logo-text">SkillBridge</span>
          </div>
          <p className="description">
            Connecting volunteers with NGOs to create meaningful social impact worldwide.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="./Opportunities">Opportunities</Link></li>
            <li><Link to="./About">About Us</Link></li>
            <li><Link to="./Contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>For Volunteers</h3>
          <ul>
            <li><Link to="./Register">Sign Up</Link></li>
            <li><Link to="./Opportunities">Browse Opportunities</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>For NGOs</h3>
          <ul>
            <li><Link to="./Register">Register Your NGO</Link></li>
            <li><Link to="./NgoDash">Post Opportunities</Link></li>
          </ul>
        </div>
      </div>

      <hr className="footer-divider" />

      <div className="footer-bottom">
        <p className="copyright">
          © 2024 SkillBridge. All rights reserved.
        </p>
        <div className="social-links">
          <a href="https://www.infosys.com/" aria-label="Twitter"><i className="fa-brands fa-twitter"></i></a> 
          <a href="https://www.infosys.com/" aria-label="LinkedIn"><i className="fa-brands fa-square-linkedin"></i></a>
          <a href="https://www.infosys.com/" aria-label="GitHub"><i className="fa-brands fa-github"></i></a>
          <a href="https://www.infosys.com/" aria-label="Email"><i className="fa-solid fa-square-envelope"></i></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;