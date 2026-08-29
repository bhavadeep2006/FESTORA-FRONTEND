import React from 'react';
import { motion } from 'framer-motion';
import { humanStories } from '../../data/mockData';
import { Compass, Users, Sparkles, ShieldCheck, Quote } from 'lucide-react';
import './WhyFestora.css';

export const WhyFestora = () => {
  const pillars = [
    {
      num: '01',
      title: 'Unified Discovery',
      desc: 'No more searching through scattered WhatsApp groups or Instagram flyers. Every college festival, hackathon, and talk lives under one unified roof.',
      icon: Compass,
    },
    {
      num: '02',
      title: 'Verified Student Passes',
      desc: 'Instant QR entry passes tied directly to your university student ID. Zero friction at entry gates.',
      icon: ShieldCheck,
    },
    {
      num: '03',
      title: 'Organizer Control Room',
      desc: 'Empower student cultural committees with real-time analytics, participant rosters, and instant gate validation.',
      icon: Sparkles,
    },
    {
      num: '04',
      title: 'Cross-Campus Network',
      desc: 'Connect with students from over 100+ colleges nationwide. Collaborate on hackathons, form music bands, or travel to regional meets.',
      icon: Users,
    },
  ];

  return (
    <section className="why-festora-section">
      <div className="section-container">
        
        {/* Section Header */}
        <div className="why-header">
          <span className="section-eyebrow">Our Mission & Platform Story</span>
          <h2 className="why-title">Built for Students, Crafted for Campus Energy</h2>
          <p className="why-subtitle">
            Festora replaces outdated paper entries and scattered messaging with a modern, transparent, and vibrant event ecosystem.
          </p>
        </div>

        {/* Pillars Asymmetric Grid */}
        <div className="pillars-grid">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.num}
                className="pillar-card"
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="pillar-top-row">
                  <span className="pillar-num">{p.num}</span>
                  <div className="pillar-icon-wrap">
                    <Icon size={20} />
                  </div>
                </div>
                <h3 className="pillar-title">{p.title}</h3>
                <p className="pillar-desc">{p.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Human Student Testimonials Box */}
        <div className="testimonials-box">
          <div className="testimonials-header">
            <Quote size={32} className="quote-icon" />
            <h3 className="testimonials-title">What Campus Organizers Say</h3>
          </div>

          <div className="testimonials-grid">
            {humanStories.map((story, i) => (
              <div key={i} className="story-card">
                <p className="story-quote">"{story.quote}"</p>
                <div className="story-author-row">
                  <img src={story.avatar} alt={story.name} className="author-avatar" />
                  <div>
                    <h4 className="author-name">{story.name}</h4>
                    <span className="author-role">{story.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
