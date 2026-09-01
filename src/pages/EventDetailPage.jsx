import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, normalizeEvent } from '../services/api';
import { eventsData as fallbackEvents } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Calendar,
  Clock,
  Award,
  Users,
  Ticket,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Share2,
  Heart,
  RefreshCw,
  AlertCircle,
  X,
  Check,
  User,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Sparkles
} from 'lucide-react';
import './EventDetailPage.css';

export const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, savedEventIds, toggleSaveEvent, updateUserProfile } = useAuth();
  const [copiedMsg, setCopiedMsg] = useState(false);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real backend registration status
  const [existingReg, setExistingReg] = useState(null);
  const [checkingReg, setCheckingReg] = useState(false);

  // Registration Modal & Form State
  const [showRegModal, setShowRegModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [regSuccess, setRegSuccess] = useState(null);
  const [regError, setRegError] = useState(null);

  // Interactive Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    college: '',
    phone: '',
    department: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name || user.full_name || '',
        email: user.email || '',
        college: user.college || '',
        phone: user.phone || '',
        department: user.department || ''
      });
    }
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchEventDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('[EVENT DETAIL FETCH] routeParam ID:', id);
        const response = await api.getPublicEventById(id);
        if (response && response.event) {
          setEvent(response.event);
        } else {
          const fallback = fallbackEvents.find(e => String(e.id) === String(id) || e.alias === id);
          if (fallback) {
            setEvent(normalizeEvent(fallback));
          } else {
            setError('Event not found or is not publicly available.');
          }
        }
      } catch (err) {
        console.warn('[EVENT DETAIL FETCH] Backend request failed, attempting fallback match:', err);
        const fallback = fallbackEvents.find(e => String(e.id) === String(id) || e.alias === id);
        if (fallback) {
          setEvent(normalizeEvent(fallback));
        } else {
          console.error('Failed to load event details:', err);
          setError(err.message || 'Event not found or server unreachable.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventDetail();
    }
  }, [id]);

  // Check if student is already registered for this event
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (!isAuthenticated || !id) return;
      setCheckingReg(true);
      try {
        const res = await api.getMyRegistrations();
        if (res && res.registrations) {
          const match = res.registrations.find(
            r => String(r.event_id) === String(id) && r.registration_status !== 'cancelled'
          );
          if (match) {
            setExistingReg(match);
          }
        }
      } catch (err) {
        console.warn('Failed to check existing registration status:', err);
      } finally {
        setCheckingReg(false);
      }
    };

    checkRegistrationStatus();
  }, [isAuthenticated, id]);

  const isSaved = event ? savedEventIds?.includes(event.id) : false;

  const handleOpenModal = () => {
    if (!isAuthenticated) {
      navigate(`/signin?redirect=/events/${id}`);
      return;
    }
    setRegError(null);
    setShowRegModal(true);
  };

  // Team & Custom Fields State
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [customAnswers, setCustomAnswers] = useState({});

  const isTeamEvent = event?.registration_type === 'team';
  const minTeam = event?.min_team_size || 2;
  const maxTeam = event?.max_team_size || 4;

  const handleAddTeamMember = () => {
    if (1 + teamMembers.length >= maxTeam) return;
    setTeamMembers([...teamMembers, { name: '', email: '', phone: '' }]);
  };

  const handleRemoveTeamMember = (idx) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== idx));
  };

  const handleMemberChange = (idx, field, value) => {
    const updated = [...teamMembers];
    updated[idx][field] = value;
    setTeamMembers(updated);
  };

  const handleConfirmRegistration = async (e) => {
    e.preventDefault();
    setIsRegistering(true);
    setRegError(null);

    // Update user profile in context if user modified form fields
    if (updateUserProfile && (formData.fullName || formData.college || formData.phone || formData.department)) {
      updateUserProfile({
        name: formData.fullName,
        college: formData.college,
        phone: formData.phone,
        department: formData.department
      });
    }

    // Validation for Team Event
    if (isTeamEvent) {
      if (!teamName.trim()) {
        setRegError('Team Name is required.');
        setIsRegistering(false);
        return;
      }
      const totalMembers = 1 + teamMembers.length;
      if (totalMembers < minTeam) {
        setRegError(`Minimum team size for this event is ${minTeam} member(s). Please add team members.`);
        setIsRegistering(false);
        return;
      }
      if (totalMembers > maxTeam) {
        setRegError(`Maximum team size for this event is ${maxTeam} members.`);
        setIsRegistering(false);
        return;
      }
    }

    // Validation for Custom Fields
    if (event?.custom_fields && event.custom_fields.length > 0) {
      for (const field of event.custom_fields) {
        if (field.is_required) {
          const val = customAnswers[field.id];
          if (val === undefined || val === null || String(val).trim() === '') {
            setRegError(`"${field.field_label}" is required.`);
            setIsRegistering(false);
            return;
          }
        }
      }
    }

    console.log('[EVENT REGISTER] event id:', id);
    try {
      const payload = {
        team_name: isTeamEvent ? teamName.trim() : undefined,
        team_members: isTeamEvent ? [
          { name: formData.fullName || user?.name || 'Leader', email: user?.email || '', phone: formData.phone, is_team_leader: true },
          ...teamMembers.map(m => ({ ...m, is_team_leader: false }))
        ] : undefined,
        custom_field_values: customAnswers
      };

      const res = await api.registerForEvent(id, payload);
      console.log('[EVENT REGISTER] response status: 201 Success', res);
      setRegSuccess({
        message: res.message || 'Registration successful!',
        registration: res.registration,
        ticket: res.ticket
      });
      setExistingReg({
        registration_id: res.registration.id,
        ticket_code: res.ticket?.ticket_code,
        qr_token: res.ticket?.qr_token
      });
    } catch (err) {
      console.error('[EVENT REGISTER] error:', err);
      const msg = err.data?.message || err.message || 'Registration failed. Please try again.';
      setRegError(msg);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleShare = async () => {
    if (!event) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out ${event.title} on Festora!`,
          url: window.location.href,
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="event-detail-view" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="no-results-box" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: '#8B5CF6' }} />
          <h3 style={{ marginTop: '16px' }}>Loading Event Details</h3>
          <p>Fetching information from Festora server...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-detail-view" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="no-results-box" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', textAlign: 'center', maxWidth: '480px' }}>
          <AlertCircle size={36} color="#EF4444" style={{ margin: '0 auto' }} />
          <h3 style={{ marginTop: '16px', color: '#F87171' }}>Event Not Found</h3>
          <p>{error || 'The requested event could not be found or is no longer available.'}</p>
          <button className="reset-filter-btn" onClick={() => navigate('/events')} style={{ marginTop: '20px' }}>
            Back to All Events
          </button>
        </div>
      </div>
    );
  }

  const isAlreadyRegistered = Boolean(existingReg || regSuccess);

  return (
    <div className="event-detail-view">
      
      {/* Top Breadcrumb Navigation */}
      <div className="detail-top-bar">
        <div className="section-container">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            <span>Back to Events</span>
          </button>
        </div>
      </div>

      {/* Hero Section: Balanced Two-Column Desktop Layout */}
      <div className="detail-hero-section">
        <div className="section-container">
          <div className="detail-hero-grid">
            
            {/* Left Column: Sized Poster Card with controlled aspect ratio */}
            <div className="detail-poster-card">
              <img 
                src={event.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop'} 
                alt={event.title || 'Event Poster'} 
                className="detail-poster-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop';
                }}
              />
              <span className="detail-poster-tag" style={{ backgroundColor: event.badgeColor || '#8B5CF6' }}>
                {event.tag || event.category || 'CAMPUS EVENT'}
              </span>
            </div>

            {/* Right Column: Title, Category, Info Grid */}
            <div className="detail-hero-info">
              <div className="detail-category-row">
                <span className="eyebrow-tag"><Sparkles size={14} /> OFFICIAL CAMPUS FEST</span>
                <span className="event-category-badge" style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--strong-lavender)', border: '1px solid var(--border-card)' }}>
                  {event.category || 'Technical'}
                </span>
              </div>

              <h1 className="detail-event-title">{event.title}</h1>
              <p className="detail-short-desc">{event.description ? event.description.substring(0, 140) + '...' : 'Join fellow students for this high-energy university festival.'}</p>

              <div className="detail-organizer-pill">
                <GraduationCap size={16} color="#8B5CF6" />
                <span>Hosted by <strong>{event.college}</strong></span>
              </div>

              <div className="detail-meta-cards">
                <div className="meta-card">
                  <Calendar size={18} className="meta-card-icon" />
                  <div>
                    <span className="meta-card-label">Dates</span>
                    <span className="meta-card-value">{event.date}</span>
                  </div>
                </div>
                
                <div className="meta-card">
                  <Clock size={18} className="meta-card-icon" />
                  <div>
                    <span className="meta-card-label">Timings</span>
                    <span className="meta-card-value">{event.time}</span>
                  </div>
                </div>

                <div className="meta-card">
                  <MapPin size={18} className="meta-card-icon" />
                  <div>
                    <span className="meta-card-label">Venue</span>
                    <span className="meta-card-value">{event.venue || event.location || 'Main Campus'}</span>
                  </div>
                </div>

                <div className="meta-card">
                  <Award size={18} className="meta-card-icon" />
                  <div>
                    <span className="meta-card-label">Prizes</span>
                    <span className="meta-card-value">{event.prizes || 'Certificates & Trophies'}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="section-container detail-main-layout">
        
        {/* Left Column */}
        <div className="detail-body-col">
          
          <div className="detail-block-card">
            <h2 className="block-title">About the Event</h2>
            <p className="block-text">{event.description}</p>

            <div className="eligibility-box">
              <ShieldCheck size={20} className="shield-icon" />
              <div>
                <h4>Eligibility & Requirements</h4>
                <p>{event.eligibility}</p>
              </div>
            </div>
          </div>

          {event.rules && (
            <div className="detail-block-card">
              <h2 className="block-title">Rules & Participation Guidelines</h2>
              <ul className="rules-list">
                {Array.isArray(event.rules) ? (
                  event.rules.map((rule, idx) => (
                    <li key={idx}>
                      <CheckCircle2 size={16} className="rule-check-icon" />
                      <span>{rule}</span>
                    </li>
                  ))
                ) : (
                  <li>
                    <CheckCircle2 size={16} className="rule-check-icon" />
                    <span>{event.rules}</span>
                  </li>
                )}
              </ul>
            </div>
          )}

        </div>

        {/* Right Sidebar: Registration Box */}
        <div className="detail-sidebar-col">
          <div className="sidebar-sticky-card">
            <span className="sidebar-price-tag">{event.price}</span>
            <div className="sidebar-attendees-pill">
              <Users size={14} />
              <span>{event.attendees}</span>
            </div>

            {regError && !showRegModal && (
              <div className="auth-alert error" style={{ marginBottom: '16px' }} role="alert">
                <AlertCircle size={16} />
                <span>{regError}</span>
              </div>
            )}

            {isAlreadyRegistered ? (
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px', padding: '16px', textCenter: 'center', marginBottom: '16px' }}>
                <CheckCircle2 size={28} color="#22C55E" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                <h4 style={{ color: '#22C55E', fontSize: '1.1rem', margin: '0 0 4px 0', textAlign: 'center' }}>You are Registered!</h4>
                {(existingReg?.ticket_code || regSuccess?.ticket?.ticket_code) && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', margin: '0 0 12px 0' }}>
                    Ticket Code: <strong>{existingReg?.ticket_code || regSuccess?.ticket?.ticket_code}</strong>
                  </p>
                )}
                <button
                  onClick={() => navigate('/tickets')}
                  className="register-now-cta"
                  style={{ background: '#22C55E', border: 'none' }}
                >
                  <Ticket size={18} />
                  <span>View My Ticket</span>
                </button>
              </div>
            ) : (
              <button
                className="register-now-cta"
                onClick={handleOpenModal}
                disabled={checkingReg}
              >
                {checkingReg ? (
                  <>
                    <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Checking Status...</span>
                  </>
                ) : isAuthenticated ? (
                  <>
                    <Ticket size={18} />
                    <span>Register for Event</span>
                  </>
                ) : (
                  <>
                    <Ticket size={18} />
                    <span>Sign in to Register</span>
                  </>
                )}
              </button>
            )}

            <p className="sidebar-note">
              Instant QR pass generated after registration. Validated at campus gates.
            </p>

            <div className="sidebar-share-row">
              <button className="share-btn" onClick={() => toggleSaveEvent(event.id)}>
                <Heart size={15} fill={isSaved ? '#EF4444' : 'transparent'} color={isSaved ? '#EF4444' : 'currentColor'} />
                <span>{isSaved ? 'Saved' : 'Save Event'}</span>
              </button>
              <button className="share-btn" onClick={handleShare}>
                <Share2 size={15} />
                <span>{copiedMsg ? 'Link Copied!' : 'Share Event'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Registration Confirmation Modal */}
      {showRegModal && (
        <div className="ticket-modal-backdrop" onClick={() => !isRegistering && setShowRegModal(false)}>
          <div className="ticket-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', padding: '24px' }}>
            <button 
              className="modal-close-btn" 
              onClick={() => !isRegistering && setShowRegModal(false)}
              disabled={isRegistering}
            >
              <X size={20} />
            </button>

            {regSuccess ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <CheckCircle2 size={48} color="#22C55E" style={{ margin: '0 auto 16px auto' }} />
                <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#22C55E' }}>REGISTRATION CONFIRMED!</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  Your pass for <strong>{event.title}</strong> has been created and sent to your email.
                </p>
                <div style={{ background: 'var(--surface-card)', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid var(--border-card)' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Ticket Code</p>
                  <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px', color: '#8B5CF6' }}>
                    {regSuccess.ticket?.ticket_code || 'CONFIRMED PASS'}
                  </p>
                </div>
                <button
                  className="auth-btn-primary"
                  onClick={() => navigate('/tickets')}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Ticket size={18} />
                  <span>View My Ticket</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmRegistration}>
                <div style={{ marginBottom: '20px' }}>
                  <span className="eyebrow-tag" style={{ fontSize: '0.75rem' }}>EVENT REGISTRATION</span>
                  <h2 style={{ fontSize: '1.35rem', marginTop: '6px', marginBottom: '4px' }}>Event Registration Form</h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Please review and fill in your details to register for <strong>{event.title}</strong>.
                  </p>
                </div>

                {regError && (
                  <div className="auth-alert error" style={{ marginBottom: '16px' }} role="alert">
                    <AlertCircle size={16} />
                    <span>{regError}</span>
                  </div>
                )}

                <div className="auth-form" style={{ gap: '14px' }}>
                  <div className="form-group">
                    <label htmlFor="reg-name">Full Name *</label>
                    <div className="input-wrapper">
                      <User size={16} className="input-icon" />
                      <input
                        id="reg-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="reg-email">Email Address *</label>
                    <div className="input-wrapper disabled">
                      <Mail size={16} className="input-icon" />
                      <input
                        id="reg-email"
                        type="email"
                        value={formData.email}
                        disabled
                        title="Registered email address cannot be changed"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="reg-college">College / University *</label>
                    <div className="input-wrapper">
                      <GraduationCap size={16} className="input-icon" />
                      <input
                        id="reg-college"
                        type="text"
                        placeholder="e.g. IIIT Hyderabad"
                        value={formData.college}
                        onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="reg-phone">Phone Number *</label>
                    <div className="input-wrapper">
                      <Phone size={16} className="input-icon" />
                      <input
                        id="reg-phone"
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* TEAM REGISTRATION SECTION */}
                  {isTeamEvent && (
                    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-card)', padding: '16px', borderRadius: '12px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', color: '#8B5CF6' }}>Team Settings</h4>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', padding: '3px 8px', borderRadius: '6px' }}>
                          Team Size: {minTeam} – {maxTeam} members
                        </span>
                      </div>

                      <div className="form-group" style={{ marginBottom: '14px' }}>
                        <label htmlFor="reg-team-name">Team Name *</label>
                        <div className="input-wrapper">
                          <Users size={16} className="input-icon" />
                          <input
                            id="reg-team-name"
                            type="text"
                            placeholder="Enter your team name"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            required={isTeamEvent}
                          />
                        </div>
                      </div>

                      <div style={{ marginTop: '14px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                          Team Leader
                        </label>
                        <div style={{ padding: '8px 12px', background: 'var(--surface-hover)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span><strong>{formData.fullName || user?.name}</strong> ({formData.email})</span>
                          <span style={{ fontSize: '0.7rem', background: '#22C55E', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>Leader</span>
                        </div>
                      </div>

                      {/* Additional Team Members */}
                      <div style={{ marginTop: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                            Additional Team Members ({teamMembers.length} added)
                          </label>
                          {1 + teamMembers.length < maxTeam && (
                            <button
                              type="button"
                              onClick={handleAddTeamMember}
                              style={{ background: 'rgba(139, 92, 246, 0.15)', border: 'none', color: '#8B5CF6', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600' }}
                            >
                              + Add Team Member
                            </button>
                          )}
                        </div>

                        {teamMembers.map((member, mIdx) => (
                          <div key={mIdx} style={{ background: 'var(--surface-card)', border: '1px dashed var(--border-card)', padding: '12px', borderRadius: '8px', marginBottom: '10px', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Member {mIdx + 2}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTeamMember(mIdx)}
                                style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '0.75rem', cursor: 'pointer' }}
                              >
                                Remove
                              </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              <input
                                type="text"
                                placeholder="Member Full Name *"
                                value={member.name}
                                onChange={(e) => handleMemberChange(mIdx, 'name', e.target.value)}
                                style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-card)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                                required
                              />
                              <input
                                type="email"
                                placeholder="Member Email *"
                                value={member.email}
                                onChange={(e) => handleMemberChange(mIdx, 'email', e.target.value)}
                                style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-card)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                                required
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CUSTOM REGISTRATION FIELDS SECTION */}
                  {event?.custom_fields && event.custom_fields.length > 0 && (
                    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-card)', padding: '16px', borderRadius: '12px', marginTop: '8px', marginBottom: '8px' }}>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#8B5CF6' }}>Additional Event Details</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {event.custom_fields.map((f) => {
                          const fieldId = f.id;
                          const fieldType = (f.field_type || f.type || 'text').toLowerCase();
                          const isReq = Boolean(f.is_required);
                          const opts = f.options || (f.options_json ? JSON.parse(f.options_json) : []);

                          return (
                            <div key={fieldId} className="form-group" style={{ margin: 0 }}>
                              <label htmlFor={`cf-${fieldId}`} style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                                {f.field_label} {isReq && <span style={{ color: '#EF4444' }}>*</span>}
                              </label>

                              {fieldType === 'textarea' || fieldType === 'long text' ? (
                                <textarea
                                  id={`cf-${fieldId}`}
                                  placeholder={f.placeholder || `Enter ${f.field_label}`}
                                  value={customAnswers[fieldId] || ''}
                                  onChange={(e) => setCustomAnswers({ ...customAnswers, [fieldId]: e.target.value })}
                                  rows={3}
                                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-card)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                                  required={isReq}
                                />
                              ) : fieldType === 'select' || fieldType === 'dropdown' ? (
                                <select
                                  id={`cf-${fieldId}`}
                                  value={customAnswers[fieldId] || ''}
                                  onChange={(e) => setCustomAnswers({ ...customAnswers, [fieldId]: e.target.value })}
                                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-card)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                                  required={isReq}
                                >
                                  <option value="">-- Select {f.field_label} --</option>
                                  {opts.map((opt, oIdx) => (
                                    <option key={oIdx} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : fieldType === 'radio' ? (
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
                                  {opts.map((opt, oIdx) => (
                                    <label key={oIdx} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                      <input
                                        type="radio"
                                        name={`radio-${fieldId}`}
                                        value={opt}
                                        checked={customAnswers[fieldId] === opt}
                                        onChange={(e) => setCustomAnswers({ ...customAnswers, [fieldId]: e.target.value })}
                                        required={isReq && !customAnswers[fieldId]}
                                      />
                                      <span>{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              ) : fieldType === 'checkbox' ? (
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
                                  {(opts.length > 0 ? opts : [f.field_label]).map((opt, oIdx) => (
                                    <label key={oIdx} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                      <input
                                        type="checkbox"
                                        value={opt}
                                        checked={Array.isArray(customAnswers[fieldId]) ? customAnswers[fieldId].includes(opt) : customAnswers[fieldId] === opt}
                                        onChange={(e) => {
                                          const checked = e.target.checked;
                                          let current = Array.isArray(customAnswers[fieldId]) ? [...customAnswers[fieldId]] : (customAnswers[fieldId] ? [customAnswers[fieldId]] : []);
                                          if (checked) current.push(opt);
                                          else current = current.filter(x => x !== opt);
                                          setCustomAnswers({ ...customAnswers, [fieldId]: current.join(', ') });
                                        }}
                                      />
                                      <span>{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              ) : (
                                <input
                                  id={`cf-${fieldId}`}
                                  type={fieldType === 'number' ? 'number' : fieldType === 'email' ? 'email' : fieldType === 'phone' ? 'tel' : fieldType === 'date' ? 'date' : 'text'}
                                  placeholder={f.placeholder || `Enter ${f.field_label}`}
                                  value={customAnswers[fieldId] || ''}
                                  onChange={(e) => setCustomAnswers({ ...customAnswers, [fieldId]: e.target.value })}
                                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-card)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                                  required={isReq}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button
                    type="button"
                    className="modal-action-btn secondary"
                    onClick={() => setShowRegModal(false)}
                    disabled={isRegistering}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="auth-btn-primary"
                    disabled={isRegistering}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    {isRegistering ? (
                      <>
                        <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Complete Registration</span>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default EventDetailPage;
