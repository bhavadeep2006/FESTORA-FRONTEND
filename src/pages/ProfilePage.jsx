import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { userProfile as defaultUserProfile } from '../data/mockData';
import { User, Mail, Phone, GraduationCap, Calendar, BookOpen, MapPin, Edit3, ShieldCheck, Ticket, Sun, Moon, Laptop } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

export const ProfilePage = () => {
  const { user, updateUserProfile, userTickets, hostedEvents } = useAuth();
  const currentProfile = {
    ...defaultUserProfile,
    ...user,
    avatar: user?.avatar || defaultUserProfile.avatar
  };
  const profile = currentProfile;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(currentProfile);

  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('festora-theme') || 'light';
  });

  const changeThemeMode = (mode) => {
    setThemeMode(mode);
    try {
      localStorage.setItem('festora-theme', mode);
    } catch (e) {}
    let targetTheme = mode;
    if (mode === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      targetTheme = systemDark ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', targetTheme);
    window.dispatchEvent(new CustomEvent('festora-theme-change', { detail: mode }));
  };

  React.useEffect(() => {
    const handleCustomEvent = (e) => {
      if (e.detail) {
        setThemeMode(e.detail);
      }
    };
    window.addEventListener('festora-theme-change', handleCustomEvent);
    return () => window.removeEventListener('festora-theme-change', handleCustomEvent);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateUserProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="profile-page-view">
      <div className="section-container profile-container">
        
        {/* Profile Card Header */}
        <motion.div 
          className="profile-header-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="profile-avatar-wrapper">
            <img src={profile.avatar} alt={profile.name} className="profile-avatar-img" />
            <span className="profile-verified-badge" title="Verified Student">
              <ShieldCheck size={16} />
            </span>
          </div>

          <div className="profile-header-info">
            <div className="profile-name-row">
              <h1 className="profile-user-name">{profile.name}</h1>
              <span className="profile-role-pill">Verified Student Passholder</span>
            </div>

            <p className="profile-user-bio">{profile.bio}</p>

            <div className="profile-quick-tags">
              <span className="quick-tag"><GraduationCap size={14} /> {profile.college}</span>
              <span className="quick-tag"><MapPin size={14} /> {profile.city}</span>
            </div>
          </div>

          <button 
            className="edit-profile-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit3 size={16} />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
        </motion.div>

        {/* Profile Statistics Summary */}
        <div className="dashboard-stats-grid" style={{ marginBottom: '32px' }}>
          <div className="dash-stat-card">
            <div className="stat-icon-wrapper purple">
              <Ticket size={20} />
            </div>
            <div>
              <span className="dash-stat-num">{userTickets?.length || 4}</span>
              <span className="dash-stat-label">Registered Events</span>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="stat-icon-wrapper green">
              <Calendar size={20} />
            </div>
            <div>
              <span className="dash-stat-num">{userTickets?.filter(t => t.status !== 'PAST').length || 3}</span>
              <span className="dash-stat-label">Upcoming Events</span>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="stat-icon-wrapper blue">
              <GraduationCap size={20} />
            </div>
            <div>
              <span className="dash-stat-num">{hostedEvents?.length || 2}</span>
              <span className="dash-stat-label">Hosted Events</span>
            </div>
          </div>
        </div>

        {/* Edit Form Modal or View Card Grid */}
        {isEditing ? (
          <motion.form 
            className="profile-edit-card"
            onSubmit={handleSave}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="card-section-title">Edit Student Information</h2>

            <div className="edit-form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                />
              </div>

              <div className="form-group">
                <label>College / University</label>
                <input 
                  type="text" 
                  name="college" 
                  value={formData.college} 
                  onChange={handleInputChange} 
                />
              </div>

              <div className="form-group">
                <label>Year of Study</label>
                <input 
                  type="text" 
                  name="year" 
                  value={formData.year} 
                  onChange={handleInputChange} 
                />
              </div>

              <div className="form-group">
                <label>Branch / Department</label>
                <input 
                  type="text" 
                  name="branch" 
                  value={formData.branch} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-changes-btn">Save Profile Changes</button>
            </div>
          </motion.form>
        ) : (
          <motion.div 
            className="profile-details-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Student Details Card */}
            <div className="details-card">
              <h2 className="card-section-title">Academic & Campus Info</h2>

              <div className="info-rows-list">
                <div className="info-row-item">
                  <div className="info-icon-circle"><GraduationCap size={18} /></div>
                  <div className="info-text">
                    <span className="info-label">College / University</span>
                    <span className="info-value">{profile.college}</span>
                  </div>
                </div>

                <div className="info-row-item">
                  <div className="info-icon-circle"><Calendar size={18} /></div>
                  <div className="info-text">
                    <span className="info-label">Year of Study</span>
                    <span className="info-value">{profile.year}</span>
                  </div>
                </div>

                <div className="info-row-item">
                  <div className="info-icon-circle"><BookOpen size={18} /></div>
                  <div className="info-text">
                    <span className="info-label">Branch / Department</span>
                    <span className="info-value">{profile.branch}</span>
                  </div>
                </div>

                <div className="info-row-item">
                  <div className="info-icon-circle"><MapPin size={18} /></div>
                  <div className="info-text">
                    <span className="info-label">City</span>
                    <span className="info-value">{profile.city}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Details Card */}
            <div className="details-card">
              <h2 className="card-section-title">Contact & Account Details</h2>

              <div className="info-rows-list">
                <div className="info-row-item">
                  <div className="info-icon-circle"><Mail size={18} /></div>
                  <div className="info-text">
                    <span className="info-label">Email Address</span>
                    <span className="info-value">{profile.email}</span>
                  </div>
                </div>

                <div className="info-row-item">
                  <div className="info-icon-circle"><Phone size={18} /></div>
                  <div className="info-text">
                    <span className="info-label">Phone Number</span>
                    <span className="info-value">{profile.phone}</span>
                  </div>
                </div>

                <div className="info-row-item">
                  <div className="info-icon-circle"><ShieldCheck size={18} /></div>
                  <div className="info-text">
                    <span className="info-label">Pass Verification Status</span>
                    <span className="info-value status-active">ACTIVE STUDENT ID</span>
                  </div>
                </div>
              </div>

              <div className="profile-tickets-shortcut">
                <Link to="/tickets" className="shortcut-btn">
                  <Ticket size={16} />
                  <span>View My Registered Tickets</span>
                </Link>
              </div>
            </div>

            {/* Appearance & Theme Settings Card */}
            <div className="details-card" style={{ gridColumn: '1 / -1' }}>
              <h2 className="card-section-title">Appearance & Portal Theme</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Customize your Festora visual mode across light, dark, or system defaults.
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => changeThemeMode('light')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    border: themeMode === 'light' ? '2px solid #8B5CF6' : '1px solid var(--border-card)',
                    background: themeMode === 'light' ? 'rgba(139, 92, 246, 0.15)' : 'var(--surface-secondary)',
                    color: themeMode === 'light' ? '#8B5CF6' : 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Sun size={18} />
                  <span>☀ Light</span>
                </button>

                <button
                  type="button"
                  onClick={() => changeThemeMode('dark')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    border: themeMode === 'dark' ? '2px solid #8B5CF6' : '1px solid var(--border-card)',
                    background: themeMode === 'dark' ? 'rgba(139, 92, 246, 0.15)' : 'var(--surface-secondary)',
                    color: themeMode === 'dark' ? '#8B5CF6' : 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Moon size={18} />
                  <span>🌙 Dark</span>
                </button>

                <button
                  type="button"
                  onClick={() => changeThemeMode('system')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    border: themeMode === 'system' ? '2px solid #8B5CF6' : '1px solid var(--border-card)',
                    background: themeMode === 'system' ? 'rgba(139, 92, 246, 0.15)' : 'var(--surface-secondary)',
                    color: themeMode === 'system' ? '#8B5CF6' : 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Laptop size={18} />
                  <span>💻 System</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default ProfilePage;
