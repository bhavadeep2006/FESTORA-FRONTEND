import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { eventsData } from '../../data/mockData';
import { MapPin, Calendar, ArrowUpRight, Ticket } from 'lucide-react';
import './HeroEventCollage.css';

/**
 * HeroEventCollage Component
 * Physical college fest poster collage with human staggered entrance and subtle desktop-only 3D cursor tilt.
 */
export const HeroEventCollage = () => {
  const [hoveredId, setHoveredId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 992 || matchMedia('(pointer: coarse)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const featured = eventsData[0];  // IIIT Felicity 2026
  const posterTop = eventsData[1];  // JNTUH Hyd Hack 4.0
  const posterLeft = eventsData[2]; // CBIT Cyber Pulse Pro-Nite
  const posterRight = eventsData[3];// VNR Robo Wars

  // Mouse Parallax Motion Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Subtle 3D Depth (2-4 degrees response on Desktop, disabled on Mobile)
  const fgX = useTransform(smoothX, [-0.5, 0.5], isMobile ? [0, 0] : [10, -10]);
  const fgY = useTransform(smoothY, [-0.5, 0.5], isMobile ? [0, 0] : [8, -8]);
  const fgRotateX = useTransform(smoothY, [-0.5, 0.5], isMobile ? [0, 0] : [3, -3]);
  const fgRotateY = useTransform(smoothX, [-0.5, 0.5], isMobile ? [0, 0] : [-3, 3]);

  const topX = useTransform(smoothX, [-0.5, 0.5], isMobile ? [0, 0] : [-6, 6]);
  const topY = useTransform(smoothY, [-0.5, 0.5], isMobile ? [0, 0] : [-5, 5]);

  const leftX = useTransform(smoothX, [-0.5, 0.5], isMobile ? [0, 0] : [-12, 12]);
  const leftY = useTransform(smoothY, [-0.5, 0.5], isMobile ? [0, 0] : [8, -8]);

  const rightX = useTransform(smoothX, [-0.5, 0.5], isMobile ? [0, 0] : [8, -8]);
  const rightY = useTransform(smoothY, [-0.5, 0.5], isMobile ? [0, 0] : [-10, 10]);

  const handleMouseMove = (e) => {
    if (isMobile) return;
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
      className="hero-event-collage-stage"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="collage-container">

        {/* 1. TOP SUPPORTING POSTER (JNTUH Hackathon) - Stagger delay 0.2s */}
        <motion.div
          className={`collage-poster poster-top ${hoveredId === 'top' ? 'is-hovered' : ''}`}
          style={{ x: topX, y: topY }}
          onMouseEnter={() => setHoveredId('top')}
          onMouseLeave={() => setHoveredId(null)}
          initial={{ opacity: 0, y: 30, rotate: -4 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <Link to={`/events/${posterTop.id}`} className="poster-link">
            <div className="poster-top-bar">
              <span className="poster-category tech">{posterTop.category}</span>
              <span className="poster-college">{posterTop.college}</span>
            </div>
            <h4 className="poster-mini-title">{posterTop.title}</h4>
            <div className="poster-mini-meta">
              <span><Calendar size={11} /> {posterTop.date}</span>
              <span className="poster-tag">{posterTop.tag}</span>
            </div>
          </Link>
        </motion.div>

        {/* 2. MAIN FEATURED POSTER (IIIT Felicity) - Stagger delay 0.0s */}
        <motion.div
          className={`collage-poster poster-featured ${hoveredId === 'featured' ? 'is-hovered' : ''}`}
          style={{ x: fgX, y: fgY, rotateX: fgRotateX, rotateY: fgRotateY }}
          onMouseEnter={() => setHoveredId('featured')}
          onMouseLeave={() => setHoveredId(null)}
          initial={{ opacity: 0, scale: 0.94, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.0 }}
        >
          <Link to={`/events/${featured.id}`} className="poster-link">
            <div className="featured-flyer-header">
              <img src={featured.banner} alt={featured.title} className="flyer-banner-img" />
              <div className="flyer-gradient" />
              
              <div className="flyer-top-pills">
                <span className="flyer-pill-featured">{featured.tag}</span>
                <span className="flyer-arrow-circle"><ArrowUpRight size={16} /></span>
              </div>

              <div className="flyer-date-stamp">
                <Calendar size={12} /> {featured.date}
              </div>
            </div>

            <div className="featured-flyer-body">
              <span className="flyer-cat-label">{featured.category} &bull; {featured.college}</span>
              <h3 className="flyer-main-title">{featured.title}</h3>
              
              <div className="flyer-meta-row">
                <span className="flyer-meta-item"><MapPin size={13} /> {featured.location}</span>
                <span className="flyer-meta-item">{featured.time}</span>
              </div>

              <div className="flyer-footer-bar">
                <span className="flyer-price">{featured.price}</span>
                <span className="flyer-cta-btn">
                  <span>Get Pass</span>
                  <Ticket size={13} />
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* 3. LEFT SUPPORTING POSTER (CBIT Concert) - Stagger delay 0.35s */}
        <motion.div
          className={`collage-poster poster-left ${hoveredId === 'left' ? 'is-hovered' : ''}`}
          style={{ x: leftX, y: leftY }}
          onMouseEnter={() => setHoveredId('left')}
          onMouseLeave={() => setHoveredId(null)}
          initial={{ opacity: 0, x: -30, rotate: 6 }}
          animate={{ opacity: 1, x: 0, rotate: 3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
        >
          <Link to={`/events/${posterLeft.id}`} className="poster-link">
            <div className="left-flyer-image-wrap">
              <img src={posterLeft.banner} alt={posterLeft.title} className="left-flyer-img" />
              <span className="left-flyer-tag">CONCERT</span>
            </div>
            <div className="left-flyer-content">
              <span className="left-flyer-college">{posterLeft.college}</span>
              <h4 className="left-flyer-title">{posterLeft.title}</h4>
              <div className="left-flyer-footer">
                <span>{posterLeft.date}</span>
                <span className="left-price">{posterLeft.price}</span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* 4. RIGHT SUPPORTING POSTER (VNR Robo Wars) - Stagger delay 0.45s */}
        <motion.div
          className={`collage-poster poster-right ${hoveredId === 'right' ? 'is-hovered' : ''}`}
          style={{ x: rightX, y: rightY }}
          onMouseEnter={() => setHoveredId('right')}
          onMouseLeave={() => setHoveredId(null)}
          initial={{ opacity: 0, x: 30, rotate: -5 }}
          animate={{ opacity: 1, x: 0, rotate: -3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
        >
          <Link to={`/events/${posterRight.id}`} className="poster-link">
            <div className="right-poster-header">
              <span className="right-cat-pill">ROBOTICS</span>
              <span className="right-college">{posterRight.college}</span>
            </div>
            <h4 className="right-poster-title">{posterRight.title}</h4>
            <div className="right-poster-footer">
              <span>{posterRight.date}</span>
              <span className="right-arrow"><ArrowUpRight size={14} /></span>
            </div>
          </Link>
        </motion.div>

      </div>
    </div>
  );
};

export default HeroEventCollage;
