import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeroEventCollage } from '../HeroEventCollage/HeroEventCollage';
import { ArrowRight } from 'lucide-react';
import './Hero.css';

const CountUpStat = ({ target, label }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const numericTarget = parseInt(target.replace(/[^0-9]/g, ''), 10);
    const duration = 1200;
    const increment = Math.ceil(numericTarget / (duration / 16));

    const timer = setInterval(() => {
      start += increment;
      if (start >= numericTarget) {
        setCount(numericTarget);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target]);

  const formattedCount = target.includes('k') || target.includes('+')
    ? `${count.toLocaleString()}+`
    : count;

  return (
    <div className="stat-box">
      <span className="stat-number">{formattedCount}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
};

export const Hero = () => {
  return (
    <section className="hero-container">
      {/* Background Subtle Gradient Mesh */}
      <div className="hero-bg-glow" />

      <div className="hero-content-grid">
        
        {/* Left Column: Editorial Headline & CTAs */}
        <motion.div
          className="hero-text-col"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Badge with slow subtle pulsing green dot */}
          <div className="hero-pill-badge">
            <span className="live-pulse-dot" />
            <span>LIVE IN HYDERABAD</span>
          </div>

          {/* Main Headline */}
          <h1 className="hero-main-title">
            Where Campus <br />
            <span className="title-highlight">Comes Alive</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-description">
            Discover cultural festivals, technical hackathons, esports tournaments, and workshops across IIIT, JNTU, CBIT, OU, and top Hyderabad universities. Book verified student passes in seconds.
          </p>

          {/* CTAs */}
          <div className="hero-cta-group">
            <Link to="/events" className="hero-primary-btn">
              <span>Explore Events</span>
              <ArrowRight size={18} />
            </Link>

            <Link to="/register" className="hero-secondary-btn">
              <span>Host an Event</span>
            </Link>
          </div>

          {/* Stat Badges with Count-Up */}
          <div className="hero-stats-row">
            <CountUpStat target="100+" label="Partner Colleges" />
            <div className="stat-divider" />
            <CountUpStat target="50000+" label="Student Attendees" />
            <div className="stat-divider" />
            <CountUpStat target="500+" label="Live Fests" />
          </div>
        </motion.div>

        {/* Right Column: Physical Event Poster Collage Composition */}
        <div className="hero-canvas-col">
          <HeroEventCollage />
        </div>

      </div>
    </section>
  );
};

