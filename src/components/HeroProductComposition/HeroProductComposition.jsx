import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { eventsData } from '../../data/mockData';
import { MapPin, Calendar, Users, Ticket, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';
import './HeroProductComposition.css';

/**
 * HeroProductComposition Component
 * Physical layered event posters scene responding to mouse interaction.
 * Composition structure:
 *    [ TOP SMALL CARD: JNTUH HACKATHON ]
 *                 ↓
 *     [ CENTER FEATURED CARD: IIIT FELICITY 2026 ]
 *        ↙                        ↘
 * [ BOTTOM-LEFT CARD ]      [ BOTTOM-RIGHT BADGE & CARD ]
 */
export const HeroProductComposition = () => {
  const [hoveredId, setHoveredId] = useState(null);

  const featured = eventsData[0]; // Felicity 2026 IIIT
  const topCard = eventsData[1];  // HYD-HACK JNTU
  const leftCard = eventsData[2]; // Cyber Pulse CBIT
  const rightCard = eventsData[3]; // Robo Wars VNR

  // Mouse Parallax Motion Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth Spring Physics for organic response
  const springConfig = { damping: 25, stiffness: 120 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Layered Parallax Transforms (Foreground > Middle > Background)
  const fgX = useTransform(smoothX, [-0.5, 0.5], [14, -14]);
  const fgY = useTransform(smoothY, [-0.5, 0.5], [12, -12]);

  const topX = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  const topY = useTransform(smoothY, [-0.5, 0.5], [-6, 6]);

  const leftX = useTransform(smoothX, [-0.5, 0.5], [-16, 16]);
  const leftY = useTransform(smoothY, [-0.5, 0.5], [10, -10]);

  const rightX = useTransform(smoothX, [-0.5, 0.5], [10, -10]);
  const rightY = useTransform(smoothY, [-0.5, 0.5], [-14, 14]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setHoveredId(null);
  };

  return (
    <div
      className="hero-events-composition-wrapper"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="composition-stage">

        {/* 1. TOP SMALL CARD: JNTUH HACKATHON (Background depth, subtle horizontal drift) */}
        <motion.div
          className={`comp-event-card top-small-card ${hoveredId === 'top' ? 'is-hovered' : ''}`}
          style={{ x: topX, y: topY }}
          onMouseEnter={() => setHoveredId('top')}
          onMouseLeave={() => setHoveredId(null)}
          animate={{
            x: [-6, 6, -6],
            rotate: [1, -1, 1]
          }}
          transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Link to={`/events/${topCard.id}`} className="poster-link-wrapper">
            <div className="top-card-header">
              <span className="live-status-dot" />
              <span className="top-card-college">{topCard.college}</span>
              <span className="top-card-tag">{topCard.tag}</span>
            </div>
            <div className="top-card-body">
              <h4 className="top-card-title">{topCard.title}</h4>
              <div className="top-card-meta">
                <span><Calendar size={11} /> {topCard.date}</span>
                <span className="meta-dot">&bull;</span>
                <span>{topCard.location}</span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* 2. CENTER MAIN FEATURED CARD: IIIT FELICITY 2026 (Foreground hero depth) */}
        <motion.div
          className={`comp-event-card center-featured-card ${hoveredId === 'center' ? 'is-hovered' : ''}`}
          style={{ x: fgX, y: fgY }}
          onMouseEnter={() => setHoveredId('center')}
          onMouseLeave={() => setHoveredId(null)}
          animate={{
            y: [-6, 6, -6],
            scale: [1, 1.015, 1],
          }}
          transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Link to={`/events/${featured.id}`} className="poster-link-wrapper">
            {/* Banner Image with subtle zoom */}
            <div className="featured-banner-wrapper">
              <img src={featured.banner} alt={featured.title} className="featured-img" />
              <div className="featured-img-overlay" />
              
              <div className="featured-top-bar">
                <span className="featured-pill-tag">
                  <Sparkles size={12} /> {featured.tag}
                </span>
                <span className="featured-explore-arrow">
                  <ArrowUpRight size={16} />
                </span>
              </div>

              <div className="featured-attendee-badge">
                <Users size={12} /> {featured.attendees}
              </div>
            </div>

            {/* Content Body */}
            <div className="featured-content-body">
              <div className="featured-category">{featured.category}</div>
              <h3 className="featured-title">{featured.title}</h3>
              
              <div className="featured-details-grid">
                <div className="detail-item">
                  <MapPin size={13} className="detail-icon" />
                  <span>{featured.college} &bull; {featured.location}</span>
                </div>
                <div className="detail-item">
                  <Calendar size={13} className="detail-icon" />
                  <span>{featured.date}</span>
                </div>
              </div>

              <div className="featured-card-footer">
                <span className="featured-price">{featured.price}</span>
                <span className="featured-get-btn">
                  <span>Get Pass</span>
                  <Ticket size={14} />
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* 3. BOTTOM-LEFT CARD: CBIT CYBER PULSE (Slow horizontal movement & slight rotation) */}
        <motion.div
          className={`comp-event-card bottom-left-card ${hoveredId === 'left' ? 'is-hovered' : ''}`}
          style={{ x: leftX, y: leftY }}
          onMouseEnter={() => setHoveredId('left')}
          onMouseLeave={() => setHoveredId(null)}
          animate={{
            x: [-8, 8, -8],
            rotate: [-2, 1, -2]
          }}
          transition={{ duration: 8.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        >
          <Link to={`/events/${leftCard.id}`} className="poster-link-wrapper">
            <div className="left-card-img-box">
              <img src={leftCard.banner} alt={leftCard.title} className="left-card-img" />
              <span className="left-card-badge">{leftCard.category}</span>
            </div>
            <div className="left-card-info">
              <span className="left-card-college">{leftCard.college}</span>
              <h4 className="left-card-title">{leftCard.title}</h4>
              <div className="left-card-footer">
                <span><Calendar size={11} /> {leftCard.date}</span>
                <span className="left-card-price">{leftCard.price}</span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* 4. BOTTOM-RIGHT CARD: VNR ROBO WARS (Subtle vertical bounce & distinct timing) */}
        <motion.div
          className={`comp-event-card bottom-right-card ${hoveredId === 'right' ? 'is-hovered' : ''}`}
          style={{ x: rightX, y: rightY }}
          onMouseEnter={() => setHoveredId('right')}
          onMouseLeave={() => setHoveredId(null)}
          animate={{
            y: [-7, 7, -7],
            rotate: [1, -1.5, 1]
          }}
          transition={{ duration: 6.4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        >
          <Link to={`/events/${rightCard.id}`} className="poster-link-wrapper">
            <div className="right-card-badge-row">
              <span className="status-live-pulse" />
              <span className="right-card-tag">{rightCard.tag}</span>
            </div>
            <h4 className="right-card-title">{rightCard.title}</h4>
            <span className="right-card-college">{rightCard.college}</span>
            <div className="right-card-meta">
              <span><Calendar size={11} /> {rightCard.date}</span>
              <span className="right-card-arrow"><ArrowUpRight size={14} /></span>
            </div>
          </Link>
        </motion.div>

        {/* 5. FESTORA QR PASS VERIFICATION FLOATING FLOATING BADGE */}
        <motion.div
          className="comp-event-card student-verification-badge"
          animate={{
            y: [-4, 4, -4],
            scale: [0.98, 1.02, 0.98]
          }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="badge-inner-content">
            <div className="badge-shield-circle">
              <ShieldCheck size={18} />
            </div>
            <div className="badge-text-group">
              <span className="badge-title">FESTORA GATEWAY</span>
              <span className="badge-status">Hyderabad Student Verification Active</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

