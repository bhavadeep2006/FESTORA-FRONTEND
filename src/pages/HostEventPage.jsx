import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FestoraLogo } from '../components/FestoraLogo/FestoraLogo';
import { 
  Sparkles, 
  User, 
  Mail, 
  Phone, 
  School, 
  Briefcase, 
  MapPin, 
  Calendar, 
  Users, 
  Globe, 
  CheckCircle, 
  ArrowLeft, 
  Send 
} from 'lucide-react';
import './HostEventPage.css';

export const HostEventPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    college: user?.college || '',
    role: 'Student Coordinator',
    city: user?.city || 'Hyderabad',
    eventName: '',
    category: '',
    expectedDate: '',
    expectedParticipants: '',
    description: '',
    additionalInfo: '',
    socialLink: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please enter your name.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Please enter your phone number.';
    }

    if (!formData.college.trim()) {
      newErrors.college = 'Please enter your college or organization.';
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Please enter your designation or role.';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Please enter your city.';
    }

    if (!formData.eventName.trim()) {
      newErrors.eventName = 'Please enter the event name.';
    }

    if (!formData.category) {
      newErrors.category = 'Please select an event category.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="host-event-page-view">
      <div className="section-container" style={{ maxWidth: '800px' }}>
        
        {submitted ? (
          <motion.div 
            className="host-success-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            <div className="success-icon-badge" style={{ width: '72px', height: '72px' }}>
              <CheckCircle size={40} />
            </div>

            <h1 className="success-title">✓ Request Submitted</h1>

            <p className="success-heading-msg">
              Thanks for reaching out to Festora!
            </p>

            <p className="success-body-msg">
              We've received your event hosting request for <strong>{formData.eventName}</strong>. Our team will review the details and contact you shortly at <strong>{formData.email}</strong>.
            </p>

            <div style={{ marginTop: '32px' }}>
              <Link to="/" className="auth-btn-primary" style={{ display: 'inline-flex', width: 'auto', padding: '12px 28px', textDecoration: 'none' }}>
                <ArrowLeft size={18} />
                <span>Back to Festora</span>
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="host-request-wrapper"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header section */}
            <div className="host-header-box text-center">
              <span className="eyebrow-tag"><Sparkles size={14} /> FESTORA ORGANIZER HUB</span>
              <h1 className="host-page-title">Host an Event with Festora</h1>
              <p className="host-page-subtext">
                Have a college fest, hackathon, workshop, competition, cultural event, or campus experience you'd like to feature on Festora? Tell us about it and our team will get in touch.
              </p>
            </div>

            {/* Request Form */}
            <form onSubmit={handleSubmit} className="host-form-card" noValidate>
              
              {/* Section 1: Organizer Info */}
              <div className="form-section-header">
                <h3>Personal & Organizer Details</h3>
              </div>

              <div className="host-form-grid">
                {/* Full Name */}
                <div className="form-group">
                  <label htmlFor="host-name">Full Name *</label>
                  <div className={`input-wrapper ${errors.fullName ? 'has-error' : ''}`}>
                    <User size={18} className="input-icon" />
                    <input
                      id="host-name"
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      required
                    />
                  </div>
                  {errors.fullName && <span className="field-error-text">{errors.fullName}</span>}
                </div>

                {/* Email */}
                <div className="form-group">
                  <label htmlFor="host-email">Email *</label>
                  <div className={`input-wrapper ${errors.email ? 'has-error' : ''}`}>
                    <Mail size={18} className="input-icon" />
                    <input
                      id="host-email"
                      type="email"
                      placeholder="name@college.edu"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  {errors.email && <span className="field-error-text">{errors.email}</span>}
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label htmlFor="host-phone">Phone Number *</label>
                  <div className={`input-wrapper ${errors.phone ? 'has-error' : ''}`}>
                    <Phone size={18} className="input-icon" />
                    <input
                      id="host-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                    />
                  </div>
                  {errors.phone && <span className="field-error-text">{errors.phone}</span>}
                </div>
              </div>

              {/* Section 2: Organization Info */}
              <div className="form-section-header" style={{ marginTop: '28px' }}>
                <h3>Organization Details</h3>
              </div>

              <div className="host-form-grid">
                {/* College / Organization */}
                <div className="form-group">
                  <label htmlFor="host-college">College / Organization Name *</label>
                  <div className={`input-wrapper ${errors.college ? 'has-error' : ''}`}>
                    <School size={18} className="input-icon" />
                    <input
                      id="host-college"
                      type="text"
                      placeholder="e.g. IIIT Hyderabad / Tech Club"
                      value={formData.college}
                      onChange={(e) => handleInputChange('college', e.target.value)}
                      required
                    />
                  </div>
                  {errors.college && <span className="field-error-text">{errors.college}</span>}
                </div>

                {/* Designation / Role */}
                <div className="form-group">
                  <label htmlFor="host-role">Designation / Role *</label>
                  <div className={`input-wrapper ${errors.role ? 'has-error' : ''}`}>
                    <Briefcase size={18} className="input-icon" />
                    <input
                      id="host-role"
                      type="text"
                      placeholder="e.g. Student Coordinator / Convenor"
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      required
                    />
                  </div>
                  {errors.role && <span className="field-error-text">{errors.role}</span>}
                </div>

                {/* City */}
                <div className="form-group">
                  <label htmlFor="host-city">City *</label>
                  <div className={`input-wrapper ${errors.city ? 'has-error' : ''}`}>
                    <MapPin size={18} className="input-icon" />
                    <input
                      id="host-city"
                      type="text"
                      placeholder="e.g. Hyderabad"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      required
                    />
                  </div>
                  {errors.city && <span className="field-error-text">{errors.city}</span>}
                </div>
              </div>

              {/* Section 3: Event Info */}
              <div className="form-section-header" style={{ marginTop: '28px' }}>
                <h3>Event Details</h3>
              </div>

              <div className="host-form-grid">
                {/* Event Name */}
                <div className="form-group full-width">
                  <label htmlFor="host-event-name">Event Name *</label>
                  <div className={`input-wrapper ${errors.eventName ? 'has-error' : ''}`}>
                    <Sparkles size={18} className="input-icon" />
                    <input
                      id="host-event-name"
                      type="text"
                      placeholder="e.g. Felicity Hackathon 2026"
                      value={formData.eventName}
                      onChange={(e) => handleInputChange('eventName', e.target.value)}
                      required
                    />
                  </div>
                  {errors.eventName && <span className="field-error-text">{errors.eventName}</span>}
                </div>

                {/* Event Category */}
                <div className="form-group">
                  <label htmlFor="host-category">Event Category *</label>
                  <div className={`input-wrapper select-wrapper ${errors.category ? 'has-error' : ''}`}>
                    <select
                      id="host-category"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      required
                    >
                      <option value="" disabled>Select category</option>
                      <option value="Technical">Technical</option>
                      <option value="Hackathon">Hackathon</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Sports">Sports</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Competition">Competition</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {errors.category && <span className="field-error-text">{errors.category}</span>}
                </div>

                {/* Expected Event Date */}
                <div className="form-group">
                  <label htmlFor="host-date">Expected Event Date</label>
                  <div className="input-wrapper">
                    <Calendar size={18} className="input-icon" />
                    <input
                      id="host-date"
                      type="text"
                      placeholder="e.g. March 2026 / Mid-April"
                      value={formData.expectedDate}
                      onChange={(e) => handleInputChange('expectedDate', e.target.value)}
                    />
                  </div>
                </div>

                {/* Expected Number of Participants */}
                <div className="form-group">
                  <label htmlFor="host-participants">Expected Number of Participants</label>
                  <div className="input-wrapper">
                    <Users size={18} className="input-icon" />
                    <input
                      id="host-participants"
                      type="text"
                      placeholder="e.g. 500+ Students"
                      value={formData.expectedParticipants}
                      onChange={(e) => handleInputChange('expectedParticipants', e.target.value)}
                    />
                  </div>
                </div>

                {/* Website / Instagram / Social Link */}
                <div className="form-group">
                  <label htmlFor="host-social">Website / Instagram / Social Link (Optional)</label>
                  <div className="input-wrapper">
                    <Globe size={18} className="input-icon" />
                    <input
                      id="host-social"
                      type="url"
                      placeholder="https://instagram.com/yourfest"
                      value={formData.socialLink}
                      onChange={(e) => handleInputChange('socialLink', e.target.value)}
                    />
                  </div>
                </div>

                {/* Event Description */}
                <div className="form-group full-width">
                  <label htmlFor="host-desc">Event Description</label>
                  <textarea
                    id="host-desc"
                    rows={3}
                    placeholder="Briefly describe what your event is about..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>

                {/* Additional Info */}
                <div className="form-group full-width">
                  <label htmlFor="host-additional">Additional Information</label>
                  <textarea
                    id="host-additional"
                    rows={2}
                    placeholder="Any specific support or ticketing assistance you need from Festora..."
                    value={formData.additionalInfo}
                    onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div style={{ marginTop: '32px' }}>
                <button
                  type="submit"
                  className="auth-btn-primary"
                  disabled={isSubmitting}
                  style={{ justifyContent: 'center' }}
                >
                  {isSubmitting ? 'Submitting Request...' : 'Submit Host Request'}
                  {!isSubmitting && <Send size={18} />}
                </button>
              </div>

            </form>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default HostEventPage;
