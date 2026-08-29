import React from 'react';
import { motion } from 'framer-motion';
import './FestoraLogo.css';

/**
 * Festora SVG Logo Component
 * Redesigned vector based on the iconic Festora interlocking geometric 'F' + ticket-notch mark.
 * Choreographed with smooth bezier entrances, gentle aura pulse, and light sheen reflections.
 */
export const FestoraLogo = ({ size = 120, isAnimated = true, animateStage = 4 }) => {
  return (
    <div className="festora-logo-wrapper" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="festora-logo-svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="lavenderPrimaryGrad" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>

          <linearGradient id="lavenderAccentGrad" x1="50" y1="50" x2="170" y2="170" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#DDD6FE" />
            <stop offset="60%" stopColor="#C4B5FD" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>

          <linearGradient id="glowGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.15" />
          </linearGradient>

          {/* Soft Drop Shadow */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#8B5CF6" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Ambient Pulse Glow Disk Behind Logo */}
        <motion.circle
          cx="100"
          cy="100"
          r="78"
          fill="url(#glowGrad)"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{
            scale: animateStage >= 2 ? [0.92, 1.06, 0.96] : 0.7,
            opacity: animateStage >= 2 ? [0.25, 0.45, 0.3] : 0,
          }}
          transition={{ duration: 2.8, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
        />

        {/* --- LOGO GEOMETRY: Part 1 - Fluid Sweeping 'F' Arm --- */}
        <motion.path
          d="M 52 138 C 52 105, 74 88, 102 80 L 102 46 C 102 36, 110 28, 120 28 L 158 28 L 158 48 L 122 48 C 117 48, 114 51, 114 56 L 114 80 L 136 80 L 124 98 L 114 98 L 114 116 L 100 116 L 100 92 C 80 100, 68 112, 68 138 Z"
          fill="url(#lavenderPrimaryGrad)"
          filter="url(#softShadow)"
          initial={isAnimated ? { pathLength: 0, opacity: 0, scale: 0.94 } : false}
          animate={
            isAnimated
              ? {
                  pathLength: 1,
                  opacity: 1,
                  scale: 1,
                }
              : {}
          }
          transition={{
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.1,
          }}
        />

        {/* --- LOGO GEOMETRY: Part 2 - Interlocking Lower Ticket Box with Notch --- */}
        <motion.path
          d="M 102 96 L 152 96 C 158 96, 162 100, 162 106 L 162 120 C 154 120, 148 126, 148 134 C 148 142, 154 148, 162 148 L 162 162 C 162 168, 158 172, 152 172 L 102 172 C 96 172, 92 168, 92 162 L 92 106 C 92 100, 96 96, 102 96 Z M 110 114 L 110 154 L 144 154 L 144 145 C 136 142, 132 135, 132 134 C 132 133, 136 126, 144 123 L 144 114 Z"
          fill="url(#lavenderAccentGrad)"
          filter="url(#softShadow)"
          initial={isAnimated ? { pathLength: 0, opacity: 0, y: 12 } : false}
          animate={
            isAnimated
              ? {
                  pathLength: 1,
                  opacity: 1,
                  y: 0,
                }
              : {}
          }
          transition={{
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.25,
          }}
        />

        {/* Subtle Brand Accent Points */}
        <motion.circle
          cx="152"
          cy="38"
          r="4"
          fill="#DDD6FE"
          animate={{
            scale: [1, 1.35, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx="162"
          cy="134"
          r="3"
          fill="#8B5CF6"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.5, 0.95, 0.5],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
      </svg>
    </div>
  );
};
