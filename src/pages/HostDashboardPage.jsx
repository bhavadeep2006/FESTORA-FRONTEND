import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  Eye, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  FileText, 
  BarChart3 
} from 'lucide-react';
import './HostDashboardPage.css';

export const HostDashboardPage = () => {
  const navigate = useNavigate();
  const { hostedEvents, user } = useAuth();
  const [filter, setFilter] = useState('All'); // 'All' | 'Published' | 'Draft'

  const filteredEvents = hostedEvents.filter(e => filter === 'All' || e.status === filter);

  const totalRegistrations = hostedEvents.reduce((acc, curr) => acc + (curr.registrationsCount || 0), 0);
  const publishedCount = hostedEvents.filter(e => e.status === 'Published').length;
  const draftCount = hostedEvents.filter(e => e.status === 'Draft').length;

  return (
    <div className="host-dashboard-page-view">
      <div className="section-container">
        
        {/* Header Title & Quick Create */}
        <div className="dashboard-header-row">
          <div>
            <span className="eyebrow-tag"><Sparkles size={14} /> ORGANIZER DASHBOARD</span>
            <h1 className="dashboard-title">Host Dashboard</h1>
            <p className="dashboard-subtitle">
              Manage your college fests, drafts, published events and total student registrations.
            </p>
          </div>

          <Link to="/host-event" className="create-event-btn">
            <Plus size={18} />
            <span>Create Event</span>
          </Link>
        </div>

        {/* Top Summary Stats Cards */}
        <div className="dashboard-stats-grid">
          <div className="dash-stat-card">
            <div className="stat-icon-wrapper purple">
              <FileText size={20} />
            </div>
            <div>
              <span className="dash-stat-num">{hostedEvents.length}</span>
              <span className="dash-stat-label">Total Events</span>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="stat-icon-wrapper green">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <span className="dash-stat-num">{publishedCount}</span>
              <span className="dash-stat-label">Published Fests</span>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="stat-icon-wrapper amber">
              <Clock size={20} />
            </div>
            <div>
              <span className="dash-stat-num">{draftCount}</span>
              <span className="dash-stat-label">Saved Drafts</span>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="stat-icon-wrapper blue">
              <Users size={20} />
            </div>
            <div>
              <span className="dash-stat-num">{totalRegistrations}</span>
              <span className="dash-stat-label">Total Registrations</span>
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="dash-tab-bar">
          <div className="tab-buttons">
            <button 
              className={`dash-filter-btn ${filter === 'All' ? 'active' : ''}`}
              onClick={() => setFilter('All')}
            >
              My Events ({hostedEvents.length})
            </button>
            <button 
              className={`dash-filter-btn ${filter === 'Published' ? 'active' : ''}`}
              onClick={() => setFilter('Published')}
            >
              Published ({publishedCount})
            </button>
            <button 
              className={`dash-filter-btn ${filter === 'Draft' ? 'active' : ''}`}
              onClick={() => setFilter('Draft')}
            >
              Drafts ({draftCount})
            </button>
          </div>
        </div>

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <div className="dash-empty-state">
            <h3>No events found in this view</h3>
            <p>Ready to showcase your next college fest or hackathon?</p>
            <Link to="/host-event" className="create-event-btn" style={{ marginTop: '16px', display: 'inline-flex' }}>
              <Plus size={18} />
              <span>Create Event Now</span>
            </Link>
          </div>
        ) : (
          <div className="dash-events-list">
            {filteredEvents.map((evt) => (
              <motion.div 
                key={evt.id} 
                className="dash-event-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="dash-event-banner-box">
                  <img src={evt.banner} alt={evt.title} className="dash-event-banner" />
                  <span className={`status-pill-badge ${evt.status.toLowerCase()}`}>
                    {evt.status}
                  </span>
                </div>

                <div className="dash-event-info">
                  <span className="dash-cat-label">{evt.category}</span>
                  <h3 className="dash-event-name">{evt.title}</h3>
                  <div className="dash-meta-row">
                    <span><Calendar size={14} /> {evt.date}</span>
                    <span><MapPin size={14} /> {evt.location}</span>
                  </div>
                </div>

                <div className="dash-event-stats">
                  <span className="reg-count-val">{evt.registrationsCount}</span>
                  <span className="reg-count-label">Registrations</span>
                </div>

                <div className="dash-event-actions">
                  <button className="dash-action-btn" onClick={() => navigate('/host-event')}>
                    <Edit3 size={15} />
                    <span>Edit</span>
                  </button>
                  <button className="dash-action-btn primary" onClick={() => navigate('/events')}>
                    <Eye size={15} />
                    <span>View Event</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default HostDashboardPage;
