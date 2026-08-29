import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, CheckCircle, ShieldCheck } from 'lucide-react';
import { FestoraLogo } from '../components/FestoraLogo/FestoraLogo';
import './AuthPages.css';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError('Please enter your email.');
      return false;
    } else if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setIsSubmitting(true);
    // Simulate UI response for frontend prototype (no fake email sending, backend-ready structure)
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="auth-container-page">
      <div className="auth-card-layout single-card-center">
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

            {!isSubmitted ? (
              <>
                <h1 className="auth-title">Forgot your password?</h1>
                <p className="auth-subtitle">
                  Enter your email and we'll help you get back into your Festora account.
                </p>
              </>
            ) : (
              <>
                <div className="success-icon-badge">
                  <CheckCircle size={32} />
                </div>
                <h1 className="auth-title">Check your inbox</h1>
                <p className="auth-subtitle">
                  If an account exists with this email ({email}), we've sent instructions to reset your password.
                </p>
              </>
            )}
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="form-group">
                <label htmlFor="forgot-email">Email address</label>
                <div className={`input-wrapper ${error ? 'has-error' : ''}`}>
                  <Mail size={18} className="input-icon" />
                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="name@college.edu"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    autoComplete="email"
                    required
                  />
                </div>
                {error && <span className="field-error-text">{error}</span>}
              </div>

              <button
                type="submit"
                className="auth-btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending Request...' : 'Send Reset Link'}
                {!isSubmitting && <ArrowRight size={18} />}
              </button>
            </form>
          ) : (
            <div className="forgot-success-state">
              <div className="auth-alert success" role="alert">
                <ShieldCheck size={18} />
                <span>✓ Reset instructions requested</span>
              </div>
              <p className="success-help-note">
                Didn't receive the email? Check your spam folder or try requesting again in a few minutes.
              </p>
            </div>
          )}

          <div className="auth-footer-text text-center space-top">
            <Link to="/signin" className="back-to-signin-btn">
              <ArrowLeft size={16} />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
