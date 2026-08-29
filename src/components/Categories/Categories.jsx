import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categoriesData } from '../../data/mockData';
import { Music, Cpu, Trophy, BookOpen, HelpCircle, Gamepad2, ArrowRight, Sparkles } from 'lucide-react';
import './Categories.css';

const iconMap = {
  Music: Music,
  Cpu: Cpu,
  Trophy: Trophy,
  BookOpen: BookOpen,
  HelpCircle: HelpCircle,
  Gamepad2: Gamepad2,
};

export const Categories = () => {
  return (
    <section className="categories-section">
      <div className="section-container">
        
        {/* Header */}
        <div className="categories-header">
          <div>
            <span className="section-eyebrow">
              <Sparkles size={13} className="eyebrow-icon" /> DISCOVER BY INTEREST
            </span>
            <h2 className="categories-title">Explore Event Categories</h2>
          </div>
          <Link to="/events" className="categories-link">
            <span>Browse All Categories</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="categories-grid">
          {categoriesData.map((cat, idx) => {
            const IconComponent = iconMap[cat.icon] || Music;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Link to={`/events?category=${cat.id}`} className="category-card">
                  <div className="category-top-row">
                    <div className="category-icon-box">
                      <IconComponent size={20} className="cat-icon-svg" />
                    </div>
                    <span className="category-count-badge">{cat.count}</span>
                  </div>

                  <div className="category-body">
                    <h3 className="category-name">{cat.title}</h3>
                    <p className="category-desc">{cat.desc}</p>
                  </div>

                  <div className="category-arrow-row">
                    <span className="explore-text">Explore</span>
                    <ArrowRight size={14} className="cat-arrow" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};


