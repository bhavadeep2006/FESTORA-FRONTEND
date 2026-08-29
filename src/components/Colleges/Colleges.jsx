import React from 'react';
import { collegesData } from '../../data/mockData';
import { Building2, GraduationCap } from 'lucide-react';
import './Colleges.css';

export const Colleges = () => {
  return (
    <section className="colleges-section">
      <div className="section-container">
        
        <div className="colleges-title-box">
          <span className="colleges-eyebrow">
            <GraduationCap size={14} className="grad-icon" /> CAMPUS NETWORK
          </span>
          <h2 className="colleges-heading">Top Hyderabad Universities Hosting Events</h2>
        </div>

        {/* Clean Logo / Campus Strip */}
        <div className="colleges-marquee-track">
          <div className="colleges-marquee-content">
            {collegesData.concat(collegesData).map((col, idx) => (
              <div key={`${col.id}-${idx}`} className="college-logo-card">
                <div className="college-icon-circle">
                  <Building2 size={18} className="college-icon" />
                </div>
                <div className="college-card-text">
                  <h4 className="college-name">{col.name}</h4>
                  <span className="college-city">{col.city} &bull; {col.badge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

