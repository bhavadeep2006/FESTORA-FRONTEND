import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { eventsData as fallbackEvents } from '../../data/mockData';
import { Flame, ArrowRight, MapPin, Calendar, Users, Sparkles, RefreshCw } from 'lucide-react';
import './FeaturedEvents.css';

export const FeaturedEvents = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedEvents = async () => {
      try {
        const response = await api.getPublicEvents();
        if (response.events && response.events.length > 0) {
          setEventsList(response.events);
        } else {
          setEventsList(fallbackEvents);
        }
      } catch (err) {
        console.warn('[FeaturedEvents] Using fallback mock events:', err.message);
        setEventsList(fallbackEvents);
      } finally {
        setLoading(false);
      }
    };
    loadFeaturedEvents();
  }, []);

  const filterTabs = ['All', 'Cultural Fests', 'Tech & Hackathons', 'Esports & Gaming'];

  const filteredEvents = activeFilter === 'All'
    ? eventsList
    : eventsList.filter(evt => evt.category === activeFilter);

  const mainFeatured = filteredEvents[0] || eventsList[0] || fallbackEvents[0];
  const sideEvents = filteredEvents.slice(1, 3);
  const horizontalEvent = filteredEvents[3] || eventsList[4] || fallbackEvents[4];

  return (
    <section className="featured-events-section" id="featured">
      <div className="section-container">
        
        {/* Header */}
        <div className="featured-header">
          <div>
            <div className="eyebrow-tag">
              <Flame size={14} className="flame-icon" />
              <span>FEATURED EVENT HIGHLIGHTS</span>
            </div>
            <h2 className="featured-title">Explore Trending Experiences</h2>
          </div>

          <Link to="/events" className="view-all-events-btn">
            <span>Browse All Fests ({eventsList.length})</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs-row">
          {filterTabs.map(tab => (
            <button
              key={tab}
              className={`filter-tab ${activeFilter === tab ? 'active' : ''}`}
              onClick={() => setActiveFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <RefreshCw size={28} className="spin-icon" style={{ animation: 'spin 1s linear infinite', color: '#8B5CF6' }} />
            <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading featured events...</p>
          </div>
        ) : (
          /* Editorial Asymmetric Composition */
          <div className="editorial-composition-grid">
            
            {/* 1. Hero Featured Large Card */}
            {mainFeatured && (
              <motion.div
                className="editorial-main-card"
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileTap={{ scale: 0.985 }}
              >
                <Link to={`/events/${mainFeatured.id}`} className="editorial-main-link">
                  <div className="editorial-banner-box">
                    <img src={mainFeatured.banner} alt={mainFeatured.title} className="editorial-banner-img" />
                    <div className="editorial-gradient-overlay" />
                    <span className="editorial-badge" style={{ background: mainFeatured.badgeColor }}>
                      <Sparkles size={12} /> {mainFeatured.tag}
                    </span>
                    <span className="editorial-attendees"><Users size={12} /> {mainFeatured.attendees}</span>
                  </div>
                  <div className="editorial-body">
                    <span className="editorial-cat">{mainFeatured.category}</span>
                    <h3 className="editorial-headline">{mainFeatured.title}</h3>
                    <p className="editorial-desc">{mainFeatured.description}</p>
                    <div className="editorial-meta-row">
                      <span><MapPin size={13} /> {mainFeatured.college}, {mainFeatured.location}</span>
                      <span><Calendar size={13} /> {mainFeatured.date}</span>
                    </div>
                    <div className="editorial-footer">
                      <span className="editorial-price">{mainFeatured.price}</span>
                      <span className="editorial-explore-btn">
                        <span>Explore Event</span>
                        <ArrowRight size={15} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* 2. Right Side Stacked 2 Smaller Cards */}
            <div className="editorial-side-stack">
              {sideEvents.map((evt, idx) => (
                <motion.div
                  key={evt.id}
                  className="editorial-side-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.4, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  whileTap={{ scale: 0.985 }}
                >
                  <Link to={`/events/${evt.id}`} className="side-card-link">
                    <div className="side-thumb-box">
                      <img src={evt.banner} alt={evt.title} className="side-thumb-img" />
                      <span className="side-cat-pill">{evt.category}</span>
                    </div>
                    <div className="side-content">
                      <span className="side-college">{evt.college}</span>
                      <h4 className="side-title">{evt.title}</h4>
                      <div className="side-meta">
                        <span><Calendar size={12} /> {evt.date}</span>
                        <span className="side-price">{evt.price}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

          </div>
        )}

        {/* 3. Bottom Horizontal Banner Event Card */}
        {horizontalEvent && !loading && (
          <motion.div
            className="editorial-horizontal-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link to={`/events/${horizontalEvent.id}`} className="horizontal-card-link">
              <div className="horizontal-badge-col">
                <span className="horizon-tag">{horizontalEvent.category}</span>
                <span className="horizon-status">REGISTRATION OPEN</span>
              </div>
              <div className="horizontal-main-col">
                <h4 className="horizon-title">{horizontalEvent.title}</h4>
                <div className="horizon-meta-inline">
                  <span><MapPin size={13} /> {horizontalEvent.college} &bull; {horizontalEvent.location}</span>
                  <span><Calendar size={13} /> {horizontalEvent.date}</span>
                </div>
              </div>
              <div className="horizontal-action-col">
                <span className="horizon-explore">
                  <span>Explore Event</span>
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          </motion.div>
        )}

      </div>
    </section>
  );
};


