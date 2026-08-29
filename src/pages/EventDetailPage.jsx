import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventsData } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Calendar,
  Clock,
  Award,
  Users,
  Ticket,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Share2,
  Heart
} from 'lucide-react';
import './EventDetailPage.css';

export const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, savedEventIds, toggleSaveEvent } = useAuth();
  const [copiedMsg, setCopiedMsg] = React.useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const event = eventsData.find((e) => e.id === id) || eventsData[0];
  const isSaved = savedEventIds?.includes(event.id);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out ${event.title} on Festora!`,
          url: window.location.href,
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2000);
    }
  };

  return (
    <div className="event-detail-view">
      
      {/* Top Breadcrumb Navigation */}
      <div className="detail-top-bar">
        <div className="section-container">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            <span>Back to Events</span>
          </button>
        </div>
      </div>

      {/* Main Hero Header: Image, Title, & Key Event Info Top */}
      <div className="detail-hero-header">
        <div className="detail-banner-box">
          <img src={event.banner} alt={event.title} className="detail-banner-img" />
          <div className="detail-banner-overlay" />
        </div>

        <div className="section-container detail-hero-content">
          <div className="detail-badge-row">
            <span className="detail-category-badge">{event.category}</span>
            <span className="detail-tag-badge" style={{ backgroundColor: event.badgeColor }}>
              {event.tag}
            </span>
          </div>

          <h1 className="detail-title">{event.title}</h1>
          <p className="detail-organizer-tag">Organized by {event.organizers}</p>

          <div className="detail-meta-grid">
            <div className="meta-card">
              <MapPin size={18} className="meta-card-icon" />
              <div>
                <span className="meta-card-label">Venue / College</span>
                <span className="meta-card-value">{event.college}, {event.location}</span>
              </div>
            </div>

            <div className="meta-card">
              <Calendar size={18} className="meta-card-icon" />
              <div>
                <span className="meta-card-label">Dates</span>
                <span className="meta-card-value">{event.date}</span>
              </div>
            </div>

            <div className="meta-card">
              <Clock size={18} className="meta-card-icon" />
              <div>
                <span className="meta-card-label">Timings</span>
                <span className="meta-card-value">{event.time}</span>
              </div>
            </div>

            <div className="meta-card">
              <Award size={18} className="meta-card-icon" />
              <div>
                <span className="meta-card-label">Prizes</span>
                <span className="meta-card-value">{event.prizes}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Main Details + Registration Card Sidebar */}
      <div className="section-container detail-main-layout">
        
        {/* Left Column: Description, Schedule, Rules */}
        <div className="detail-body-col">
          
          {/* Overview */}
          <div className="detail-block-card">
            <h2 className="block-title">About the Event</h2>
            <p className="block-text">{event.description}</p>

            <div className="eligibility-box">
              <ShieldCheck size={20} className="shield-icon" />
              <div>
                <h4>Eligibility & Requirements</h4>
                <p>{event.eligibility}</p>
              </div>
            </div>
          </div>

          {/* Schedule Timeline */}
          {event.schedule && (
            <div className="detail-block-card">
              <h2 className="block-title">Event Schedule & Timeline</h2>
              <div className="schedule-timeline">
                {event.schedule.map((item, index) => (
                  <div key={index} className="schedule-item-card">
                    <div className="schedule-time-badge">{item.time}</div>
                    <div className="schedule-info-box">
                      <h4 className="schedule-item-title">{item.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guidelines & Rules */}
          {event.rules && (
            <div className="detail-block-card">
              <h2 className="block-title">Rules & Participation Guidelines</h2>
              <ul className="rules-list">
                {event.rules.map((rule, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={16} className="rule-check-icon" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Right Sidebar: Registration Box */}
        <div className="detail-sidebar-col">
          <div className="sidebar-sticky-card">
            <span className="sidebar-price-tag">{event.price}</span>
            <div className="sidebar-attendees-pill">
              <Users size={14} />
              <span>{event.attendees}</span>
            </div>

            {isAuthenticated ? (
              <Link to={`/register?event=${event.id}`} className="register-now-cta">
                <Ticket size={18} />
                <span>Register for Pass</span>
              </Link>
            ) : (
              <Link to={`/signin?redirect=/register?event=${event.id}`} className="register-now-cta">
                <Ticket size={18} />
                <span>Sign in to Register</span>
              </Link>
            )}

            <p className="sidebar-note">
              Instant QR pass generated after registration. Validated at campus gates.
            </p>

            <div className="sidebar-share-row">
              <button className="share-btn" onClick={() => toggleSaveEvent(event.id)}>
                <Heart size={15} fill={isSaved ? '#EF4444' : 'transparent'} color={isSaved ? '#EF4444' : 'currentColor'} />
                <span>{isSaved ? 'Saved' : 'Save Event'}</span>
              </button>
              <button className="share-btn" onClick={handleShare}>
                <Share2 size={15} />
                <span>{copiedMsg ? 'Link Copied!' : 'Share Event'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default EventDetailPage;
