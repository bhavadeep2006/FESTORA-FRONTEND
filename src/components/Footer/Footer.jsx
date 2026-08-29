import React from 'react';
import { Link } from 'react-router-dom';
import { FestoraLogo } from '../FestoraLogo/FestoraLogo';
import { Twitter, Instagram, Linkedin, Github, Heart } from 'lucide-react';
import './Footer.css';

export const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-inner">
        
        {/* Col 1: Brand */}
        <div className="footer-brand-col">
          <div className="footer-logo-row">
            <FestoraLogo size={36} isAnimated={false} />
            <span className="footer-wordmark">FESTORA</span>
          </div>
          <p className="footer-tagline">
            Discover college events around Hyderabad. Connecting students, cultural councils, and campus communities across IIIT, JNTU, CBIT, OU, and top universities.
          </p>
          <div className="footer-social-row">
            <a href="#twitter" aria-label="Twitter" className="social-icon-btn"><Twitter size={16} /></a>
            <a href="#instagram" aria-label="Instagram" className="social-icon-btn"><Instagram size={16} /></a>
            <a href="#linkedin" aria-label="LinkedIn" className="social-icon-btn"><Linkedin size={16} /></a>
            <a href="#github" aria-label="GitHub" className="social-icon-btn"><Github size={16} /></a>
          </div>
        </div>

        {/* Col 2: Navigation */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">Explore</h4>
          <Link to="/" className="footer-link">Home</Link>
          <Link to="/events" className="footer-link">Events</Link>
          <Link to="/colleges" className="footer-link">Colleges</Link>
          <Link to="/about" className="footer-link">Categories</Link>
        </div>

        {/* Col 3: Company */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">Company</h4>
          <Link to="/about" className="footer-link">About</Link>
          <Link to="/register" className="footer-link">Host an Event</Link>
          <a href="mailto:support@festora.in" className="footer-link">Contact</a>
        </div>

        {/* Col 4: Hyderabad Hubs */}
        <div className="footer-links-col">
          <h4 className="footer-col-title">Hyderabad Hubs</h4>
          <Link to="/events?location=gachibowli" className="footer-link">Gachibowli</Link>
          <Link to="/events?location=madhapur" className="footer-link">Madhapur</Link>
          <Link to="/events?location=hitec-city" className="footer-link">HITEC City</Link>
          <Link to="/events?location=kukatpally" className="footer-link">Kukatpally</Link>
        </div>

      </div>

      <div className="footer-bottom-bar">
        <p>&copy; 2026 Festora Inc. &bull; All rights reserved.</p>
        <p className="made-with-love">Crafted with <Heart size={14} className="heart-icon" /> for Hyderabad Campus Energy</p>
      </div>
    </footer>
  );
};

