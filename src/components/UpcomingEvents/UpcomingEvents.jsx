import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { eventsData as fallbackEvents } from '../../data/mockData';
import { Calendar, MapPin, Ticket, Clock, ArrowRight, Sparkles } from 'lucide-react';
import './UpcomingEvents.css';

export const UpcomingEvents = () => {
  const [eventsList, setEventsList] = useState([]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await api.getPublicEvents();
        if (response.events && response.events.length > 0) {
          setEventsList(response.events);
        } else {
          setEventsList(fallbackEvents);
        }
      } catch (err) {
        setEventsList(fallbackEvents);
      }
    };
    loadEvents();
  }, []);

  return (
    <section className="upcoming-section">
      <div className="section-container">
        
        {/* Header */}
        <div className="upcoming-header">
          <div>
            <span className="section-eyebrow">
              <Sparkles size={13} className="eyebrow-icon" /> UPCOMING EVENT CALENDAR
            </span>
            <h2 className="upcoming-title">Upcoming Events</h2>
          </div>
          <Link to="/events" className="upcoming-view-btn">
            <span>Full Schedule Matrix</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Structured Timeline Matrix List */}
        <div className="timeline-list">
          {eventsList.map((evt, idx) => (
            <motion.div
              key={evt.id}
              className="timeline-item-row"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Left Date Block */}
              <div className="timeline-date-block">
                <Calendar size={18} className="date-icon" />
                <span className="date-text">{evt.date}</span>
              </div>

              {/* Center Event Details */}
              <div className="timeline-main-info">
                <span className="event-cat-pill" style={{ color: evt.badgeColor }}>
                  {evt.category}
                </span>
                <h3 className="timeline-event-name">{evt.title}</h3>
                <div className="timeline-meta-inline">
                  <span><MapPin size={13} /> {evt.college}, {evt.location}</span>
                  <span><Clock size={13} /> {evt.time}</span>
                </div>
              </div>

              {/* Right Action */}
              <div className="timeline-action">
                <Link to={`/events/${evt.id}`} className="timeline-pass-btn">
                  <span>Get Pass</span>
                  <Ticket size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

