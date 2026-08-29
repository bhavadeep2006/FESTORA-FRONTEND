import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { FestoraLogo } from '../components/FestoraLogo/FestoraLogo';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const GoogleIcon = () => (
  <svg className="google-svg-icon" viewBox="0 0 24 24" width="20" height="20">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const SignInPage = () => {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/profile';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = 'Please enter your email.';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Please enter your password.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      setFormSuccess(true);
      setTimeout(() => {
        navigate(redirectTo);
      }, 700);
    } catch (err) {
      setErrors({ form: 'Invalid credentials. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    login('googleuser@gmail.com', 'password').then(() => {
      navigate(redirectTo);
    });
  };

  return (
    <div className="auth-container-page">
      <div className="auth-card-layout">
        
        {/* Left Visual Branding Panel (Desktop) */}
        <div className="auth-brand-side">
          <div className="brand-side-content">
            <div className="brand-badge-pill">FESTORA EXPERIENCE</div>
            <h2 className="brand-side-heading">
              Discover Campus Life & Beyond
            </h2>
            <p className="brand-side-desc">
              Your pass to every hackathon, tech symposium, cultural fest, and concert happening in Hyderabad colleges.
            </p>
            <div className="brand-feature-list">
              <div className="feature-item">
                <CheckCircle size={18} className="feature-icon" />
                <span>Instant digital ticket passes</span>
              </div>
              <div className="feature-item">
                <CheckCircle size={18} className="feature-icon" />
                <span>Zero registration hassle</span>
              </div>
              <div className="feature-item">
                <CheckCircle size={18} className="feature-icon" />
                <span>Verified IIIT & JNTU event organizers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Authentication Form Container */}
        <motion.div
          className="auth-form-side"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="auth-header">
            <Link to="/" className="auth-logo-link" title="Festora Home">
              <FestoraLogo size={48} isAnimated={false} />
            </Link>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">
              Sign in to continue discovering what's happening around you.
            </p>
          </div>

          {formSuccess && (
            <div className="auth-alert success" role="alert">
              <CheckCircle size={18} />
              <span>Signed in successfully! Redirecting...</span>
            </div>
          )}

          {errors.form && (
            <div className="auth-alert error" role="alert">
              <span>{errors.form}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="signin-email">Email address</label>
              <div className={`input-wrapper ${errors.email ? 'has-error' : ''}`}>
                <Mail size={18} className="input-icon" />
                <input
                  id="signin-email"
                  type="email"
                  placeholder="name@college.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                  }}
                  autoComplete="email"
                  required
                />
              </div>
              {errors.email && <span className="field-error-text">{errors.email}</span>}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="signin-password">Password</label>
                <Link to="/forgot-password" className="forgot-password-link">
                  Forgot password?
                </Link>
              </div>
              <div className={`input-wrapper ${errors.password ? 'has-error' : ''}`}>
                <Lock size={18} className="input-icon" />
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                  }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="field-error-text">{errors.password}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>OR</span>
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            className="auth-btn-google"
            onClick={handleGoogleSignIn}
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          {/* Footer Link */}
          <div className="auth-footer-text">
            Don't have an account?{' '}
            <Link to="/signup" className="auth-switch-link">
              Create account
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default SignInPage;
