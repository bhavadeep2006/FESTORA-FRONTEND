import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, GraduationCap, Calendar, Phone, ArrowRight, CheckCircle, ArrowLeft, RefreshCw, KeyRound, AlertCircle } from 'lucide-react';
import { FestoraLogo } from '../components/FestoraLogo/FestoraLogo';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { GoogleIcon } from './SignInPage';
import './AuthPages.css';

export const SignUpPage = () => {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  // Step 1: SignUp Form State, Step 2: OTP Verification State
  const [step, setStep] = useState('signup'); // 'signup' | 'otp'

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    college: '',
    year_of_study: '',
    department: 'General'
  });

  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState({ loading: false, message: '', error: '' });
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const { register, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  // Cooldown timer for OTP Resend
  useEffect(() => {
    let timer;
    if (cooldownSeconds > 0) {
      timer = setInterval(() => {
        setCooldownSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateSignUpForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full Name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match.";
    }

    if (!formData.college.trim()) {
      newErrors.college = 'College name is required.';
    }

    if (!formData.year_of_study) {
      newErrors.year_of_study = 'Please select your year of study.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!validateSignUpForm()) return;

    setIsSubmitting(true);
    setErrors({});
    try {
      const payload = {
        full_name: formData.full_name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        college: formData.college.trim(),
        year_of_study: formData.year_of_study,
        department: formData.department.trim() || 'General'
      };

      console.log('[SIGNUP] register submitted:', payload);
      const res = await register(payload);
      console.log('[SIGNUP] register response:', res);
      
      if (res) {
        console.log('[SIGNUP] switching to OTP screen');
        setStep('otp');
        setCooldownSeconds(30);
      } else {
        console.warn('[SIGNUP] Empty response from register API');
      }
    } catch (err) {
      console.error('[SIGNUP] Registration error caught:', err);
      const serverMsg = err.data?.message || err.message || 'Registration failed. Please try again.';
      setErrors({ form: serverMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerifySubmit = async (e) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrors({ otp: 'Please enter the 6-digit OTP code sent to your email.' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      const res = await verifyOtp(formData.email.toLowerCase().trim(), otpCode.trim());
      if (res && res.success) {
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      const serverMsg = err.data?.message || err.message || 'Invalid or expired OTP code.';
      setErrors({ otp: serverMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtpClick = async () => {
    if (cooldownSeconds > 0 || resendStatus.loading) return;

    setResendStatus({ loading: true, message: '', error: '' });
    try {
      const res = await resendOtp(formData.email.toLowerCase().trim());
      setResendStatus({
        loading: false,
        message: res.message || 'A new verification code has been sent to your email.',
        error: ''
      });
      setCooldownSeconds(60);
    } catch (err) {
      const serverMsg = err.data?.message || err.message || 'Failed to resend OTP. Please try again.';
      setResendStatus({
        loading: false,
        message: '',
        error: serverMsg
      });
    }
  };

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    window.location.href = api.googleLoginUrl();
  };

  return (
    <div className="auth-container-page">
      <div className="auth-card-layout">

        {/* Left Visual Branding Panel */}
        <div className="auth-brand-side">
          <div className="brand-side-content">
            <div className="brand-badge-pill">FESTORA VERIFIED SIGNUP</div>
            <h2 className="brand-side-heading">
              Step Into the Heart of Campus Events
            </h2>
            <p className="brand-side-desc">
              Connect with thousands of students from IIIT Hyderabad, JNTUH, CBIT, Vasavi, and top institutions.
            </p>
            <div className="brand-feature-list">
              <div className="feature-item">
                <CheckCircle size={18} className="feature-icon" />
                <span>Real-time email OTP security verification</span>
              </div>
              <div className="feature-item">
                <CheckCircle size={18} className="feature-icon" />
                <span>1-Click registration for team hackathons</span>
              </div>
              <div className="feature-item">
                <CheckCircle size={18} className="feature-icon" />
                <span>Verified student digital passes</span>
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

            {step === 'signup' ? (
              <>
                <h1 className="auth-title">Create your account</h1>
                <p className="auth-subtitle">
                  Join Festora and discover college events, hackathons, fests and experiences.
                </p>
              </>
            ) : (
              <>
                <h1 className="auth-title">Verify your Email</h1>
                <p className="auth-subtitle">
                  Enter the 6-digit verification code sent to <strong>{formData.email}</strong>.
                </p>
              </>
            )}
          </div>

          {errors.form && (
            <div className="auth-alert error" role="alert">
              <AlertCircle size={18} />
              <span>{errors.form}</span>
            </div>
          )}

          {step === 'signup' ? (
            /* STEP 1: Registration Form */
            <form onSubmit={handleSignUpSubmit} className="auth-form" noValidate>
              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="signup-name">Full Name *</label>
                <div className={`input-wrapper ${errors.full_name ? 'has-error' : ''}`}>
                  <User size={18} className="input-icon" />
                  <input
                    id="signup-name"
                    type="text"
                    placeholder="e.g. Bhavadeep Reddy"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    required
                  />
                </div>
                {errors.full_name && <span className="field-error-text">{errors.full_name}</span>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="signup-email">Email Address *</label>
                <div className={`input-wrapper ${errors.email ? 'has-error' : ''}`}>
                  <Mail size={18} className="input-icon" />
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="name@college.edu"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                {errors.email && <span className="field-error-text">{errors.email}</span>}
              </div>

              {/* Phone Number */}
              <div className="form-group">
                <label htmlFor="signup-phone">Phone Number *</label>
                <div className={`input-wrapper ${errors.phone ? 'has-error' : ''}`}>
                  <Phone size={18} className="input-icon" />
                  <input
                    id="signup-phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>
                {errors.phone && <span className="field-error-text">{errors.phone}</span>}
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="signup-password">Password *</label>
                <div className={`input-wrapper ${errors.password ? 'has-error' : ''}`}>
                  <Lock size={18} className="input-icon" />
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                  />
                </div>
                {errors.password && <span className="field-error-text">{errors.password}</span>}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label htmlFor="signup-confirm-password">Confirm Password *</label>
                <div className={`input-wrapper ${errors.confirmPassword ? 'has-error' : ''}`}>
                  <Lock size={18} className="input-icon" />
                  <input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="Repeat your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                  />
                </div>
                {errors.confirmPassword && <span className="field-error-text">{errors.confirmPassword}</span>}
              </div>

              {/* College / Organization */}
              <div className="form-group">
                <label htmlFor="signup-college">College / University *</label>
                <div className={`input-wrapper ${errors.college ? 'has-error' : ''}`}>
                  <GraduationCap size={18} className="input-icon" />
                  <input
                    id="signup-college"
                    type="text"
                    placeholder="e.g. IIIT Hyderabad"
                    value={formData.college}
                    onChange={(e) => handleInputChange('college', e.target.value)}
                    required
                  />
                </div>
                {errors.college && <span className="field-error-text">{errors.college}</span>}
              </div>

              {/* Year of Study */}
              <div className="form-group">
                <label htmlFor="signup-year">Year of Study *</label>
                <div className={`input-wrapper select-wrapper ${errors.year_of_study ? 'has-error' : ''}`}>
                  <Calendar size={18} className="input-icon" />
                  <select
                    id="signup-year"
                    value={formData.year_of_study}
                    onChange={(e) => handleInputChange('year_of_study', e.target.value)}
                    required
                  >
                    <option value="" disabled>Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
                {errors.year_of_study && <span className="field-error-text">{errors.year_of_study}</span>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="auth-btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending OTP code...' : 'Create Account & Send OTP'}
                {!isSubmitting && <ArrowRight size={18} />}
              </button>

              {/* Divider & Google button */}
              <div className="auth-divider">
                <span>OR</span>
              </div>

              <button
                type="button"
                className="auth-btn-google"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isSubmitting}
              >
                <GoogleIcon size={18} />
                <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>

              <div className="auth-footer-text">
                Already have an account?{' '}
                <Link to="/signin" className="auth-switch-link">
                  Sign in
                </Link>
              </div>
            </form>
          ) : (
            /* STEP 2: OTP Verification Form */
            <form onSubmit={handleOtpVerifySubmit} className="auth-form" noValidate>
              {resendStatus.message && (
                <div className="auth-alert success" role="alert">
                  <CheckCircle size={18} />
                  <span>{resendStatus.message}</span>
                </div>
              )}

              {resendStatus.error && (
                <div className="auth-alert error" role="alert">
                  <AlertCircle size={18} />
                  <span>{resendStatus.error}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="otp-code">6-Digit Verification Code</label>
                <div className={`input-wrapper ${errors.otp ? 'has-error' : ''}`}>
                  <KeyRound size={18} className="input-icon" />
                  <input
                    id="otp-code"
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value.replace(/\D/g, ''));
                      if (errors.otp) setErrors({});
                    }}
                    style={{ letterSpacing: '4px', fontSize: '1.2rem', fontWeight: 'bold' }}
                    required
                  />
                </div>
                {errors.otp && <span className="field-error-text">{errors.otp}</span>}
              </div>

              <button
                type="submit"
                className="auth-btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verifying OTP...' : 'Verify OTP & Finish'}
                {!isSubmitting && <ArrowRight size={18} />}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setStep('signup')}
                  className="back-to-signin-btn"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <ArrowLeft size={16} />
                  <span>Change Email</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendOtpClick}
                  disabled={cooldownSeconds > 0 || resendStatus.loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: cooldownSeconds > 0 ? 'var(--text-muted, #94a3b8)' : 'var(--primary-color, #4f46e5)',
                    fontWeight: 'bold',
                    cursor: cooldownSeconds > 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={14} className={resendStatus.loading ? 'spin' : ''} />
                  {resendStatus.loading
                    ? 'Resending...'
                    : cooldownSeconds > 0
                    ? `Resend OTP in ${cooldownSeconds}s`
                    : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

        </motion.div>
      </div>
    </div>
  );
};

export default SignUpPage;
