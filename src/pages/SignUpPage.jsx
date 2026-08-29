import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, Calendar, Phone, ArrowRight, CheckCircle, Check } from 'lucide-react';
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

export const SignUpPage = () => {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/profile';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    college: '',
    year: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match.";
    }

    if (!formData.college.trim()) {
      newErrors.college = 'Please enter your college / university / organization.';
    }

    if (!formData.year) {
      newErrors.year = 'Please select your year of study.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await signup(formData);
      setFormSuccess(true);
      setTimeout(() => {
        navigate(redirectTo);
      }, 700);
    } catch (err) {
      setErrors({ form: 'Failed to create account. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = () => {
    signup({
      name: 'Google User',
      email: 'user@google.com',
      college: 'IIIT Hyderabad',
      year: '3rd Year'
    }).then(() => {
      navigate(redirectTo);
    });
  };

  const isLengthValid = formData.password.length >= 8;

  return (
    <div className="auth-container-page">
      <div className="auth-card-layout">

        {/* Left Visual Branding Panel (Desktop) */}
        <div className="auth-brand-side">
          <div className="brand-side-content">
            <div className="brand-badge-pill">JOIN THE COMMUNITY</div>
            <h2 className="brand-side-heading">
              Step Into the Heart of Campus Events
            </h2>
            <p className="brand-side-desc">
              Connect with thousands of students from IIIT Hyderabad, JNTUH, CBIT, Vasavi, and top institutions.
            </p>
            <div className="brand-feature-list">
              <div className="feature-item">
                <CheckCircle size={18} className="feature-icon" />
                <span>Personalized event recommendations</span>
              </div>
              <div className="feature-item">
                <CheckCircle size={18} className="feature-icon" />
                <span>1-Click registration for team hackathons</span>
              </div>
              <div className="feature-item">
                <CheckCircle size={18} className="feature-icon" />
                <span>Organize and showcase your college fest</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Container */}
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
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">
              Join Festora and discover college events, hackathons, fests and experiences.
            </p>
          </div>

          {formSuccess && (
            <div className="auth-alert success" role="alert">
              <CheckCircle size={18} />
              <span>✓ Account created successfully! Redirecting...</span>
            </div>
          )}

          {errors.form && (
            <div className="auth-alert error" role="alert">
              <span>{errors.form}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="signup-name">Full Name</label>
              <div className={`input-wrapper ${errors.name ? 'has-error' : ''}`}>
                <User size={18} className="input-icon" />
                <input
                  id="signup-name"
                  type="text"
                  placeholder="e.g. Bhavadeep Reddy"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
              {errors.name && <span className="field-error-text">{errors.name}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="signup-email">Email</label>
              <div className={`input-wrapper ${errors.email ? 'has-error' : ''}`}>
                <Mail size={18} className="input-icon" />
                <input
                  id="signup-email"
                  type="email"
                  placeholder="name@college.edu"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              {errors.email && <span className="field-error-text">{errors.email}</span>}
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label htmlFor="signup-phone">Phone Number (Optional)</label>
              <div className="input-wrapper">
                <Phone size={18} className="input-icon" />
                <input
                  id="signup-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <div className={`input-wrapper ${errors.password ? 'has-error' : ''}`}>
                <Lock size={18} className="input-icon" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  autoComplete="new-password"
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

              {/* Password Requirement Hint */}
              <div className={`password-req-hint ${isLengthValid ? 'met' : ''}`}>
                <Check size={14} className="req-icon" />
                <span>At least 8 characters</span>
              </div>
              {errors.password && <span className="field-error-text">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="signup-confirm-password">Confirm Password</label>
              <div className={`input-wrapper ${errors.confirmPassword ? 'has-error' : ''}`}>
                <Lock size={18} className="input-icon" />
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <span className="field-error-text">{errors.confirmPassword}</span>}
            </div>

            {/* College / Organization */}
            <div className="form-group">
              <label htmlFor="signup-college">College / Organization</label>
              <div className={`input-wrapper ${errors.college ? 'has-error' : ''}`}>
                <GraduationCap size={18} className="input-icon" />
                <input
                  id="signup-college"
                  type="text"
                  placeholder="e.g. IIIT Hyderabad, JNTUH, CBIT"
                  value={formData.college}
                  onChange={(e) => handleInputChange('college', e.target.value)}
                  required
                />
              </div>
              {errors.college && <span className="field-error-text">{errors.college}</span>}
            </div>

            {/* Year of Study */}
            <div className="form-group">
              <label htmlFor="signup-year">Year of Study</label>
              <div className={`input-wrapper select-wrapper ${errors.year ? 'has-error' : ''}`}>
                <Calendar size={18} className="input-icon" />
                <select
                  id="signup-year"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  required
                >
                  <option value="" disabled>Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgraduate / PhD">Postgraduate / PhD</option>
                  <option value="Organizer / Faculty">Organizer / Faculty</option>
                </select>
              </div>
              {errors.year && <span className="field-error-text">{errors.year}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
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
            onClick={handleGoogleSignUp}
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          {/* Footer Link */}
          <div className="auth-footer-text">
            Already have an account?{' '}
            <Link to="/signin" className="auth-switch-link">
              Sign in
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default SignUpPage;
