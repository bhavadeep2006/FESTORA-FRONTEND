import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { eventsData, collegesData } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { Ticket, CheckCircle2, Upload, User, Mail, School, BookOpen, ShieldCheck, ArrowRight, Phone, Users } from 'lucide-react';
import './RegisterPage.css';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const eventParam = searchParams.get('event') || '';
  const navigate = useNavigate();
  const { isAuthenticated, user, addTicket } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    college: user?.college || collegesData[0].name,
    eventId: eventParam || eventsData[0].id,
    branch: user?.branch || 'Computer Science & Engineering',
    year: user?.year || '3rd Year',
    teamName: '',
    teamMembers: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const selectedEvent = eventsData.find((e) => e.id === formData.eventId) || eventsData[0];
  const isTeamEvent = selectedEvent.category === 'Tech & Hackathons' || selectedEvent.title.toLowerCase().includes('hack');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save transient registration form details
    sessionStorage.setItem(`festora_reg_draft_${selectedEvent.id}`, JSON.stringify(formData));
    navigate(`/events/${selectedEvent.id}/payment`);
  };

  if (!isAuthenticated) {
    return (
      <div className="register-page-view">
        <div className="section-container" style={{ maxWidth: '480px', textCenter: 'center', padding: '60px 16px' }}>
          <div className="registration-success-card" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-card)' }}>
            <h2 className="success-heading" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Sign in to register</h2>
            <p className="success-subtext" style={{ marginBottom: '24px' }}>
              You need a Festora account to claim passes and register for campus events.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to={`/signin?redirect=/register?event=${formData.eventId}`} className="auth-btn-primary" style={{ textDecoration: 'none', justifyContent: 'center' }}>
                Sign In
              </Link>
              <Link to={`/signup?redirect=/register?event=${formData.eventId}`} className="auth-btn-google" style={{ textDecoration: 'none', justifyContent: 'center' }}>
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page-view">
      <div className="section-container">
        
        <div className="register-header-box">
          <span className="eyebrow-tag">Festora Student Pass</span>
          <h1 className="register-title">Register for Campus Event Pass</h1>
          <p className="register-desc">
            Instantly generate your digital QR student pass for seamless gate access.
          </p>
        </div>

        {submitted ? (
          <div className="registration-success-card">
            <div className="success-icon-circle">
              <CheckCircle2 size={48} className="check-mark-icon" />
            </div>

            <h2 className="success-heading">REGISTRATION SUCCESSFUL!</h2>
            <p className="success-subtext">
              Your registration has been confirmed for <strong>{selectedEvent.title}</strong>.
            </p>

            {/* Mock Digital QR Ticket */}
            <div className="digital-ticket-box">
              <div className="ticket-header">
                <span className="ticket-wordmark">FESTORA PASS</span>
                <span className="ticket-status-pill">CONFIRMED PASS</span>
              </div>
              <div className="ticket-body">
                <div className="ticket-meta-block">
                  <span className="ticket-label">ATTENDEE</span>
                  <span className="ticket-val">{formData.fullName || 'Student Attendee'}</span>
                </div>
                <div className="ticket-meta-block">
                  <span className="ticket-label">COLLEGE</span>
                  <span className="ticket-val">{formData.college}</span>
                </div>
                <div className="ticket-meta-block">
                  <span className="ticket-label">EVENT</span>
                  <span className="ticket-val">{selectedEvent.title}</span>
                </div>
                <div className="ticket-qr-dummy">
                  <div className="qr-box-pattern">
                    <ShieldCheck size={36} className="qr-shield" />
                    <span>SECURE QR GATE CODE</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
              <button className="done-btn" onClick={() => navigate('/tickets')}>
                <Ticket size={16} />
                <span>View My Ticket</span>
              </button>
              <button className="done-btn" style={{ background: 'var(--surface-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-card)' }} onClick={() => navigate('/events')}>
                <span>Browse Events</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="register-form-card">
            <form onSubmit={handleSubmit} className="register-form">
              
              {/* Event Selection */}
              <div className="form-group full-width">
                <label><Ticket size={16} /> Select Campus Event</label>
                <select
                  name="eventId"
                  value={formData.eventId}
                  onChange={handleChange}
                  className="form-select"
                >
                  {eventsData.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.title} ({evt.college})
                    </option>
                  ))}
                </select>
              </div>

              {/* Full Name */}
              <div className="form-group">
                <label><User size={16} /> Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label><Mail size={16} /> Student Email *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="student@university.edu.in"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              {/* Phone */}
              <div className="form-group">
                <label><Phone size={16} /> Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              {/* College */}
              <div className="form-group">
                <label><School size={16} /> College / University *</label>
                <input
                  type="text"
                  name="college"
                  placeholder="e.g. IIIT Hyderabad"
                  value={formData.college}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              {/* Branch */}
              <div className="form-group">
                <label><BookOpen size={16} /> Branch / Department</label>
                <input
                  type="text"
                  name="branch"
                  placeholder="e.g. Computer Science"
                  value={formData.branch}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              {/* Year */}
              <div className="form-group">
                <label><BookOpen size={16} /> Year of Study *</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>

              {/* Team Event Fields */}
              {isTeamEvent && (
                <>
                  <div className="form-group">
                    <label><Users size={16} /> Team Name</label>
                    <input
                      type="text"
                      name="teamName"
                      placeholder="e.g. Cyber Squad"
                      value={formData.teamName}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label><Users size={16} /> Team Members (Names / Emails)</label>
                    <input
                      type="text"
                      name="teamMembers"
                      placeholder="Member 1, Member 2, Member 3"
                      value={formData.teamMembers}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </>
              )}

              {/* Submit CTA */}
              <button type="submit" className="submit-register-btn">
                <Ticket size={18} />
                <span>Proceed to Payment</span>
                <ArrowRight size={18} />
              </button>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default RegisterPage;

