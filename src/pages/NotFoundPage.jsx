import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass, AlertCircle } from 'lucide-react';
import { FestoraLogo } from '../components/FestoraLogo/FestoraLogo';

export const NotFoundPage = () => {
  return (
    <div className="auth-container-page" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div className="auth-card-layout single-card-center" style={{ maxWidth: '480px' }}>
        <motion.div
          className="auth-form-side full-width text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="auth-header text-center">
            <Link to="/" className="auth-logo-link" title="Festora Home">
              <FestoraLogo size={48} isAnimated={false} />
            </Link>

            <h1 className="auth-title" style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--strong-lavender)', margin: '12px 0 0 0' }}>
              404
            </h1>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '8px' }}>
              Looks like this page doesn't exist.
            </h2>
            
            <p className="auth-subtitle" style={{ marginTop: '8px' }}>
              The campus event link you followed might be expired or moved.
            </p>
          </div>

          <div style={{ marginTop: '28px' }}>
            <Link to="/" className="auth-btn-primary" style={{ textDecoration: 'none', justifyContent: 'center' }}>
              <ArrowLeft size={18} />
              <span>Back to Festora</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
