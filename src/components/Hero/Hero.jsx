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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className="hero-container">
      {/* Background Subtle Gradient Mesh */}
      <div className="hero-bg-glow" />

      <div className="hero-content-grid">
        
        {/* Left Column / Mobile Top: Staggered Hero Text & CTAs */}
        <motion.div
          className="hero-text-col"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 1. Badge with slow subtle pulsing green dot */}
          <motion.div className="hero-pill-badge" variants={itemVariants}>
            <span className="live-pulse-dot" />
            <span>LIVE IN HYDERABAD</span>
          </motion.div>

          {/* 2. Main Headline */}
          <motion.h1 className="hero-main-title" variants={itemVariants}>
            Where Campus <br className="desktop-break" />
            <span className="title-highlight">Comes Alive</span>
          </motion.h1>

          {/* 3. Subtitle */}
          <motion.p className="hero-description" variants={itemVariants}>
            Discover cultural festivals, technical hackathons, esports tournaments, and workshops across IIIT, JNTU, CBIT, OU, and top Hyderabad universities. Book verified student passes in seconds.
          </motion.p>

          {/* 4. CTAs */}
          <motion.div className="hero-cta-group" variants={itemVariants}>
            <Link to="/events" className="hero-primary-btn">
              <span>Explore Events</span>
              <ArrowRight size={18} />
            </Link>

            <Link to="/register" className="hero-secondary-btn">
              <span>Host an Event</span>
            </Link>
          </motion.div>

          {/* 5. Stat Badges with Count-Up */}
          <motion.div className="hero-stats-row" variants={itemVariants}>
            <CountUpStat target="100+" label="Partner Colleges" />
            <div className="stat-divider" />
            <CountUpStat target="50000+" label="Student Attendees" />
            <div className="stat-divider" />
            <CountUpStat target="500+" label="Live Fests" />
          </motion.div>
        </motion.div>

        {/* Right Column / Mobile Bottom: Physical Event Poster Collage / Carousel */}
        <motion.div 
          className="hero-canvas-col"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        >
          <HeroEventCollage />
        </motion.div>

      </div>
    </section>
  );
};

