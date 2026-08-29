import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { eventsData } from '../../data/mockData';
import { MapPin, Calendar, ArrowRight, Flame } from 'lucide-react';
import './ThisWeekEvents.css';

export const ThisWeekEvents = () => {
  // Use first 3 events for "This Week In Hyderabad"
  const thisWeekList = eventsData.slice(0, 3);

  return (
    <section className="this-week-section">
      <div className="section-container">
        
        <motion.div 
          className="this-week-bar"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="this-week-label">
            <Flame size={16} className="flame-icon" />
            <span>THIS WEEK IN HYDERABAD</span>
          </div>

          <div className="this-week-items-row">
            {thisWeekList.map((evt, idx) => (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 + idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to={`/events/${evt.id}`} className="this-week-item">
                  <span className="this-week-date">{evt.date.split(',')[0]}</span>
                  <div className="this-week-info">
                    <span className="this-week-title">{evt.title}</span>
                    <span className="this-week-venue"><MapPin size={11} /> {evt.college}</span>
                  </div>
                  <ArrowRight size={13} className="item-arrow" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default ThisWeekEvents;
