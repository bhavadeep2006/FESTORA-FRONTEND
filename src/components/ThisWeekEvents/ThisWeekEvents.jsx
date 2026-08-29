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
        
        <div className="this-week-bar">
          <div className="this-week-label">
            <Flame size={16} className="flame-icon" />
            <span>THIS WEEK IN HYDERABAD</span>
          </div>

          <div className="this-week-items-row">
            {thisWeekList.map((evt) => (
              <Link key={evt.id} to={`/events/${evt.id}`} className="this-week-item">
                <span className="this-week-date">{evt.date.split(',')[0]}</span>
                <div className="this-week-info">
                  <span className="this-week-title">{evt.title}</span>
                  <span className="this-week-venue"><MapPin size={11} /> {evt.college}</span>
                </div>
                <ArrowRight size={13} className="item-arrow" />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default ThisWeekEvents;
