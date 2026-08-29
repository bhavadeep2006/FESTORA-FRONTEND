import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { eventsData, collegesData } from '../data/mockData';
import { Ticket, CheckCircle2, Upload, User, Mail, School, BookOpen, ShieldCheck, ArrowRight } from 'lucide-react';
import './RegisterPage.css';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const eventParam = searchParams.get('event') || '';
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: collegesData[0].name,
    eventId: eventParam || eventsData[0].id,
    course: 'B.Tech / B.E.',
    year: '3rd Year',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    // Trigger celebratory confetti burst!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#C4B5FD', '#8B5CF6', '#7C3AED', '#22C55E']
    });
  };

  const selectedEvent = eventsData.find((e) => e.id === formData.eventId) || eventsData[0];

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

            <h2 className="success-heading">Pass Generated Successfully!</h2>
            <p className="success-subtext">
              Your official Festora Student Entry Pass for <strong>{selectedEvent.title}</strong> is active and verified.
            </p>

            {/* Mock Digital QR Ticket */}
            <div className="digital-ticket-box">
              <div className="ticket-header">
                <span className="ticket-wordmark">FESTORA PASS</span>
                <span className="ticket-status-pill">VERIFIED STUDENT</span>
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

            <button className="done-btn" onClick={() => navigate('/events')}>
              <span>Browse More Events</span>
              <ArrowRight size={16} />
            </button>
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
                <label><User size={16} /> Full Name</label>
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
                <label><Mail size={16} /> Student Email</label>
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

              {/* College */}
              <div className="form-group">
                <label><School size={16} /> College / University</label>
                <select
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  className="form-select"
                >
                  {collegesData.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Course & Year */}
              <div className="form-group">
                <label><BookOpen size={16} /> Degree & Year</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="1st Year">1st Year Undergraduate</option>
                  <option value="2nd Year">2nd Year Undergraduate</option>
                  <option value="3rd Year">3rd Year Undergraduate</option>
                  <option value="4th Year">4th Year Undergraduate</option>
                  <option value="Postgraduate">Postgraduate / Masters</option>
                </select>
              </div>

              {/* Student ID Upload Dropzone */}
              <div className="form-group full-width">
                <label><Upload size={16} /> Upload Student ID Card (Verification)</label>
                <div className="upload-dropzone">
                  <Upload size={24} className="upload-icon" />
                  <span className="upload-title">Click to upload or drag student ID image</span>
                  <span className="upload-hint">PNG, JPG or PDF up to 5MB (Used strictly for gate verification)</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button type="submit" className="submit-register-btn">
                <Ticket size={18} />
                <span>Generate Official Student Pass</span>
              </button>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default RegisterPage;
