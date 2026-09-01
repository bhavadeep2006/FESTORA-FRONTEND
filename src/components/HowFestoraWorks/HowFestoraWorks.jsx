import React from 'react';
import { motion } from 'framer-motion';
import { Search, Compass, Ticket, Sparkles, CheckCircle2 } from 'lucide-react';
import './HowFestoraWorks.css';

export const HowFestoraWorks = () => {
  const steps = [
    {
      num: '01',
      title: 'Discover',
      desc: 'Find live festivals, hackathons, concerts, and workshops near you.',
      icon: Search,
      badge: 'Live Map & Feed'
    },
    {
      num: '02',
      title: 'Explore',
      desc: 'See full event schedules, prize pools, venue maps, and organizer details.',
      icon: Compass,
      badge: 'Transparent Details'
    },
    {
      num: '03',
      title: 'Register',
      desc: 'Get instant digital QR entry passes verified directly with your account.',
      icon: Ticket,
      badge: 'Instant QR Pass'
    },
    {
      num: '04',
      title: 'Experience',
      desc: 'Show your mobile pass at entry gates, participate, and enjoy unforgettable events.',
      icon: Sparkles,
      badge: 'Fast-Track Entry'
    }
  ];

  return (
    <section className="how-works-section">
      <div className="section-container">
        
        {/* Section Header */}
        <div className="how-works-header">
          <span className="section-eyebrow">ATTENDEE & ORGANIZER JOURNEY</span>
          <h2 className="how-works-title">How Festora Works</h2>
          <p className="how-works-subtitle">
            From discovering events around you to stepping through gate entry in 4 simple steps.
          </p>
        </div>

        {/* Connected Step Cards Timeline */}
        <div className="how-steps-timeline">
          <div className="steps-connect-line" />
          
          <div className="steps-grid">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.num}
                  className="step-card"
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: idx * 0.1 }}
                >
                  <div className="step-top">
                    <span className="step-num-badge">{s.num}</span>
                    <div className="step-icon-circle">
                      <Icon size={22} />
                    </div>
                  </div>

                  <div className="step-content">
                    <h3 className="step-title">{s.title}</h3>
                    <p className="step-desc">{s.desc}</p>
                  </div>

                  <div className="step-footer">
                    <span className="step-tag-pill">
                      <CheckCircle2 size={12} /> {s.badge}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default HowFestoraWorks;
