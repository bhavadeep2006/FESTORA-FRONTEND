import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Calendar, MapPin, ArrowRight, Compass } from 'lucide-react';
import { eventsData } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { EventCard } from '../components/EventCard/EventCard';
import './SavedEventsPage.css';

export const SavedEventsPage = () => {
  const { savedEventIds } = useAuth();

  const savedEvents = eventsData.filter(e => savedEventIds.includes(e.id));

  return (
    <div className="saved-events-page-view">
      <div className="section-container">
        
        {/* Page Header */}
        <motion.div 
          className="saved-header-box"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <span className="eyebrow-tag">
            <Heart size={14} fill="var(--strong-lavender)" /> BOOKMARKED EXPERIENCE
          </span>
          <h1 className="saved-title">Saved Campus Events</h1>
          <p className="saved-subtitle">
            Keep track of the hackathons, music concerts, and fests you're interested in attending.
          </p>
        </motion.div>

        {/* Saved Events Grid */}
        {savedEvents.length === 0 ? (
          <div className="saved-empty-card">
            <div className="heart-icon-circle">
              <Heart size={32} />
            </div>
            <h3>No saved events yet.</h3>
            <p>Explore campus fests across Hyderabad and tap the heart icon to save your favorites.</p>
            <Link to="/events" className="explore-btn-cta">
              <Compass size={18} />
              <span>Explore Events</span>
            </Link>
          </div>
        ) : (
          <div className="events-display-wrapper grid" style={{ marginTop: '32px' }}>
            {savedEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default SavedEventsPage;
