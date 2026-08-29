import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FestoraLogo } from '../FestoraLogo/FestoraLogo';
import { Search, Sun, Moon, Menu, X } from 'lucide-react';
import './Navbar.css';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Theme state initialization with localStorage & system preference
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('festora-theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('festora-theme', theme);
    } catch (e) {}
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className={`navbar-container ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner">
        
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand">
          <FestoraLogo size={36} isAnimated={false} />
          <div className="brand-title-box">
            <span className="brand-title">FESTORA</span>
            <span className="brand-pill-tag">
              <span className="live-pulse-dot" /> LIVE IN HYDERABAD
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="desktop-nav-links">
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/events" className={`nav-item ${location.pathname.startsWith('/events') ? 'active' : ''}`}>
            Events
          </Link>
          <Link to="/colleges" className={`nav-item ${location.pathname === '/colleges' ? 'active' : ''}`}>
            Colleges
          </Link>
          <Link to="/about" className={`nav-item ${location.pathname === '/about' ? 'active' : ''}`}>
            About
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Quick Search Toggle */}
          <button 
            className="nav-icon-btn" 
            onClick={() => setSearchOpen(!searchOpen)} 
            aria-label="Search Events"
            title="Search Events"
          >
            <Search size={18} />
          </button>

          {/* Compact Theme Switcher Control */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? (
              <Sun size={17} className="theme-icon sun-icon" />
            ) : (
              <Moon size={17} className="theme-icon moon-icon" />
            )}
          </button>

          {/* Mobile Hamburger Toggle */}
          <button 
            className="mobile-hamburger" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Quick Search Overlay Modal */}
      {searchOpen && (
        <div className="search-overlay-bar">
          <form onSubmit={handleSearchSubmit} className="search-form-inner">
            <Search size={20} className="search-bar-icon" />
            <input
              type="text"
              placeholder="Search hackathons, music fests, colleges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="search-bar-input"
            />
            <button type="submit" className="search-bar-submit">Search</button>
            <button type="button" onClick={() => setSearchOpen(false)} className="search-bar-close">
              <X size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/events" onClick={() => setMobileMenuOpen(false)}>Events</Link>
          <Link to="/colleges" onClick={() => setMobileMenuOpen(false)}>Colleges</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>

          <div className="mobile-theme-row">
            <span>Theme Mode</span>
            <button className="mobile-theme-toggle" onClick={toggleTheme}>
              {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
              <span>{theme === 'light' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

