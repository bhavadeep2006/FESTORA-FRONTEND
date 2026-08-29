import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FestoraLogo } from '../components/FestoraLogo/FestoraLogo';
import { EventCard } from '../components/EventCard/EventCard';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  PlusCircle, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Save, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Globe, 
  MapPin, 
  Award, 
  School 
} from 'lucide-react';
import './OrganizerDashboard.css';

export const OrganizerDashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { organizerUser, organizerLogout, hostedEvents, addHostedEvent, updateOrganizerProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'events' | 'create' | 'registrations' | 'settings'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Filter & Search states for Registrations table
  const [regSearch, setRegSearch] = useState('');
  const [regFilterEvent, setRegFilterEvent] = useState('All');
  const [regFilterStatus, setRegFilterStatus] = useState('All');

  // Create Event Form state inside Organizer Portal
  const [createStep, setCreateStep] = useState('form'); // 'form' | 'preview'
  const [eventFormData, setEventFormData] = useState({
    title: '',
    category: 'Technical',
    description: '',
    banner: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop',
    college: organizerUser?.college || 'IIIT Hyderabad',
    venue: 'Auditorium Block A',
    city: 'Hyderabad',
    date: 'Sep 12 - 13, 2026',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    price: 'Free Pass',
    maxParticipants: '300',
    contactEmail: organizerUser?.email || 'organizer@festora.demo',
    contactPhone: organizerUser?.phone || '+91 98765 12345',
    prizePool: '₹ 75,000 Cash Pool',
    eligibility: 'Open to all college students.',
    rules: 'Strict attendance rules apply.'
  });
  const [createMsg, setCreateMsg] = useState('');

  // Organizer Profile Settings State
  const [profileForm, setProfileForm] = useState({
    name: organizerUser?.name || 'Siddharth Rao',
    organization: organizerUser?.organization || 'IIIT Cultural Council',
    email: organizerUser?.email || 'organizer@festora.demo',
    phone: organizerUser?.phone || '+91 98765 12345',
    college: organizerUser?.college || 'IIIT Hyderabad'
  });
  const [settingsMsg, setSettingsMsg] = useState('');

  const handleLogout = () => {
    organizerLogout();
    navigate('/organizer-login');
  };

  // Demo Registrations dataset
  const demoRegistrations = [
    { id: 'REG-8801', event: 'Hack-Versify 2026', participant: 'Rahul Sharma', college: 'CBIT Hyderabad', email: 'rahul@cbit.ac.in', date: '05 Sep 2026', status: 'Confirmed' },
    { id: 'REG-8802', event: 'Hack-Versify 2026', participant: 'Ananya Reddy', college: 'IIIT Hyderabad', email: 'ananya@iiit.ac.in', date: '05 Sep 2026', status: 'Confirmed' },
    { id: 'REG-8803', event: 'Cultural Night Fest', participant: 'Vikram Verma', college: 'Vasavi College', email: 'vikram@vasavi.edu', date: '04 Sep 2026', status: 'Confirmed' },
    { id: 'REG-8804', event: 'RoboWars Heavyweight', participant: 'Sneha Patel', college: 'VNR VJIET', email: 'sneha@vnrvjiet.in', date: '03 Sep 2026', status: 'Pending' },
    { id: 'REG-8805', event: 'Hack-Versify 2026', participant: 'Karthik Raja', college: 'JNTU Hyderabad', email: 'karthik@jntuh.ac.in', date: '02 Sep 2026', status: 'Confirmed' },
    { id: 'REG-8806', event: 'Esports Valorant Cup', participant: 'Sameer Khan', college: 'Osmania University', email: 'sameer@osmania.ac.in', date: '01 Sep 2026', status: 'Confirmed' },
  ];

  const filteredRegistrations = demoRegistrations.filter(r => {
    const matchesSearch = !regSearch || r.participant.toLowerCase().includes(regSearch.toLowerCase()) || r.email.toLowerCase().includes(regSearch.toLowerCase()) || r.college.toLowerCase().includes(regSearch.toLowerCase());
    const matchesEvent = regFilterEvent === 'All' || r.event === regFilterEvent;
    const matchesStatus = regFilterStatus === 'All' || r.status === regFilterStatus;
    return matchesSearch && matchesEvent && matchesStatus;
  });

  const handleCreateSubmit = (statusType = 'Published') => {
    const newEvt = {
      id: `org-evt-${Date.now()}`,
      title: eventFormData.title || 'Untitled Organizer Event',
      category: eventFormData.category,
      status: statusType,
      registrationsCount: 0,
      date: eventFormData.date,
      location: `${eventFormData.college}, ${eventFormData.city}`,
      banner: eventFormData.banner
    };
    addHostedEvent(newEvt);
    setCreateMsg(`✓ Event ${statusType === 'Published' ? 'Published' : 'Saved as Draft'} successfully!`);
    setTimeout(() => {
      setCreateMsg('');
      setActiveTab('events');
    }, 900);
  };

  const handleSettingsSave = (e) => {
    e.preventDefault();
    updateOrganizerProfile(profileForm);
    setSettingsMsg('✓ Profile settings updated successfully!');
    setTimeout(() => setSettingsMsg(''), 2000);
  };

  const previewData = {
    id: 'preview-org-event',
    title: eventFormData.title || 'Event Title Preview',
    college: eventFormData.college,
    location: `${eventFormData.venue}, ${eventFormData.city}`,
    date: eventFormData.date,
    time: `${eventFormData.startTime} - ${eventFormData.endTime}`,
    category: eventFormData.category,
    attendees: `${eventFormData.maxParticipants} Limit`,
    tag: 'Organizer Featured',
    price: eventFormData.price,
    badgeColor: '#8B5CF6',
    banner: eventFormData.banner,
    description: eventFormData.description || 'Description preview...',
    organizers: organizerUser?.organization || 'College Council'
  };

  const exportEventDetails = (event) => {
    const data = {
      EventName: event.title,
      Category: event.category,
      Status: event.status,
      Date: event.date,
      Location: event.location,
      RegistrationsCount: event.registrationsCount || 0,
      College: organizerUser?.college || 'IIIT Hyderabad',
      ContactEmail: organizerUser?.email || 'organizer@festora.demo',
      ExportDate: new Date().toISOString()
    };
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `${event.title.replace(/\s+/g, '_')}_Details.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportRegistrations = () => {
    const headers = ["Reg ID", "Event", "Participant Name", "College", "Email", "Date", "Status"];
    const rows = filteredRegistrations.map(r => [
      r.id,
      `"${r.event}"`,
      `"${r.participant}"`,
      `"${r.college}"`,
      r.email,
      r.date,
      r.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", encodedUri);
    downloadAnchor.setAttribute("download", `Festora_Registrations_Export.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="org-dashboard-layout">
      
      {/* Mobile Top App Bar */}
      <div className="org-mobile-header">
        <div className="org-brand-title">
          <FestoraLogo size={28} isAnimated={false} />
          <span>FESTORA ORGANIZER</span>
        </div>
        <button 
          className="org-menu-toggle"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          aria-label="Toggle Navigation Drawer"
        >
          {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`org-sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
        <div className="org-sidebar-header">
          <FestoraLogo size={34} isAnimated={false} />
          <div>
            <span className="org-sidebar-brand">FESTORA</span>
            <span className="org-portal-tag">ORGANIZER PORTAL</span>
          </div>
        </div>

        <nav className="org-nav-menu">
          <button 
            className={`org-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('overview'); setMobileSidebarOpen(false); }}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>

          <button 
            className={`org-nav-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => { setActiveTab('events'); setMobileSidebarOpen(false); }}
          >
            <Calendar size={18} />
            <span>My Events</span>
          </button>

          <button 
            className={`org-nav-btn ${activeTab === 'registrations' ? 'active' : ''}`}
            onClick={() => { setActiveTab('registrations'); setMobileSidebarOpen(false); }}
          >
            <Users size={18} />
            <span>Registrations</span>
          </button>

          <button 
            className={`org-nav-btn ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => { setActiveTab('create'); setMobileSidebarOpen(false); }}
          >
            <PlusCircle size={18} />
            <span>Create Event</span>
          </button>

          <button 
            className={`org-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('settings'); setMobileSidebarOpen(false); }}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="org-sidebar-footer">
          <div className="org-user-pill">
            <img src={organizerUser?.avatar} alt={organizerUser?.name} className="org-avatar-img" />
            <div className="org-user-info">
              <span className="org-user-name">{organizerUser?.name || 'Organizer'}</span>
              <span className="org-user-org">{organizerUser?.organization || 'IIIT Council'}</span>
            </div>
          </div>
          <button className="org-logout-btn" onClick={handleLogout} title="Logout of Organizer Portal">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Body */}
      <main className="org-main-content">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="org-page-header">
              <div>
                <span className="eyebrow-tag"><ShieldCheck size={14} /> PRIVATE ORGANIZER DASHBOARD</span>
                <h1 className="org-page-title">Welcome back, {organizerUser?.name}</h1>
                <p className="org-page-subtitle">Here is the real-time summary of your hosted campus events and student registrations.</p>
              </div>
              <button className="create-event-btn" onClick={() => setActiveTab('create')}>
                <PlusCircle size={18} />
                <span>Create New Event</span>
              </button>
            </div>

            {/* Overview Summary Cards */}
            <div className="dashboard-stats-grid">
              <div className="dash-stat-card">
                <div className="stat-icon-wrapper purple"><FileText size={20} /></div>
                <div>
                  <span className="dash-stat-num">8</span>
                  <span className="dash-stat-label">Total Events</span>
                </div>
              </div>

              <div className="dash-stat-card">
                <div className="stat-icon-wrapper green"><CheckCircle2 size={20} /></div>
                <div>
                  <span className="dash-stat-num">6</span>
                  <span className="dash-stat-label">Published Fests</span>
                </div>
              </div>

              <div className="dash-stat-card">
                <div className="stat-icon-wrapper amber"><Clock size={20} /></div>
                <div>
                  <span className="dash-stat-num">3</span>
                  <span className="dash-stat-label">Upcoming Fests</span>
                </div>
              </div>

              <div className="dash-stat-card">
                <div className="stat-icon-wrapper blue"><Users size={20} /></div>
                <div>
                  <span className="dash-stat-num">1,248</span>
                  <span className="dash-stat-label">Total Registrations</span>
                </div>
              </div>
            </div>

            {/* Recent Registrations Quick Table Preview */}
            <div className="org-card-box" style={{ marginTop: '32px' }}>
              <div className="org-card-title-row">
                <h3>Recent Student Registrations</h3>
                <button className="dash-action-btn primary" onClick={() => setActiveTab('registrations')}>
                  <span>View All ({demoRegistrations.length})</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="org-table-wrapper">
                <table className="org-table">
                  <thead>
                    <tr>
                      <th>EVENT</th>
                      <th>PARTICIPANT</th>
                      <th>COLLEGE</th>
                      <th>EMAIL</th>
                      <th>DATE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoRegistrations.slice(0, 4).map(r => (
                      <tr key={r.id}>
                        <td><strong>{r.event}</strong></td>
                        <td>{r.participant}</td>
                        <td>{r.college}</td>
                        <td>{r.email}</td>
                        <td>{r.date}</td>
                        <td><span className="status-tag confirmed">{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* MY EVENTS TAB */}
        {activeTab === 'events' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="org-page-header">
              <div>
                <span className="eyebrow-tag"><Calendar size={14} /> MY HOSTED EVENTS</span>
                <h1 className="org-page-title">Manage Festora Events</h1>
                <p className="org-page-subtitle">View, edit, export, or check live student registration counts for your published events.</p>
              </div>
              <button className="create-event-btn" onClick={() => setActiveTab('create')}>
                <PlusCircle size={18} />
                <span>Create New Event</span>
              </button>
            </div>

            <div className="org-card-box">
              <div className="org-table-wrapper">
                <table className="org-table">
                  <thead>
                    <tr>
                      <th>EVENT NAME</th>
                      <th>CATEGORY</th>
                      <th>DATE</th>
                      <th>VENUE</th>
                      <th>STATUS</th>
                      <th>REGISTRATIONS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hostedEvents.map(evt => (
                      <tr key={evt.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src={evt.banner} alt={evt.title} style={{ width: '40px', height: '30px', borderRadius: '4px', objectFit: 'cover' }} />
                            <strong>{evt.title}</strong>
                          </div>
                        </td>
                        <td><span className="dash-cat-label">{evt.category}</span></td>
                        <td>{evt.date}</td>
                        <td>{evt.location}</td>
                        <td>
                          <span className={`status-tag ${evt.status.toLowerCase()}`}>{evt.status}</span>
                        </td>
                        <td><strong>{evt.registrationsCount || 0}</strong></td>
                        <td>
                          <div className="dash-event-actions" style={{ flexWrap: 'wrap', gap: '6px' }}>
                            <button className="dash-action-btn" onClick={() => setActiveTab('create')}>
                              <Edit3 size={14} />
                              <span>Edit</span>
                            </button>
                            <button className="dash-action-btn" onClick={() => exportEventDetails(evt)}>
                              <FileText size={14} />
                              <span>Export</span>
                            </button>
                            <button className="dash-action-btn primary" onClick={() => navigate(`/organizer/events/${evt.id || 'felicity-2026'}`)}>
                              <Eye size={14} />
                              <span>Manage Event</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* CREATE EVENT TAB */}
        {activeTab === 'create' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="org-page-header">
              <div>
                <span className="eyebrow-tag"><PlusCircle size={14} /> PRIVATE ORGANIZER CREATOR</span>
                <h1 className="org-page-title">Create & Publish Event</h1>
                <p className="org-page-subtitle">Add a new fest or hackathon to Festora and open student registrations.</p>
              </div>

              <div className="host-tab-toggles">
                <button className={`tab-toggle-btn ${createStep === 'form' ? 'active' : ''}`} onClick={() => setCreateStep('form')}>
                  <FileText size={16} />
                  <span>Event Details</span>
                </button>
                <button className={`tab-toggle-btn ${createStep === 'preview' ? 'active' : ''}`} onClick={() => setCreateStep('preview')}>
                  <Eye size={16} />
                  <span>Card Preview</span>
                </button>
              </div>
            </div>

            {createMsg && (
              <div className="auth-alert success" style={{ marginBottom: '20px' }}>
                <CheckCircle2 size={18} />
                <span>{createMsg}</span>
              </div>
            )}

            {createStep === 'form' ? (
              <form className="host-form-card" onSubmit={(e) => { e.preventDefault(); handleCreateSubmit('Published'); }}>
                <div className="host-form-grid">
                  <div className="form-group full-width">
                    <label>Event Name *</label>
                    <input type="text" placeholder="e.g. Hack-Versify 2026" value={eventFormData.title} onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })} required />
                  </div>

                  {/* Event Poster Upload */}
                  <div className="form-group full-width">
                    <label>Event Poster *</label>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                      Upload a poster or cover image for your event (JPG, PNG, or WEBP).
                    </span>

                    {eventFormData.banner ? (
                      <div className="poster-preview-wrapper" style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-card)', maxWidth: '400px' }}>
                        <img src={eventFormData.banner} alt="Event Poster Preview" style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                        <div style={{ padding: '10px', background: 'var(--surface-secondary)', display: 'flex', gap: '8px' }}>
                          <label className="dash-action-btn" style={{ cursor: 'pointer', margin: 0 }}>
                            <span>Change Image</span>
                            <input 
                              type="file" 
                              accept="image/jpeg,image/png,image/webp" 
                              style={{ display: 'none' }} 
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
                                    setCreateMsg('Please upload a JPG, PNG, or WEBP image.');
                                    return;
                                  }
                                  const url = URL.createObjectURL(file);
                                  setEventFormData({ ...eventFormData, banner: url });
                                }
                              }} 
                            />
                          </label>
                          <button 
                            type="button" 
                            className="dash-action-btn" 
                            style={{ color: '#EF4444' }} 
                            onClick={() => setEventFormData({ ...eventFormData, banner: '' })}
                          >
                            Remove Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="upload-dropzone" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', border: '2px dashed var(--border-focus)', borderRadius: 'var(--radius-md)', background: 'var(--surface-secondary)' }}>
                        <PlusCircle size={28} style={{ color: 'var(--strong-lavender)', marginBottom: '8px' }} />
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Click to upload Event Poster</span>
                        <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '4px' }}>Supports JPG, PNG, WEBP</span>
                        <input 
                          type="file" 
                          accept="image/jpeg,image/png,image/webp" 
                          style={{ display: 'none' }} 
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
                                setCreateMsg('Please upload a JPG, PNG, or WEBP image.');
                                return;
                              }
                              const url = URL.createObjectURL(file);
                              setEventFormData({ ...eventFormData, banner: url });
                            }
                          }} 
                        />
                      </label>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Category *</label>
                    <select value={eventFormData.category} onChange={(e) => setEventFormData({ ...eventFormData, category: e.target.value })}>
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

                  <div className="form-group">
                    <label>College / Organization *</label>
                    <input type="text" value={eventFormData.college} onChange={(e) => setEventFormData({ ...eventFormData, college: e.target.value })} required />
                  </div>

                  <div className="form-group">
                    <label>Venue *</label>
                    <input type="text" value={eventFormData.venue} onChange={(e) => setEventFormData({ ...eventFormData, venue: e.target.value })} required />
                  </div>

                  <div className="form-group">
                    <label>City *</label>
                    <input type="text" value={eventFormData.city} onChange={(e) => setEventFormData({ ...eventFormData, city: e.target.value })} required />
                  </div>

                  <div className="form-group">
                    <label>Date(s) *</label>
                    <input type="text" value={eventFormData.date} onChange={(e) => setEventFormData({ ...eventFormData, date: e.target.value })} required />
                  </div>

                  <div className="form-group">
                    <label>Start Time</label>
                    <input type="text" value={eventFormData.startTime} onChange={(e) => setEventFormData({ ...eventFormData, startTime: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label>End Time</label>
                    <input type="text" value={eventFormData.endTime} onChange={(e) => setEventFormData({ ...eventFormData, endTime: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label>Registration Fee</label>
                    <input type="text" value={eventFormData.price} onChange={(e) => setEventFormData({ ...eventFormData, price: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label>Maximum Participants</label>
                    <input type="text" value={eventFormData.maxParticipants} onChange={(e) => setEventFormData({ ...eventFormData, maxParticipants: e.target.value })} />
                  </div>

                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea rows={3} value={eventFormData.description} onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })} />
                  </div>
                </div>

                <div className="host-form-actions">
                  <button type="button" className="btn-secondary-draft" onClick={() => handleCreateSubmit('Draft')}>
                    <Save size={16} />
                    <span>Save Draft</span>
                  </button>
                  <button type="submit" className="btn-primary-publish">
                    <Sparkles size={16} />
                    <span>Publish Event</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="preview-container-box">
                <h3 className="preview-heading-tag">FESTORA EVENT PREVIEW</h3>
                <div style={{ maxWidth: '360px', margin: '20px auto' }}>
                  <EventCard event={previewData} />
                </div>
                <button className="btn-primary-publish" style={{ display: 'inline-flex', width: 'auto', margin: '20px auto 0 auto' }} onClick={() => handleCreateSubmit('Published')}>
                  <span>Publish Event Now</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* REGISTRATIONS TAB */}
        {activeTab === 'registrations' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="org-page-header">
              <div>
                <span className="eyebrow-tag"><Users size={14} /> STUDENT PASSES</span>
                <h1 className="org-page-title">Event Registrations</h1>
                <p className="org-page-subtitle">Track registered student passholders across your active college events.</p>
              </div>

              <button className="create-event-btn" onClick={exportRegistrations} style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-card)', color: 'var(--text-main)' }}>
                <FileText size={18} />
                <span>Export Registrations (CSV)</span>
              </button>
            </div>

            {/* Toolbar search & filters */}
            <div className="events-toolbar" style={{ marginBottom: '20px' }}>
              <div className="toolbar-search-input">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search student participant, email, college..." 
                  value={regSearch}
                  onChange={(e) => setRegSearch(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <select className="form-select" value={regFilterEvent} onChange={(e) => setRegFilterEvent(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                  <option value="All">All Events</option>
                  <option value="Hack-Versify 2026">Hack-Versify 2026</option>
                  <option value="Cultural Night Fest">Cultural Night Fest</option>
                  <option value="RoboWars Heavyweight">RoboWars Heavyweight</option>
                </select>

                <select className="form-select" value={regFilterStatus} onChange={(e) => setRegFilterStatus(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                  <option value="All">All Statuses</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="org-card-box">
              <div className="org-table-wrapper">
                <table className="org-table">
                  <thead>
                    <tr>
                      <th>REG ID</th>
                      <th>EVENT</th>
                      <th>PARTICIPANT</th>
                      <th>COLLEGE</th>
                      <th>EMAIL</th>
                      <th>DATE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.map(r => (
                      <tr key={r.id}>
                        <td><code>{r.id}</code></td>
                        <td><strong>{r.event}</strong></td>
                        <td>{r.participant}</td>
                        <td>{r.college}</td>
                        <td>{r.email}</td>
                        <td>{r.date}</td>
                        <td><span className={`status-tag ${r.status.toLowerCase()}`}>{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="org-page-header">
              <div>
                <span className="eyebrow-tag"><Settings size={14} /> PORTAL SETTINGS</span>
                <h1 className="org-page-title">Organizer Settings</h1>
                <p className="org-page-subtitle">Manage your organization profile, email notifications, and portal password.</p>
              </div>
            </div>

            {settingsMsg && (
              <div className="auth-alert success" style={{ marginBottom: '20px' }}>
                <CheckCircle2 size={18} />
                <span>{settingsMsg}</span>
              </div>
            )}

            <div className="host-form-card" style={{ maxWidth: '640px' }}>
              <form onSubmit={handleSettingsSave}>
                <div className="host-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="form-group">
                    <label>Organizer Name</label>
                    <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} required />
                  </div>

                  <div className="form-group">
                    <label>Organization / Council Name</label>
                    <input type="text" value={profileForm.organization} onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })} required />
                  </div>

                  <div className="form-group">
                    <label>College / University</label>
                    <input type="text" value={profileForm.college} onChange={(e) => setProfileForm({ ...profileForm, college: e.target.value })} required />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} required />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="text" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                  </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                  <button type="submit" className="btn-primary-publish">
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>

              <div style={{ marginTop: '36px', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Security & Password</h4>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Current Password</label>
                  <input type="password" placeholder="••••••••" defaultValue="Festora@123" />
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>New Password</label>
                  <input type="password" placeholder="Enter new password" />
                </div>
                <button type="button" className="btn-secondary-draft" onClick={() => { setSettingsMsg('✓ Password updated!'); setTimeout(() => setSettingsMsg(''), 2000); }}>
                  <span>Change Password</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </main>

    </div>
  );
};

export default OrganizerDashboardPage;
