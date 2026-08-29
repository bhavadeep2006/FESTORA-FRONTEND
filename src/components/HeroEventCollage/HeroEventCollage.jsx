import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { eventsData } from '../../data/mockData';
import { MapPin, Calendar, ArrowUpRight, Ticket } from 'lucide-react';
import './HeroEventCollage.css';

/**
 * HeroEventCollage Component
 * Desktop: Physical college fest poster collage with subtle 3D cursor tilt.
 * Mobile (<= 992px): Horizontal swipeable animated carousel deck with peek hint and 4.5s autoplay.
 */
export const HeroEventCollage = () => {
  const [hoveredId, setHoveredId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);

  const mobileList = eventsData.slice(0, 4);
  const carouselTrackRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 992 || matchMedia('(pointer: coarse)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Autoplay Timer for Mobile Vertical Deck Shuffle (3.5s)
  useEffect(() => {
    if (!isMobile) return;

    const timer = setInterval(() => {
      setActiveMobileIndex((prev) => (prev + 1) % 3);
    }, 3500);

    return () => clearInterval(timer);
  }, [isMobile]);

  // Scroll track to active card index on autoplay change
  useEffect(() => {
    if (!isMobile || !carouselTrackRef.current) return;
    const container = carouselTrackRef.current;
    const cards = container.querySelectorAll('.mobile-carousel-card');
    if (cards[activeMobileIndex]) {
      cards[activeMobileIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
    }
  }, [activeMobileIndex, isMobile]);

  const featured = eventsData[0];  // IIIT Felicity 2026
  const posterTop = eventsData[1];  // JNTUH Hyd Hack 4.0
  const posterLeft = eventsData[2]; // CBIT Cyber Pulse Pro-Nite
  const posterRight = eventsData[3];// VNR Robo Wars

  // Mouse Parallax Motion Values (Desktop)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const fgX = useTransform(smoothX, [-0.5, 0.5], [10, -10]);
  const fgY = useTransform(smoothY, [-0.5, 0.5], [8, -8]);
  const fgRotateX = useTransform(smoothY, [-0.5, 0.5], [3, -3]);
  const fgRotateY = useTransform(smoothX, [-0.5, 0.5], [-3, 3]);

  const topX = useTransform(smoothX, [-0.5, 0.5], [-6, 6]);
  const topY = useTransform(smoothY, [-0.5, 0.5], [-5, 5]);

  const leftX = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);
  const leftY = useTransform(smoothY, [-0.5, 0.5], [8, -8]);

  const rightX = useTransform(smoothX, [-0.5, 0.5], [8, -8]);
  const rightY = useTransform(smoothY, [-0.5, 0.5], [-10, 10]);

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

  // Render Mobile Vertical Animated Event Showcase Deck (<= 992px)
  if (isMobile) {
    const totalCards = 3;
    const mobileCards = eventsData.slice(0, 3); // 3 Cards for stacked shuffle

    return (
      <div className="mobile-vertical-deck-container">
        <div 
          className="mobile-vertical-deck-stage"
          onTouchStart={() => setIsInteracting(true)}
          onTouchEnd={() => setTimeout(() => setIsInteracting(false), 2000)}
        >
          {mobileCards.map((evt, idx) => {
            // Calculate relative stack offset from active Mobile Index
            const positionOffset = (idx - activeMobileIndex + totalCards) % totalCards;
            
            // Stack depth values for vertical layered shuffle
            const isFront = positionOffset === 0;
            const isMiddle = positionOffset === 1;
            const isBack = positionOffset === 2;

            const yPos = isFront ? 0 : isMiddle ? 16 : 32;
            const scale = isFront ? 1 : isMiddle ? 0.95 : 0.9;
            const opacity = isFront ? 1 : isMiddle ? 0.85 : 0.65;
            const zIndex = isFront ? 30 : isMiddle ? 20 : 10;
            const rotate = isFront ? 0 : isMiddle ? -1 : 1;

            return (
              <motion.div
                key={evt.id}
                className={`mobile-deck-card ${isFront ? 'is-front' : ''}`}
                animate={{
                  y: yPos,
                  scale: scale,
                  opacity: opacity,
                  rotate: rotate,
                  zIndex: zIndex,
                }}
                transition={{
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileTap={{ scale: isFront ? 0.98 : scale }}
                onClick={() => setActiveMobileIndex(idx)}
              >
                <Link to={`/events/${evt.id}`} className="poster-link">
                  <div className="mobile-card-banner">
                    <img src={evt.banner} alt={evt.title} className="flyer-banner-img" />
                    <div className="flyer-gradient" />
                    <div className="flyer-top-pills">
                      <span className="flyer-pill-featured">{evt.tag}</span>
                      <span className="flyer-arrow-circle">
                        <ArrowUpRight size={15} />
                      </span>
                    </div>
                    <div className="flyer-date-stamp">
                      <Calendar size={11} /> {evt.date}
                    </div>
                  </div>

                  <div className="mobile-card-body">
                    <span className="flyer-cat-label">
                      {evt.category} &bull; {evt.college}
                    </span>
                    <h3 className="flyer-main-title">{evt.title}</h3>
                    <div className="flyer-meta-row">
                      <span className="flyer-meta-item">
                        <MapPin size={12} /> {evt.location}
                      </span>
                      <span className="flyer-meta-item">{evt.time}</span>
                    </div>
                    <div className="flyer-footer-bar">
                      <span className="flyer-price">{evt.price}</span>
                      <span className="flyer-cta-btn">
                        <span>Get Pass</span>
                        <Ticket size={13} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Stack Indicator Bar */}
        <div className="mobile-carousel-dots">
          {mobileCards.map((_, dotIdx) => (
            <button
              key={dotIdx}
              className={`carousel-dot ${dotIdx === activeMobileIndex ? 'active' : ''}`}
              onClick={() => setActiveMobileIndex(dotIdx)}
              aria-label={`Show fest poster ${dotIdx + 1}`}
            />
          ))}
        </div>
      </div>
    );
  }

  // Render Desktop Interactive 3D Composition Wall (Completely Unchanged)
  return (
    <div
      className="hero-event-collage-stage"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="collage-container">

        {/* 1. TOP SUPPORTING POSTER */}
        <motion.div
          className={`collage-poster poster-top ${hoveredId === 'top' ? 'is-hovered' : ''}`}
          style={{ x: topX, y: topY }}
          onMouseEnter={() => setHoveredId('top')}
          onMouseLeave={() => setHoveredId(null)}
          initial={{ opacity: 0, y: 35, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
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

        {/* 2. MAIN FEATURED POSTER */}
        <motion.div
          className={`collage-poster poster-featured ${hoveredId === 'featured' ? 'is-hovered' : ''}`}
          style={{ x: fgX, y: fgY, rotateX: fgRotateX, rotateY: fgRotateY }}
          onMouseEnter={() => setHoveredId('featured')}
          onMouseLeave={() => setHoveredId(null)}
          initial={{ opacity: 0, scale: 0.96, y: 35 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
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

        {/* 3. LEFT SUPPORTING POSTER */}
        <motion.div
          className={`collage-poster poster-left ${hoveredId === 'left' ? 'is-hovered' : ''}`}
          style={{ x: leftX, y: leftY }}
          onMouseEnter={() => setHoveredId('left')}
          onMouseLeave={() => setHoveredId(null)}
          initial={{ opacity: 0, y: 35, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
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

        {/* 4. RIGHT SUPPORTING POSTER */}
        <motion.div
          className={`collage-poster poster-right ${hoveredId === 'right' ? 'is-hovered' : ''}`}
          style={{ x: rightX, y: rightY }}
          onMouseEnter={() => setHoveredId('right')}
          onMouseLeave={() => setHoveredId(null)}
          initial={{ opacity: 0, y: 35, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
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
