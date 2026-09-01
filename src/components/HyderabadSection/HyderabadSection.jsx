import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { hyderabadLocations } from '../../data/mockData';
import { MapPin, Navigation, ArrowRight, Sparkles } from 'lucide-react';
import './HyderabadSection.css';

export const HyderabadSection = () => {
  const [selectedLoc, setSelectedLoc] = useState(hyderabadLocations[0]);

  return (
    <section className="hyd-identity-section">
      <div className="section-container">
        
        {/* Header */}
        <div className="hyd-header">
          <div>
            <div className="hyd-eyebrow">
              <Navigation size={14} className="nav-icon" />
              <span>EXPLORE POPULAR HUBS & DESTINATIONS</span>
            </div>
            <h2 className="hyd-title">Find Events Across Top Locations</h2>
          </div>
          <p className="hyd-desc">
            Explore concerts, tech conventions, cultural festivals, and sports tournaments across top event destinations.
          </p>
        </div>

        {/* Location Hub Cards Grid */}
        <div className="hyd-locations-grid">
          {hyderabadLocations.map((loc, idx) => (
            <motion.div
              key={loc.id}
              className={`hyd-loc-card ${selectedLoc.id === loc.id ? 'active' : ''}`}
              onClick={() => setSelectedLoc(loc)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
            >
              <div className="hyd-card-banner">
                <img src={loc.image} alt={loc.name} className="hyd-card-img" />
                <div className="hyd-banner-gradient" />
                <span className="hyd-count-badge">{loc.count}</span>
              </div>
              <div className="hyd-card-content">
                <div className="hyd-loc-name">
                  <MapPin size={15} className="hyd-pin-icon" />
                  <span>{loc.name}</span>
                </div>
                <span className="hyd-loc-tag">{loc.tag}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selected Zone Highlight Bar */}
        <div className="hyd-active-bar">
          <div className="hyd-active-info">
            <Sparkles size={16} className="spark-active" />
            <span>Active Hub: <strong>{selectedLoc.name}</strong> — {selectedLoc.tag}</span>
          </div>
          <a href={`/events?location=${selectedLoc.id}`} className="hyd-explore-hub-btn">
            <span>Explore {selectedLoc.name} Events</span>
            <ArrowRight size={15} />
          </a>
        </div>

      </div>
    </section>
  );
};

export default HyderabadSection;
