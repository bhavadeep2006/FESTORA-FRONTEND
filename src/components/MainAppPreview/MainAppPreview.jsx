import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FestoraLogo } from '../FestoraLogo/FestoraLogo';
import {
  Sparkles,
  Calendar,
  MapPin,
  Ticket,
  Search,
  Users,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import './MainAppPreview.css';

export const MainAppPreview = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Cultural Fests', 'Tech & Hackathons', 'Pro Nites', 'Workshops', 'Gaming'];

  const sampleEvents = [
    {
      id: 1,
      title: 'AURA 2026 — National Cultural Fest',
      college: 'St. Xavier\'s Campus, Mumbai',
      date: 'Mar 14 - 16, 2026',
      category: 'Cultural Fests',
      attendees: '12.4k Registered',
      tag: 'Trending #1',
      price: 'Free Pass Available',
      badgeColor: '#8B5CF6',
    },
    {
      id: 2,
      title: 'HACK-VERSIFY 4.0 Hackathon',
      college: 'IIT Tech Complex',
      date: 'Mar 20 - 21, 2026',
      category: 'Tech & Hackathons',
      attendees: '3.8k Hackers',
      tag: '$10,000 Prize Pool',
      price: 'Free Entry',
      badgeColor: '#6D28D9',
    },
    {
      id: 3,
      title: 'NEON WAVE Pro-Nite ft. EDM Stars',
      college: 'BITS Central Grounds',
      date: 'Apr 02, 2026',
      category: 'Pro Nites',
      attendees: '8.9k Passes Booked',
      tag: 'Phase 1 VIP',
      price: 'From $15',
      badgeColor: '#7C3AED',
    },
  ];

  return (
    <motion.div
      className="main-app-preview-container"
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Platform Header */}
      <header className="platform-header">
        <div className="header-brand">
          <FestoraLogo size={38} isAnimated={false} />
          <div className="brand-title-group">
            <span className="header-wordmark">FESTORA</span>
            <span className="badge-live-tag">
              <span className="live-dot" /> Campus Live
            </span>
          </div>
        </div>

        <nav className="header-nav">
          <a href="#events" className="nav-link active">Discover</a>
          <a href="#fests" className="nav-link">College Fests</a>
          <a href="#tickets" className="nav-link">My Passes</a>
          <a href="#schedule" className="nav-link">Calendar</a>
        </nav>

        <div className="header-actions">
          <button className="primary-action-btn">
            <Ticket size={16} />
            <span>Host Event</span>
          </button>
        </div>
      </header>

      {/* Hero Experience Banner */}
      <section className="hero-section">
        <div className="hero-backdrop-glow" />
        
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Sparkles size={14} className="sparkle-icon" />
          <span>Next-Gen College Event Platform</span>
        </motion.div>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Where Campus Events <br />
          <span className="highlight-text">Come Alive</span>
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Explore top college fests, hackathons, concerts, and workshops. Book verified passes instantly with your student ID.
        </motion.p>

        {/* Search & Filter Bar */}
        <motion.div
          className="search-bar-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search fests, college, artist, or event name..."
              className="search-input"
              readOnly
            />
            <button className="search-btn">
              <span>Explore</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Featured Events Grid */}
      <section className="events-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Featured Campus Events</h2>
            <p className="section-subtitle">Handpicked highlights happening across universities this month</p>
          </div>
          <button className="view-all-link">
            <span>View All (142)</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="events-grid">
          {sampleEvents.map((event, idx) => (
            <motion.div
              key={event.id}
              className="event-card"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + idx * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <div className="card-banner">
                <span className="event-tag" style={{ background: event.badgeColor }}>
                  {event.tag}
                </span>
                <div className="card-banner-pattern" />
              </div>

              <div className="card-body">
                <span className="event-category">{event.category}</span>
                <h3 className="event-title">{event.title}</h3>

                <div className="event-meta">
                  <div className="meta-item">
                    <MapPin size={14} />
                    <span>{event.college}</span>
                  </div>
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>{event.date}</span>
                  </div>
                  <div className="meta-item">
                    <Users size={14} />
                    <span>{event.attendees}</span>
                  </div>
                </div>

                <div className="card-footer">
                  <span className="price-tag">{event.price}</span>
                  <button className="get-pass-btn">
                    <span>Get Pass</span>
                    <Ticket size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Production Banner */}
      <section className="intro-info-card">
        <div className="info-card-content">
          <div className="info-badge">
            <ShieldCheck size={18} className="shield-icon" />
            <span>Verified Campus Network</span>
          </div>
          <h3>Empowering 100+ Colleges Across the Country</h3>
          <p>
            Festora provides seamless event ticketing, digital student passes, live schedule management, and instant entry validation for university festivals.
          </p>
        </div>
      </section>

      <footer className="platform-footer">
        <p>&copy; 2026 Festora Inc. &bull; Designed for Next-Gen College Event Experiences</p>
      </footer>
    </motion.div>
  );
};

