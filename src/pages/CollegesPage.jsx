import React from 'react';
import { collegesData } from '../data/mockData';
import { Building2, MapPin, Trophy, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './CollegesPage.css';

export const CollegesPage = () => {
  return (
    <div className="colleges-page-view">
      <div className="colleges-page-hero">
        <div className="section-container">
          <span className="eyebrow-tag">University Network</span>
          <h1 className="colleges-page-title">Partner Colleges & Universities</h1>
          <p className="colleges-page-desc">
            Explore 100+ top universities hosting regional cultural fests, technical hackathons, and sports tournaments on Festora.
          </p>
        </div>
      </div>

      <div className="section-container colleges-page-grid">
        {collegesData.map((col) => (
          <div key={col.id} className="college-card-full">
            <div className="college-card-header">
              <div className="college-card-icon">
                <Building2 size={24} />
              </div>
              <span className="college-card-badge">{col.badge}</span>
            </div>

            <h3 className="college-card-title">{col.name}</h3>
            <p className="college-card-city"><MapPin size={14} /> {col.city}</p>

            <div className="college-card-stats">
              <div className="c-stat">
                <Trophy size={14} className="c-stat-icon" />
                <span>{col.eventsCount} Active Fests</span>
              </div>
              <div className="c-stat">
                <Users size={14} className="c-stat-icon" />
                <span>Verified Campus</span>
              </div>
            </div>

            <Link to={`/events?search=${encodeURIComponent(col.name)}`} className="explore-college-btn">
              <span>View College Events</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollegesPage;
