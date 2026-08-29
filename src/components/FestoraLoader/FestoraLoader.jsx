import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FestoraLogo } from '../FestoraLogo/FestoraLogo';
import { CheckCircle2 } from 'lucide-react';
import './FestoraLoader.css';

/**
 * Festora Production Loading & Intro Component
 * Choreographed 5-Stage Sequence:
 *  1. Background ambient light mesh (0-600ms)
 *  2. Logo entrance + micro-glow pulse (300-1100ms)
 *  3. FESTORA wordmark tracking animation (600-1300ms)
 *  4. Tagline reveal (900-1500ms)
 *  5. Fluid loading indicator (1100-3400ms)
 *  6. Automatic navigation trigger on 100% completion
 */
export const FestoraLoader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(1);
  const [statusTextIndex, setStatusTextIndex] = useState(0);

  const hasCompletedRef = useRef(false);

  const statusMessages = [
    "Initializing Campus Network...",
    "Curating Live College Fests...",
    "Synchronizing Student Experiences...",
    "Welcome to Festora"
  ];

  // Stage sequence timing
  useEffect(() => {
    // Stage 1 -> Stage 2 (Logo reveal)
    const timer1 = setTimeout(() => setStage(2), 250);
    // Stage 2 -> Stage 3 (Wordmark reveal)
    const timer2 = setTimeout(() => setStage(3), 600);
    // Stage 3 -> Stage 4 (Progress bar active)
    const timer3 = setTimeout(() => setStage(4), 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Fluid progress calculation targeting ~2.4 seconds of progress fill
  useEffect(() => {
    if (stage < 4) return;

    const startTime = Date.now();
    const duration = 2400; // ms to reach 100%

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.floor((elapsed / duration) * 100), 100);

      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [stage]);

  // Handle automatic completion callback once 100% is reached
  useEffect(() => {
    if (progress < 30) {
      setStatusTextIndex(0);
    } else if (progress < 70) {
      setStatusTextIndex(1);
    } else if (progress < 98) {
      setStatusTextIndex(2);
    } else {
      setStatusTextIndex(3);
    }

    if (progress >= 100 && !hasCompletedRef.current) {
      hasCompletedRef.current = true;

      // Brief 400ms pause so user visually registers 100% completion tick, then trigger navigation
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 400);
    }
  }, [progress, onComplete]);

  return (
    <motion.div
      className="festora-loader-container"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.04,
        filter: "blur(8px)",
      }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading Festora Event Platform"
    >
      {/* --- STAGE 1: Subtle Ambient Background Lighting & Mesh --- */}
      <div className="ambient-background-layer">
        <div className="ambient-orb orb-primary" />
        <div className="ambient-orb orb-secondary" />
        <div className="ambient-orb orb-tertiary" />
        <div className="ambient-grid-overlay" />
      </div>

      {/* --- MAIN CENTRAL CHOREOGRAPHED CONTENT --- */}
      <div className="loader-center-content">
        
        {/* --- STAGE 2: Festora SVG Brandmark Entrance --- */}
        <motion.div
          className="logo-container"
          initial={{ scale: 0.9, opacity: 0, y: 18 }}
          animate={stage >= 2 ? { scale: 1, opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
        >
          <FestoraLogo size={135} isAnimated={true} animateStage={stage} />
        </motion.div>

        {/* --- STAGE 3 & 4: Wordmark & Tagline --- */}
        <div className="brand-text-container">
          <motion.h1
            className="brand-wordmark"
            initial={{ opacity: 0, y: 14, letterSpacing: "0.45em" }}
            animate={
              stage >= 3
                ? { opacity: 1, y: 0, letterSpacing: "0.28em" }
                : {}
            }
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          >
            FESTORA
          </motion.h1>

          <motion.p
            className="brand-tagline"
            initial={{ opacity: 0, y: 8 }}
            animate={stage >= 3 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.85, ease: "easeOut", delay: 0.2 }}
          >
            Where Campus Comes Alive
          </motion.p>
        </div>

        {/* --- STAGE 5: Fluid Progress Line & Counter --- */}
        <motion.div
          className="loading-indicator-area"
          initial={{ opacity: 0, y: 12 }}
          animate={stage >= 4 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Progress Line Track */}
          <div className="progress-bar-wrapper">
            <div className="progress-bar-track">
              <motion.div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.15 }}
              >
                <div className="progress-glow-head" />
              </motion.div>
            </div>
          </div>

          {/* Progress Footer Meta: Status Message & Percentage */}
          <div className="progress-meta-info">
            <div className="status-text-wrapper">
              <AnimatePresence mode="wait">
                <motion.span
                  key={statusTextIndex}
                  className="status-message"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.25 }}
                >
                  {statusMessages[statusTextIndex]}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="percentage-badge">
              {progress === 100 ? (
                <motion.span 
                  className="percentage-done"
                  initial={{ scale: 0.85 }}
                  animate={{ scale: 1 }}
                >
                  <CheckCircle2 size={14} className="check-icon" /> 100%
                </motion.span>
              ) : (
                <span>{progress}%</span>
              )}
            </div>
          </div>
        </motion.div>

      </div>

      {/* Footer Subtle Brand Tag */}
      <motion.div
        className="loader-footer-brand"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.55 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <span>College Event Platform &bull; Edition 2026</span>
      </motion.div>

    </motion.div>
  );
};
