import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Ticket, ArrowUpRight } from 'lucide-react';
import './EventCard.css';

export const EventCard = ({ event }) => {
  return (
    <motion.div
      className="event-card-container"
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
    >
      <Link to={`/events/${event.id}`} className="event-card-link">
        {/* Banner Poster Header */}
        <div className="card-image-box">
          <img src={event.banner} alt={event.title} className="card-banner-img" loading="lazy" />
          <div className="card-overlay-gradient" />
          <span className="card-tag-badge" style={{ backgroundColor: event.badgeColor || '#8B5CF6' }}>
            {event.tag}
          </span>
          <div className="card-quick-arrow">
            <ArrowUpRight size={18} />
          </div>
        </div>

        {/* Card Main Body */}
        <div className="card-content-body">
          <span className="card-category-label">{event.category}</span>
          <h3 className="card-event-title">{event.title}</h3>

          <div className="card-meta-list">
            <div className="meta-row">
              <MapPin size={14} className="meta-icon" />
              <span>{event.college} &bull; {event.location}</span>
            </div>
            <div className="meta-row">
              <Calendar size={14} className="meta-icon" />
              <span>{event.date}</span>
            </div>
            <div className="meta-row">
              <Users size={14} className="meta-icon" />
              <span>{event.attendees}</span>
            </div>
          </div>

          <div className="card-action-footer">
            <span className="price-label">{event.price}</span>
            <span className="view-pass-btn">
              <span>View Event</span>
              <Ticket size={14} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
