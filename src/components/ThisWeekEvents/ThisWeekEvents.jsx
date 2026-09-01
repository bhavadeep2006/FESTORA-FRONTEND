import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { eventsData as fallbackEvents } from '../../data/mockData';
import { MapPin, ArrowRight, Flame } from 'lucide-react';
import './ThisWeekEvents.css';

export const ThisWeekEvents = () => {
  const [eventsList, setEventsList] = useState([]);
  const navigate = useNavigate();

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

  const displayList = eventsList.length > 0 
    ? [...eventsList, ...eventsList, ...eventsList, ...eventsList]
    : [...fallbackEvents, ...fallbackEvents, ...fallbackEvents, ...fallbackEvents];

  const handleCardClick = (e, evt) => {
    e.preventDefault();
    e.stopPropagation();
    const eventId = typeof evt === 'object' ? evt?.id : evt;
    console.log('[TRENDING EVENT CLICK]', { id: eventId, title: typeof evt === 'object' ? evt?.title : undefined });
    if (eventId) {
      navigate(`/events/${eventId}`);
    }
  };

  return (
    <section className="this-week-section">
      <div className="section-container">
        
        <div className="this-week-bar">
          <div className="this-week-label">
            <Flame size={18} className="flame-icon" />
            <span>TRENDING THIS WEEK</span>
          </div>

          <div className="marquee-outer-container">
            <div className="marquee-track">
              {displayList.map((evt, idx) => (
                <div 
                  key={`${evt.id}-${idx}`} 
                  onClick={(e) => handleCardClick(e, evt)} 
                  className="this-week-item"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCardClick(e, evt); }}
                >
                  <span className="this-week-date">
                    {evt.event_date ? new Date(evt.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : (evt.date ? evt.date.split(',')[0] : 'Upcoming')}
                  </span>
                  <div className="this-week-info">
                    <span className="this-week-title">{evt.title}</span>
                    <span className="this-week-venue"><MapPin size={11} /> {evt.venue || evt.college || 'Campus Venue'}</span>
                  </div>
                  <ArrowRight size={13} className="item-arrow" />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ThisWeekEvents;
