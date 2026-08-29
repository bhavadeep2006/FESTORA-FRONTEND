import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { eventsData } from '../data/mockData';
import { FestoraLogo } from '../components/FestoraLogo/FestoraLogo';
import { 
  QrCode, 
  LayoutDashboard, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  Upload, 
  Search, 
  FileText, 
  Eye, 
  Edit3, 
  Save, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Award, 
  Clock 
} from 'lucide-react';
import './OrganizerEventManagementPage.css';

export const OrganizerEventManagementPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { organizerUser, hostedEvents } = useAuth();

  // Selected tab: Scanner MUST BE DEFAULT / FIRST
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'dashboard' | 'registered' | 'scanned' | 'edit'

  const event = hostedEvents.find(e => e.id === eventId) || eventsData.find(e => e.id === eventId) || eventsData[0];

  // Scanner state
  const [ticketInput, setTicketInput] = useState('');
  const [scanResult, setScanResult] = useState(null); // null | { type: 'success'|'duplicate'|'error', data: object }

  // Registered participants dataset
  const [registeredList, setRegisteredList] = useState([
    { id: 'FST-10293', name: 'Rahul Reddy', email: 'rahul@cbit.ac.in', phone: '+91 98765 11111', college: 'CBIT Hyderabad', year: '3rd Year', branch: 'CSE', date: '05 Sep 2026', status: 'Confirmed' },
    { id: 'FST-10294', name: 'Ananya Sharma', email: 'ananya@iiit.ac.in', phone: '+91 98765 22222', college: 'IIIT Hyderabad', year: '2nd Year', branch: 'ECE', date: '05 Sep 2026', status: 'Confirmed' },
    { id: 'FST-10295', name: 'Karthik Raja', email: 'karthik@jntuh.ac.in', phone: '+91 98765 33333', college: 'JNTU Hyderabad', year: '4th Year', branch: 'IT', date: '04 Sep 2026', status: 'Confirmed' },
    { id: 'FST-10296', name: 'Sneha Patel', email: 'sneha@vnrvjiet.in', phone: '+91 98765 44444', college: 'VNR VJIET', year: '1st Year', branch: 'AIML', date: '03 Sep 2026', status: 'Pending' },
    { id: 'FST-10297', name: 'Vikram Verma', email: 'vikram@vasavi.edu', phone: '+91 98765 55555', college: 'Vasavi College', year: '3rd Year', branch: 'EEE', date: '02 Sep 2026', status: 'Confirmed' },
  ]);

  // Scanned participants check-in state (localStorage backed)
  const [scannedList, setScannedList] = useState(() => {
    try {
      const saved = localStorage.getItem(`festora_scanned_${eventId}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'FST-10294', name: 'Ananya Sharma', college: 'IIIT Hyderabad', scanTime: '10:15 AM', status: 'Checked In' }
    ];
  });

  // Edit Event state
  const [editFormData, setEditFormData] = useState({ ...event });
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  // Filters for Registered tab
  const [regSearch, setRegSearch] = useState('');
  const [regStatusFilter, setRegStatusFilter] = useState('All');
  const [regCollegeFilter, setRegCollegeFilter] = useState('All');

  useEffect(() => {
    try {
      localStorage.setItem(`festora_scanned_${eventId}`, JSON.stringify(scannedList));
    } catch (e) {}
  }, [scannedList, eventId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Process ticket QR code scan
  const handleProcessScan = (codeToScan) => {
    const code = (codeToScan || ticketInput).trim().toUpperCase();
    if (!code) return;

    // Check if ticket exists in registered list
    const foundTicket = registeredList.find(r => r.id.toUpperCase() === code || r.name.toLowerCase().includes(code.toLowerCase()));

    if (!foundTicket) {
      // Fallback demo ticket if custom string entered
      const demoScanObj = {
        id: code.startsWith('FST-') ? code : `FST-${Math.floor(10000 + Math.random() * 90000)}`,
        name: code.startsWith('FST-') ? 'Student Participant' : code,
        college: 'CBIT Hyderabad',
        status: 'Confirmed',
        date: new Date().toLocaleDateString()
      };
      checkTicketScan(demoScanObj);
      return;
    }

    checkTicketScan(foundTicket);
  };

  const checkTicketScan = (ticket) => {
    const isAlreadyScanned = scannedList.some(s => s.id.toUpperCase() === ticket.id.toUpperCase());

    if (isAlreadyScanned) {
      const existing = scannedList.find(s => s.id.toUpperCase() === ticket.id.toUpperCase());
      setScanResult({
        type: 'duplicate',
        data: {
          ...ticket,
          firstScanTime: existing.scanTime
        }
      });
    } else {
      setScanResult({
        type: 'verified',
        data: ticket
      });
    }
  };

  const handleConfirmCheckIn = () => {
    if (!scanResult || !scanResult.data) return;

    const newScannedEntry = {
      id: scanResult.data.id,
      name: scanResult.data.name,
      college: scanResult.data.college || 'Campus College',
      scanTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Checked In'
    };

    setScannedList(prev => [newScannedEntry, ...prev]);
    setScanResult({
      type: 'checked_in_success',
      data: newScannedEntry
    });
  };

  // CSV Exporters
  const exportRegistrationsCSV = () => {
    const headers = ["Ticket ID", "Name", "Email", "Phone", "College", "Year", "Branch", "Registration Date", "Status"];
    const rows = registeredList.map(r => [
      r.id,
      `"${r.name}"`,
      r.email,
      r.phone,
      `"${r.college}"`,
      r.year,
      r.branch,
      r.date,
      r.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${event.title.replace(/\s+/g, '_')}_Registrations.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const exportScannedCSV = () => {
    const headers = ["Ticket ID", "Participant Name", "College", "Scan Time", "Status"];
    const rows = scannedList.map(s => [
      s.id,
      `"${s.name}"`,
      `"${s.college}"`,
      s.scanTime,
      s.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${event.title.replace(/\s+/g, '_')}_CheckIns.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const exportEventDetailsJSON = () => {
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(event, null, 2));
    const link = document.createElement('a');
    link.setAttribute("href", jsonStr);
    link.setAttribute("download", `${event.title.replace(/\s+/g, '_')}_EventDetails.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredRegisteredList = registeredList.filter(r => {
    const matchesSearch = !regSearch || r.name.toLowerCase().includes(regSearch.toLowerCase()) || r.email.toLowerCase().includes(regSearch.toLowerCase()) || r.id.toLowerCase().includes(regSearch.toLowerCase());
    const matchesStatus = regStatusFilter === 'All' || r.status === regStatusFilter;
    const matchesCollege = regCollegeFilter === 'All' || r.college === regCollegeFilter;
    return matchesSearch && matchesStatus && matchesCollege;
  });

  const totalRegisteredCount = registeredList.length + 100; // Demo base total
  const scannedCount = scannedList.length;
  const notCheckedInCount = totalRegisteredCount - scannedCount;
  const capacity = 2000;
  const checkInPercentage = Math.round((scannedCount / totalRegisteredCount) * 100);

  return (
    <div className="org-mgmt-layout">
      
      {/* Top Header Bar */}
      <div className="org-mgmt-top-bar">
        <div className="section-container org-mgmt-header-inner">
          <div className="org-brand-box">
            <button className="back-btn" onClick={() => navigate('/organizer')}>
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </button>
            <div className="event-title-badge">
              <span className="live-pulse-dot" />
              <h1>{event.title}</h1>
              <span className="status-tag published">{event.category}</span>
            </div>
          </div>

          <div className="org-mgmt-top-actions">
            <button className="dash-action-btn" onClick={() => setActiveTab('edit')}>
              <Edit3 size={14} />
              <span>Edit Event</span>
            </button>
            <button className="dash-action-btn primary" onClick={() => navigate(`/events/${event.id}`)}>
              <Eye size={14} />
              <span>View Public Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation Menu: Scanner MUST BE FIRST */}
      <div className="org-mgmt-nav-bar">
        <div className="section-container org-mgmt-tabs-wrapper">
          <button 
            className={`org-tab-btn ${activeTab === 'scanner' ? 'active' : ''}`}
            onClick={() => setActiveTab('scanner')}
          >
            <QrCode size={18} />
            <span>QR Scanner</span>
          </button>

          <button 
            className={`org-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button 
            className={`org-tab-btn ${activeTab === 'registered' ? 'active' : ''}`}
            onClick={() => setActiveTab('registered')}
          >
            <Users size={18} />
            <span>Registered ({totalRegisteredCount})</span>
          </button>

          <button 
            className={`org-tab-btn ${activeTab === 'scanned' ? 'active' : ''}`}
            onClick={() => setActiveTab('scanned')}
          >
            <CheckCircle2 size={18} />
            <span>Scanned ({scannedCount})</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="section-container org-mgmt-main-body">
        
        {/* TAB 1: QR SCANNER (DEFAULT FIRST SCREEN) */}
        {activeTab === 'scanner' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="scanner-tab-view">
            <div className="scanner-header text-center">
              <span className="eyebrow-tag"><QrCode size={14} /> GATE CHECK-IN SYSTEM</span>
              <h2 className="scanner-title">Scan Tickets</h2>
              <p className="scanner-subtitle">Scan a student's ticket QR code to verify their registration and mark gate entry.</p>
            </div>

            <div className="scanner-container-card">
              
              {/* Simulated Camera Viewfinder Frame */}
              <div className="camera-viewfinder-frame">
                <div className="viewfinder-corner top-left" />
                <div className="viewfinder-corner top-right" />
                <div className="viewfinder-corner bottom-left" />
                <div className="viewfinder-corner bottom-right" />
                
                <div className="scanning-laser-line" />

                <div className="viewfinder-center-content">
                  <QrCode size={48} className="qr-center-icon" />
                  <span className="viewfinder-instruction">Align QR code inside frame</span>
                </div>
              </div>

              {/* Demo QR Input Bar / Upload */}
              <div className="scanner-controls-row">
                <div className="quick-code-input-group">
                  <input 
                    type="text" 
                    placeholder="Enter Ticket ID (e.g. FST-10293)" 
                    value={ticketInput} 
                    onChange={(e) => setTicketInput(e.target.value)} 
                  />
                  <button className="scan-trigger-btn" onClick={() => handleProcessScan()}>
                    Verify Ticket Code
                  </button>
                </div>

                <div className="demo-preset-buttons">
                  <span className="preset-label">Demo Quick Scans:</span>
                  <button onClick={() => handleProcessScan('FST-10293')}>Scan Valid Pass (FST-10293)</button>
                  <button onClick={() => handleProcessScan('FST-10294')}>Scan Duplicate Pass (FST-10294)</button>
                </div>
              </div>

              {/* Scan Result Overlay Box */}
              {scanResult && (
                <motion.div 
                  className={`scan-result-card ${scanResult.type}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {scanResult.type === 'verified' && (
                    <>
                      <div className="result-status-icon verified"><CheckCircle2 size={32} /></div>
                      <h3 className="result-title green">✓ Ticket Verified</h3>
                      <div className="result-details-grid">
                        <div><span className="r-label">Passholder:</span> <strong>{scanResult.data.name}</strong></div>
                        <div><span className="r-label">College:</span> {scanResult.data.college}</div>
                        <div><span className="r-label">Ticket ID:</span> <code>{scanResult.data.id}</code></div>
                        <div><span className="r-label">Status:</span> <span className="status-tag confirmed">{scanResult.data.status}</span></div>
                      </div>
                      <button className="confirm-checkin-btn" onClick={handleConfirmCheckIn}>
                        <span>Mark as Checked In</span>
                      </button>
                    </>
                  )}

                  {scanResult.type === 'duplicate' && (
                    <>
                      <div className="result-status-icon duplicate"><AlertTriangle size={32} /></div>
                      <h3 className="result-title amber">⚠ Already Checked In</h3>
                      <p className="result-warning-text">This ticket has already passed gate verification.</p>
                      <div className="result-details-grid">
                        <div><span className="r-label">Passholder:</span> <strong>{scanResult.data.name}</strong></div>
                        <div><span className="r-label">Ticket ID:</span> <code>{scanResult.data.id}</code></div>
                        <div><span className="r-label">First Check-in:</span> {scanResult.data.firstScanTime}</div>
                      </div>
                    </>
                  )}

                  {scanResult.type === 'checked_in_success' && (
                    <>
                      <div className="result-status-icon verified"><CheckCircle2 size={32} /></div>
                      <h3 className="result-title green">✓ Checked In Successfully</h3>
                      <p className="result-warning-text">Passholder has been logged into the event check-in list.</p>
                      <div className="result-details-grid">
                        <div><span className="r-label">Passholder:</span> <strong>{scanResult.data.name}</strong></div>
                        <div><span className="r-label">Time:</span> {scanResult.data.scanTime}</div>
                      </div>
                      <button className="scan-another-btn" onClick={() => setScanResult(null)}>
                        <span>Scan Next Ticket</span>
                      </button>
                    </>
                  )}
                </motion.div>
              )}

            </div>
          </motion.div>
        )}

        {/* TAB 2: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="org-page-header">
              <div>
                <span className="eyebrow-tag"><LayoutDashboard size={14} /> LIVE EVENT METRICS</span>
                <h2 className="org-page-title">Event Dashboard</h2>
                <p className="org-page-subtitle">Real-time attendance ratio and check-in velocity.</p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="dash-action-btn" onClick={exportEventDetailsJSON}>
                  <FileText size={14} />
                  <span>Export Event Details</span>
                </button>
                <button className="dash-action-btn primary" onClick={exportRegistrationsCSV}>
                  <FileText size={14} />
                  <span>Export Registrations</span>
                </button>
              </div>
            </div>

            {/* Attendance Progress & Stats Cards */}
            <div className="dashboard-stats-grid">
              <div className="dash-stat-card">
                <div className="stat-icon-wrapper purple"><Users size={20} /></div>
                <div>
                  <span className="dash-stat-num">{totalRegisteredCount}</span>
                  <span className="dash-stat-label">Total Registered</span>
                </div>
              </div>

              <div className="dash-stat-card">
                <div className="stat-icon-wrapper green"><CheckCircle2 size={20} /></div>
                <div>
                  <span className="dash-stat-num">{scannedCount}</span>
                  <span className="dash-stat-label">Checked In</span>
                </div>
              </div>

              <div className="dash-stat-card">
                <div className="stat-icon-wrapper amber"><Clock size={20} /></div>
                <div>
                  <span className="dash-stat-num">{notCheckedInCount}</span>
                  <span className="dash-stat-label">Not Checked In</span>
                </div>
              </div>

              <div className="dash-stat-card">
                <div className="stat-icon-wrapper blue"><Award size={20} /></div>
                <div>
                  <span className="dash-stat-num">{capacity}</span>
                  <span className="dash-stat-label">Event Capacity</span>
                </div>
              </div>
            </div>

            {/* Attendance Progress Bar */}
            <div className="org-card-box" style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 700 }}>
                <span>Gate Attendance Progress</span>
                <span style={{ color: 'var(--strong-lavender)' }}>{checkInPercentage}% Turnout</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${checkInPercentage}%` }} />
              </div>
            </div>

            {/* Recent Check-in Activity */}
            <div className="org-card-box" style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>Recent Gate Check-ins</h3>
              <div className="org-table-wrapper">
                <table className="org-table">
                  <thead>
                    <tr>
                      <th>TICKET ID</th>
                      <th>PARTICIPANT</th>
                      <th>COLLEGE</th>
                      <th>CHECK-IN TIME</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scannedList.map(s => (
                      <tr key={s.id}>
                        <td><code>{s.id}</code></td>
                        <td><strong>{s.name}</strong></td>
                        <td>{s.college}</td>
                        <td>{s.scanTime}</td>
                        <td><span className="status-tag confirmed">{s.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: REGISTERED */}
        {activeTab === 'registered' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="org-page-header">
              <div>
                <span className="eyebrow-tag"><Users size={14} /> REGISTERED PARTICIPANTS</span>
                <h2 className="org-page-title">Registered Students</h2>
                <p className="org-page-subtitle">Full roster of all students registered for {event.title}.</p>
              </div>

              <button className="create-event-btn" onClick={exportRegistrationsCSV}>
                <FileText size={16} />
                <span>Export Registrations (CSV)</span>
              </button>
            </div>

            {/* Toolbar */}
            <div className="events-toolbar" style={{ marginBottom: '20px' }}>
              <div className="toolbar-search-input">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search name, ticket ID, email..." 
                  value={regSearch} 
                  onChange={(e) => setRegSearch(e.target.value)} 
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <select className="form-select" value={regStatusFilter} onChange={(e) => setRegStatusFilter(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
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
                      <th>TICKET ID</th>
                      <th>NAME</th>
                      <th>EMAIL</th>
                      <th>PHONE</th>
                      <th>COLLEGE</th>
                      <th>YEAR</th>
                      <th>BRANCH</th>
                      <th>DATE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegisteredList.map(r => (
                      <tr key={r.id}>
                        <td><code>{r.id}</code></td>
                        <td><strong>{r.name}</strong></td>
                        <td>{r.email}</td>
                        <td>{r.phone}</td>
                        <td>{r.college}</td>
                        <td>{r.year}</td>
                        <td>{r.branch}</td>
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

        {/* TAB 4: SCANNED */}
        {activeTab === 'scanned' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="org-page-header">
              <div>
                <span className="eyebrow-tag"><CheckCircle2 size={14} /> GATE CHECKED IN</span>
                <h2 className="org-page-title">Scanned Attendees</h2>
                <p className="org-page-subtitle">Verified gate entry log for {event.title}.</p>
              </div>

              <button className="create-event-btn" onClick={exportScannedCSV}>
                <FileText size={16} />
                <span>Export Check-ins (CSV)</span>
              </button>
            </div>

            <div className="org-card-box">
              <div className="org-table-wrapper">
                <table className="org-table">
                  <thead>
                    <tr>
                      <th>TICKET ID</th>
                      <th>PARTICIPANT NAME</th>
                      <th>COLLEGE</th>
                      <th>SCAN TIME</th>
                      <th>GATE STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scannedList.map(s => (
                      <tr key={s.id}>
                        <td><code>{s.id}</code></td>
                        <td><strong>{s.name}</strong></td>
                        <td>{s.college}</td>
                        <td>{s.scanTime}</td>
                        <td><span className="status-tag confirmed">{s.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* EDIT EVENT TAB */}
        {activeTab === 'edit' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="org-page-header">
              <div>
                <span className="eyebrow-tag"><Edit3 size={14} /> ORGANIZER EDIT</span>
                <h2 className="org-page-title">Edit Event Information</h2>
                <p className="org-page-subtitle">Update venue, timings, fees, or event guidelines.</p>
              </div>
            </div>

            {editSuccessMsg && (
              <div className="auth-alert success" style={{ marginBottom: '20px' }}>
                <CheckCircle2 size={18} />
                <span>{editSuccessMsg}</span>
              </div>
            )}

            <form className="host-form-card" onSubmit={(e) => { e.preventDefault(); setEditSuccessMsg('✓ Event changes saved successfully!'); setTimeout(() => setEditSuccessMsg(''), 2000); }}>
              <div className="host-form-grid">
                <div className="form-group full-width">
                  <label>Event Name</label>
                  <input type="text" value={editFormData.title || ''} onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })} required />
                </div>

                {/* Poster Image File Upload & Preview */}
                <div className="form-group full-width">
                  <label>Event Poster</label>
                  {editFormData.banner ? (
                    <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-card)', maxWidth: '400px' }}>
                      <img src={editFormData.banner} alt="Poster Preview" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                      <div style={{ padding: '8px', background: 'var(--surface-secondary)', display: 'flex', gap: '8px' }}>
                        <label className="dash-action-btn" style={{ cursor: 'pointer', margin: 0 }}>
                          <span>Change Image</span>
                          <input 
                            type="file" 
                            accept="image/jpeg,image/png,image/webp" 
                            style={{ display: 'none' }} 
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const url = URL.createObjectURL(file);
                                setEditFormData({ ...editFormData, banner: url });
                              }
                            }} 
                          />
                        </label>
                        <button type="button" className="dash-action-btn" style={{ color: '#EF4444' }} onClick={() => setEditFormData({ ...editFormData, banner: '' })}>
                          Remove Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="upload-dropzone" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', border: '2px dashed var(--border-focus)', borderRadius: 'var(--radius-md)', background: 'var(--surface-secondary)' }}>
                      <span>Click to upload Event Poster (JPG, PNG, WEBP)</span>
                      <input 
                        type="file" 
                        accept="image/jpeg,image/png,image/webp" 
                        style={{ display: 'none' }} 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setEditFormData({ ...editFormData, banner: url });
                          }
                        }} 
                      />
                    </label>
                  )}
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <input type="text" value={editFormData.category || ''} onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })} required />
                </div>

                <div className="form-group">
                  <label>Venue</label>
                  <input type="text" value={editFormData.location || ''} onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })} required />
                </div>

                <div className="form-group">
                  <label>Dates</label>
                  <input type="text" value={editFormData.date || ''} onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })} required />
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea rows={3} value={editFormData.description || ''} onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })} />
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button type="submit" className="btn-primary-publish" style={{ display: 'inline-flex', width: 'auto' }}>
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}

      </main>
    </div>
  );
};

export default OrganizerEventManagementPage;
