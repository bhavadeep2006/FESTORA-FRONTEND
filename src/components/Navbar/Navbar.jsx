import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FestoraLogo } from '../FestoraLogo/FestoraLogo';
import { Search, Sun, Moon, Monitor, Menu, X, User, Ticket, LogOut, LogIn, Heart, CalendarPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user, isAuthenticated, logout } = useAuth();
  const dropdownRef = useRef(null);

  // Theme mode state ('light' | 'dark' | 'system')
  const [themeMode, setThemeMode] = useState(() => {
    try {
      return localStorage.getItem('festora-theme') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  const location = useLocation();
  const navigate = useNavigate();

  const changeThemeMode = (mode) => {
    setThemeMode(mode);
    try {
      localStorage.setItem('festora-theme', mode);
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('festora-theme-change', { detail: mode }));
  };

  useEffect(() => {
    const applyTheme = (modeToApply) => {
      const activeMode = modeToApply || localStorage.getItem('festora-theme') || 'light';
      let targetTheme = activeMode;
      if (activeMode === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        targetTheme = isDark ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', targetTheme);
    };

    applyTheme(themeMode);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      const currentSaved = localStorage.getItem('festora-theme') || 'system';
      if (currentSaved === 'system') {
        applyTheme('system');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange);
    } else {
      mediaQuery.addListener(handleSystemChange);
    }

    const handleCustomEvent = (e) => {
      const newMode = e.detail || localStorage.getItem('festora-theme') || 'system';
      setThemeMode(newMode);
      applyTheme(newMode);
    };

    window.addEventListener('festora-theme-change', handleCustomEvent);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemChange);
      } else {
        mediaQuery.removeListener(handleSystemChange);
      }
      window.removeEventListener('festora-theme-change', handleCustomEvent);
    };
  }, [themeMode]);

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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
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
              <span className="live-pulse-dot" /> LIVE EVENTS
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

          {/* User Profile / Auth Control */}
          <div className="profile-menu-wrapper" ref={dropdownRef}>
            {isAuthenticated ? (
              <button
                className={`nav-icon-btn profile-btn ${profileDropdownOpen ? 'active' : ''}`}
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-label="User Profile Account"
                title="User Account"
                style={{ overflow: 'hidden', padding: user?.avatar ? '2px' : undefined }}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name || 'Profile'} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <User size={18} />
                )}
              </button>
            ) : (
              <Link to="/signin" className="navbar-signin-btn">
                Sign In
              </Link>
            )}

            {isAuthenticated && profileDropdownOpen && (
              <div className="profile-dropdown-card">
                <div className="dropdown-user-header">
                  <span className="dropdown-user-name">{user?.name || 'User'}</span>
                  <span className="dropdown-user-email">{user?.email || ''}</span>
                </div>
                <div className="dropdown-divider" />
                <Link
                  to="/profile"
                  className="dropdown-item-btn"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <User size={16} />
                  <span>My Profile</span>
                </Link>
                <Link
                  to="/tickets"
                  className="dropdown-item-btn"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <Ticket size={16} />
                  <span>My Tickets</span>
                </Link>
                <Link
                  to="/saved-events"
                  className="dropdown-item-btn"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <Heart size={16} />
                  <span>Saved Events</span>
                </Link>
                <Link
                  to="/host-event"
                  className="dropdown-item-btn"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <CalendarPlus size={16} />
                  <span>Host an Event</span>
                </Link>

                <div className="dropdown-divider" />

                {/* Appearance Theme Selector */}
                <div style={{ padding: '6px 12px 8px 12px' }}>
                  <span style={{ fontSize: '0.725rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                    Appearance
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      type="button"
                      className={`theme-opt-btn ${themeMode === 'light' ? 'active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); changeThemeMode('light'); }}
                      style={{
                        flex: 1,
                        padding: '6px 4px',
                        fontSize: '0.775rem',
                        borderRadius: '6px',
                        border: themeMode === 'light' ? '1px solid #8B5CF6' : '1px solid var(--border-card)',
                        background: themeMode === 'light' ? 'rgba(139, 92, 246, 0.15)' : 'var(--surface-secondary)',
                        color: themeMode === 'light' ? '#8B5CF6' : 'var(--text-main)',
                        fontWeight: themeMode === 'light' ? 700 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Sun size={12} />
                      <span>Light</span>
                    </button>
                    
                    <button 
                      type="button"
                      className={`theme-opt-btn ${themeMode === 'dark' ? 'active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); changeThemeMode('dark'); }}
                      style={{
                        flex: 1,
                        padding: '6px 4px',
                        fontSize: '0.775rem',
                        borderRadius: '6px',
                        border: themeMode === 'dark' ? '1px solid #8B5CF6' : '1px solid var(--border-card)',
                        background: themeMode === 'dark' ? 'rgba(139, 92, 246, 0.2)' : 'var(--surface-secondary)',
                        color: themeMode === 'dark' ? '#8B5CF6' : 'var(--text-main)',
                        fontWeight: themeMode === 'dark' ? 700 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Moon size={12} />
                      <span>Dark</span>
                    </button>

                    <button 
                      type="button"
                      className={`theme-opt-btn ${themeMode === 'system' ? 'active' : ''}`}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        changeThemeMode('system');
                      }}
                      style={{
                        flex: 1,
                        padding: '6px 4px',
                        fontSize: '0.775rem',
                        borderRadius: '6px',
                        border: themeMode === 'system' ? '1px solid #8B5CF6' : '1px solid var(--border-card)',
                        background: themeMode === 'system' ? 'rgba(139, 92, 246, 0.2)' : 'var(--surface-secondary)',
                        color: themeMode === 'system' ? '#8B5CF6' : 'var(--text-main)',
                        fontWeight: themeMode === 'system' ? 700 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Monitor size={12} />
                      <span>System</span>
                    </button>
                  </div>
                </div>

                <div className="dropdown-divider" />
                <button className="dropdown-item-btn logout-btn" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

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
          <Link to="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
              <Link to="/tickets" onClick={() => setMobileMenuOpen(false)}>My Tickets</Link>
              <Link to="/saved-events" onClick={() => setMobileMenuOpen(false)}>Saved Events</Link>
              <Link to="/host-event" onClick={() => setMobileMenuOpen(false)}>Host an Event</Link>
              <button 
                className="mobile-drawer-logout"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/signin" className="mobile-drawer-signin" onClick={() => setMobileMenuOpen(false)}>
              <LogIn size={16} />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

