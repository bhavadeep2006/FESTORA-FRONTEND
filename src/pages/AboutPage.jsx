import React from 'react';
import { Sparkles, ShieldCheck, Heart, Users, Target, Rocket } from 'lucide-react';
import './AboutPage.css';

export const AboutPage = () => {
  return (
    <div className="about-page-view">
      <div className="about-hero-section">
        <div className="section-container">
          <span className="eyebrow-tag">About Festora</span>
          <h1 className="about-title">Re-imagining How Campus Events Are Experienced</h1>
          <p className="about-lead">
            Festora was born out of a simple frustration: college festivals are full of raw human talent, energy, and creativity—yet finding events and getting entry passes was fragmented, chaotic, and outdated.
          </p>
        </div>
      </div>

      <div className="section-container about-body-container">
        
        <div className="about-values-grid">
          <div className="about-card">
            <div className="about-card-icon"><Target size={24} /></div>
            <h3>Our Mission</h3>
            <p>To connect every college student in India with extraordinary cultural, technical, and athletic experiences across campus boundaries.</p>
          </div>

          <div className="about-card">
            <div className="about-card-icon"><Users size={24} /></div>
            <h3>Human-Centered Design</h3>
            <p>Built with input from 50+ college cultural councils. We prioritize clarity, fast gate entry, and beautiful editorial aesthetics over generic SaaS templates.</p>
          </div>

          <div className="about-card">
            <div className="about-card-icon"><Rocket size={24} /></div>
            <h3>Scale & Integrity</h3>
            <p>Empowering student councils to host events for 20,000+ attendees with real-time pass validation, instant payouts, and verified student security.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
