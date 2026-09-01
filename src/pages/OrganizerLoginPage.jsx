import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Info } from 'lucide-react';
import { FestoraLogo } from '../components/FestoraLogo/FestoraLogo';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export const OrganizerLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { organizerLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    console.log('[ORGANIZER LOGIN FRONTEND]');
    console.log('email submitted:', email.trim());
    console.log('login endpoint: /api/organizer/login');

    try {
      const res = await organizerLogin(email, password);
      console.log('response status:', res.success ? 200 : 'ERROR');
      if (res.success) {
        navigate('/organizer');
      } else {
        setError(res.error || 'Invalid organizer credentials.');
      }
    } catch (err) {
      console.error('[ORGANIZER LOGIN FRONTEND] Error:', err);
      setError('An error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container-page">
      <div className="auth-card-layout single-card-center" style={{ maxWidth: '480px' }}>
        <motion.div
          className="auth-form-side full-width"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="auth-header text-center">
            <Link to="/" className="auth-logo-link" title="Festora Home">
              <FestoraLogo size={48} isAnimated={false} />
            </Link>

            <div className="brand-badge-pill" style={{ margin: '0 auto 12px auto' }}>
              <ShieldCheck size={14} style={{ marginRight: '6px' }} /> ORGANIZER PORTAL
            </div>

            <h1 className="auth-title">Organizer Portal</h1>
            <p className="auth-subtitle">
              Sign in to manage your events and registrations.
            </p>
          </div>

          {error && (
            <div className="auth-alert error" role="alert">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate style={{ marginTop: '16px' }}>
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="org-email">Email Address</label>
              <div className={`input-wrapper ${error ? 'has-error' : ''}`}>
                <Mail size={18} className="input-icon" />
                <input
                  id="org-email"
                  type="email"
                  placeholder="organizer@organization.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="org-password">Password</label>
                <Link to="/forgot-password" className="forgot-password-link">
                  Forgot Password?
                </Link>
              </div>
              <div className={`input-wrapper ${error ? 'has-error' : ''}`}>
                <Lock size={18} className="input-icon" />
                <input
                  id="org-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-btn-primary"
              disabled={isSubmitting}
              style={{ justifyContent: 'center', marginTop: '12px' }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>
          </form>

        </motion.div>
      </div>
    </div>
  );
};

export default OrganizerLoginPage;
