import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
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
  Clock,
  Download,
  RefreshCw,
  AlertCircle,
  Camera,
  CameraOff
} from 'lucide-react';
import './OrganizerEventManagementPage.css';

export const OrganizerEventManagementPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { organizerUser } = useAuth();

  // Selected tab: Scanner MUST BE DEFAULT / FIRST
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'dashboard' | 'registered' | 'scanned' | 'edit'

  const [event, setEvent] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [registeredList, setRegisteredList] = useState([]);
  const [scannedList, setScannedList] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({
    total_registrations: 0,
    checked_in: 0,
    remaining: 0
  });

  // Export Loading & Toast Notification state
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingCheckins, setIsExportingCheckins] = useState(false);
  const [toastMessage, setToastMessage] = useState(null); // { type: 'success'|'error', text: '' }

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Scanner state
  const [ticketInput, setTicketInput] = useState('');
  const [scanResult, setScanResult] = useState(null); // null | { type: 'verified'|'duplicate'|'wrong_event'|'error', data: object }
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const scannerInstanceRef = useRef(null);

  const startCamera = async () => {
    setCameraError(null);
    setScanResult(null);

    try {
      if (scannerInstanceRef.current) {
        try {
          if (scannerInstanceRef.current.isScanning) {
            await scannerInstanceRef.current.stop();
          }
        } catch (e) {}
        scannerInstanceRef.current = null;
      }

      // Ensure container is rendered in DOM before Html5Qrcode measures dimensions
      setIsCameraActive(true);
      await new Promise(r => setTimeout(r, 100));

      const html5QrCode = new Html5Qrcode("festora-qr-reader");
      scannerInstanceRef.current = html5QrCode;

      const qrConfig = {
        fps: 15,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minDim = Math.min(viewfinderWidth || 300, viewfinderHeight || 240);
          const boxSize = Math.max(160, Math.floor(minDim * 0.75));
          return { width: boxSize, height: boxSize };
        },
        aspectRatio: 1.333333
      };

      const handleVideoReady = () => {
        setTimeout(() => {
          const videoElem = document.querySelector('#festora-qr-reader video');
          if (videoElem) {
            videoElem.setAttribute('playsinline', 'true');
            videoElem.setAttribute('autoplay', 'true');
            videoElem.setAttribute('muted', 'true');
            videoElem.muted = true;
            videoElem.play().catch(() => {});
          }
        }, 150);
      };

      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          qrConfig,
          (decodedText) => handleQrScanned(decodedText)
        );
        handleVideoReady();
      } catch (errFacing) {
        const cameras = await Html5Qrcode.getCameras().catch(() => []);
        if (cameras && cameras.length > 0) {
          await html5QrCode.start(
            cameras[0].id,
            qrConfig,
            (decodedText) => handleQrScanned(decodedText)
          );
          handleVideoReady();
        } else {
          throw new Error("No camera device found on this system.");
        }
      }

    } catch (err) {
      console.error("[CAMERA START ERROR]:", err);
      let msg = err.message || "Unable to access camera.";
      if (err.name === 'NotAllowedError' || msg.includes('Permission')) {
        msg = "Camera permission was denied. Please allow camera access in browser settings.";
      } else if (msg.includes('No camera')) {
        msg = "No camera detected on this device.";
      } else if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        msg = "Camera access requires an HTTPS connection in production environments.";
      }
      setCameraError(msg);
      setIsCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (scannerInstanceRef.current) {
      try {
        if (scannerInstanceRef.current.isScanning) {
          await scannerInstanceRef.current.stop();
        }
      } catch (e) {}
      scannerInstanceRef.current = null;
    }
    const videoElem = document.querySelector('#festora-qr-reader video');
    if (videoElem && videoElem.srcObject) {
      try {
        videoElem.srcObject.getTracks().forEach(track => track.stop());
      } catch (e) {}
      videoElem.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const handleQrScanned = async (decodedText) => {
    await stopCamera();
    handleProcessScan(decodedText);
  };

  useEffect(() => {
    return () => {
      if (scannerInstanceRef.current) {
        try {
          if (scannerInstanceRef.current.isScanning) {
            scannerInstanceRef.current.stop().catch(() => {});
          }
        } catch (e) {}
        scannerInstanceRef.current = null;
      }
    };
  }, [activeTab]);

  // Edit Event state
  const [editFormData, setEditFormData] = useState({});
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  // Filters for Registered tab
  const [regSearch, setRegSearch] = useState('');
  const [regStatusFilter, setRegStatusFilter] = useState('All');

  // Load real event details, registrations, and check-ins from backend
  const fetchEventManagementData = async () => {
    setLoadingEvent(true);
    try {
      // 1. Fetch public event info by ID
      const eventRes = await api.getPublicEventById(eventId).catch(() => null);
      if (eventRes && eventRes.event) {
        setEvent(eventRes.event);
        setEditFormData(eventRes.event);
      }

      // 2. Fetch registrations for this event
      const regRes = await api.getOrganizerEventRegistrations(eventId).catch(() => null);
      if (regRes && regRes.registrations) {
        setRegisteredList(regRes.registrations);
      }

      // 3. Fetch check-ins for this event
      const checkinRes = await api.getEventCheckins(eventId).catch(() => null);
      if (checkinRes && checkinRes.checkins) {
        setScannedList(checkinRes.checkins);
      }

      // 4. Fetch attendance summary
      const summaryRes = await api.getEventAttendanceSummary(eventId).catch(() => null);
      if (summaryRes) {
        setAttendanceSummary(summaryRes);
      }
    } catch (err) {
      console.error('[EVENT MANAGMENT] Error fetching event data:', err);
    } finally {
      setLoadingEvent(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (eventId) {
      fetchEventManagementData();
    }
  }, [eventId]);

  // Process ticket QR code scan via backend API
  const handleProcessScan = async (codeToScan) => {
    const code = (codeToScan || ticketInput).trim();
    if (!code) return;

    setIsProcessingScan(true);
    setScanResult(null);

    try {
      const res = await api.processCheckin(eventId, code);
      if (res && res.success) {
        if (res.status === 'already_checked_in') {
          setScanResult({
            type: 'duplicate',
            message: res.message || 'This ticket was already checked in.',
            ticket: res.ticket
          });
        } else {
          setScanResult({
            type: 'verified',
            message: res.message || 'Check-in successful',
            ticket: res.ticket
          });
          showToast('success', `Check-in confirmed for ${res.ticket?.student_name || 'Student'}`);
        }
        fetchEventManagementData(); // Refresh backend counts & tables
      } else {
        setScanResult({
          type: 'error',
          message: res?.message || 'Invalid Ticket — QR code is not recognized or ticket is invalid.'
        });
      }
    } catch (err) {
      const errorMsg = err.data?.message || err.message || 'Invalid Ticket — QR code is not recognized or ticket is invalid.';
      let type = 'error';
      if (errorMsg.includes('another event') || errorMsg.includes('different event') || errorMsg.includes('not this event')) {
        type = 'wrong_event';
      }
      setScanResult({
        type: type,
        message: errorMsg
      });
    } finally {
      setIsProcessingScan(false);
    }
  };

  // Excel Export Handler for Registrations
  const handleExportRegistrationsExcel = () => {
    if (registeredList.length === 0) {
      showToast('error', 'No registrations found for this event.');
      return;
    }

    setIsExportingExcel(true);
    try {
      const worksheetData = registeredList.map((reg, index) => ({
        'S.No': index + 1,
        'Ticket ID': reg.ticket_code || `REG-${reg.registration_id}`,
        'Participant Name': reg.student_name || 'N/A',
        'Email': reg.student_email || 'N/A',
        'Phone': reg.student_phone || 'N/A',
        'College / Organization': reg.college || 'N/A',
        'Department': reg.department || 'N/A',
        'Year of Study': reg.year_of_study || 'N/A',
        'Registration Status': (reg.registration_status || 'confirmed').toUpperCase(),
        'Ticket Status': (reg.ticket_status || 'active').toUpperCase(),
        'Registration Date': reg.registered_at ? new Date(reg.registered_at).toLocaleString() : 'N/A',
        'Event Name': event?.title || 'Campus Event',
        'Event Date': event?.date || 'Upcoming'
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      worksheet['!cols'] = [
        { wch: 6 },
        { wch: 18 },
        { wch: 24 },
        { wch: 28 },
        { wch: 16 },
        { wch: 26 },
        { wch: 18 },
        { wch: 14 },
        { wch: 18 },
        { wch: 14 },
        { wch: 22 },
        { wch: 30 },
        { wch: 16 }
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

      const sanitizedTitle = (event?.title || 'Event').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `FESTORA_${sanitizedTitle}_Registrations.xlsx`;

      XLSX.writeFile(workbook, filename);
      showToast('success', `Exported ${registeredList.length} registration(s) to ${filename}`);
    } catch (err) {
      console.error('[EXPORT EXCEL ERROR]:', err);
      showToast('error', 'Unable to export registrations. Please try again.');
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Excel Export Handler for Check-ins
  const handleExportCheckinsExcel = () => {
    if (scannedList.length === 0) {
      showToast('error', 'No check-in records found for this event.');
      return;
    }

    setIsExportingCheckins(true);
    try {
      const worksheetData = scannedList.map((item, index) => ({
        'S.No': index + 1,
        'Ticket ID': item.ticket_code || `CHK-${item.checkin_id}`,
        'Participant Name': item.student_name || 'N/A',
        'Email': item.student_email || 'N/A',
        'College / Organization': item.college || 'N/A',
        'Check-in Time': item.scanned_at ? new Date(item.scanned_at).toLocaleString() : 'N/A',
        'Gate Status': (item.checkin_status || 'Checked In').toUpperCase(),
        'Verified By': item.scanned_by || 'Gate Scanner'
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      worksheet['!cols'] = [
        { wch: 6 },
        { wch: 18 },
        { wch: 24 },
        { wch: 28 },
        { wch: 26 },
        { wch: 22 },
        { wch: 16 },
        { wch: 20 }
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Check_Ins');

      const sanitizedTitle = (event?.title || 'Event').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `FESTORA_${sanitizedTitle}_Checkins.xlsx`;

      XLSX.writeFile(workbook, filename);
      showToast('success', `Exported ${scannedList.length} check-in record(s) to ${filename}`);
    } catch (err) {
      console.error('[EXPORT CHECKINS EXCEL ERROR]:', err);
      showToast('error', 'Unable to export check-ins. Please try again.');
    } finally {
      setIsExportingCheckins(false);
    }
  };

  const filteredRegisteredList = registeredList.filter(r => {
    const searchLower = regSearch.toLowerCase();
    const nameMatch = r.student_name ? r.student_name.toLowerCase().includes(searchLower) : false;
    const emailMatch = r.student_email ? r.student_email.toLowerCase().includes(searchLower) : false;
    const ticketMatch = r.ticket_code ? r.ticket_code.toLowerCase().includes(searchLower) : false;
    const matchesSearch = !regSearch || nameMatch || emailMatch || ticketMatch;
    const matchesStatus = regStatusFilter === 'All' || (r.registration_status && r.registration_status.toLowerCase() === regStatusFilter.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  const totalRegisteredCount = attendanceSummary.total_registrations || registeredList.length;
  const scannedCount = attendanceSummary.checked_in || scannedList.length;
  const notCheckedInCount = attendanceSummary.remaining || Math.max(0, totalRegisteredCount - scannedCount);
  const checkInPercentage = totalRegisteredCount > 0 ? Math.round((scannedCount / totalRegisteredCount) * 100) : 0;

  if (loadingEvent && !event) {
    return (
      <div className="org-mgmt-layout" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: '#8B5CF6' }} />
          <h3 style={{ marginTop: '16px' }}>Loading Event Management Console</h3>
          <p style={{ color: 'var(--text-muted)' }}>Fetching live event analytics and ticket verification logs...</p>
        </div>
      </div>
    );
  }

  const activeEvent = event || {
    id: eventId,
    title: 'Festora Campus Event',
    category: 'Featured',
    status: 'published',
    date: 'Upcoming'
  };

  return (
    <div className="org-mgmt-layout">

      {/* Toast Notification Alert Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`org-toast-banner ${toastMessage.type}`}
          >
            {toastMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
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
              <h1>{activeEvent.title}</h1>
              <span className="status-tag published">{activeEvent.category}</span>
            </div>
          </div>

          <div className="org-mgmt-top-actions">
            <button className="btn-action-edit" onClick={() => setActiveTab('edit')}>
              <Edit3 size={14} />
              <span>Edit Event</span>
            </button>
            <button className="btn-action-manage" onClick={() => navigate(`/events/${activeEvent.id}`)}>
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
              <p className="scanner-subtitle">Scan or enter a student's ticket QR token to verify registration and mark gate entry.</p>
            </div>

            <div className="scanner-container-card">
              {/* Camera Action Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: isProcessingScan ? '#8B5CF6' : (isCameraActive ? '#22C55E' : '#64748B'),
                    boxShadow: isCameraActive ? '0 0 8px #22C55E' : 'none'
                  }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
                    {isProcessingScan ? 'Checking ticket pass...' : (isCameraActive ? 'Camera Live — Point QR at lens' : 'Camera Stopped')}
                  </span>
                </div>

                {!isCameraActive ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    style={{ background: 'var(--strong-lavender)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Camera size={16} />
                    <span>Start Camera</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopCamera}
                    style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <CameraOff size={16} />
                    <span>Stop Camera</span>
                  </button>
                )}
              </div>

              {/* Camera Error Notice */}
              {cameraError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', fontSize: '0.875rem' }}>
                  <strong>Camera Notice:</strong> {cameraError}
                </div>
              )}

              {/* Viewfinder Frame / Html5Qrcode video box */}
              <div className="camera-viewfinder-frame">
                <div id="festora-qr-reader" style={{ width: '100%', height: '100%', display: isCameraActive ? 'block' : 'none' }} />

                {!isCameraActive && (
                  <div className="viewfinder-center-content">
                    <QrCode size={48} className="qr-center-icon" />
                    <span className="viewfinder-instruction">Click "Start Camera" or enter Ticket ID below</span>
                  </div>
                )}

                {isCameraActive && (
                  <>
                    <div className="viewfinder-corner top-left" />
                    <div className="viewfinder-corner top-right" />
                    <div className="viewfinder-corner bottom-left" />
                    <div className="viewfinder-corner bottom-right" />
                    <div className="scanning-laser-line" />
                  </>
                )}
              </div>

              {/* Manual Code Input Bar (Fallback) */}
              <div className="scanner-controls-row">
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                  Manual Ticket ID Fallback
                </label>
                <div className="quick-code-input-group">
                  <input 
                    type="text" 
                    placeholder="Enter QR Token or Ticket Code (e.g. FEST-F8D54B92)" 
                    value={ticketInput} 
                    onChange={(e) => setTicketInput(e.target.value)} 
                    onKeyDown={(e) => { if (e.key === 'Enter') handleProcessScan(); }}
                  />
                  <button className="scan-trigger-btn" onClick={() => handleProcessScan()} disabled={isProcessingScan}>
                    {isProcessingScan ? 'Verifying...' : 'Verify Ticket Pass'}
                  </button>
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
                      <div className="result-status-icon verified"><CheckCircle2 size={36} /></div>
                      <h3 className="result-title green">✓ CHECK-IN SUCCESSFUL</h3>
                      <div className="result-details-grid">
                        <div><span className="r-label">Event:</span> <strong>{scanResult.ticket?.event_name || activeEvent.title}</strong></div>
                        <div><span className="r-label">Participant:</span> <strong>{scanResult.ticket?.student_name || 'Student Participant'}</strong></div>
                        <div><span className="r-label">Email:</span> {scanResult.ticket?.email || 'N/A'}</div>
                        <div><span className="r-label">Ticket ID:</span> <code>{scanResult.ticket?.ticket_code || scanResult.ticket?.ticket_id}</code></div>
                        <div><span className="r-label">College:</span> {scanResult.ticket?.college || 'University'}</div>
                        <div><span className="r-label">Status:</span> <span style={{ color: '#22C55E', fontWeight: '700' }}>Checked In</span></div>
                        <div><span className="r-label">Check-in Time:</span> {scanResult.ticket?.check_in_time ? new Date(scanResult.ticket.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</div>
                      </div>
                      <button className="scan-another-btn" onClick={() => { setScanResult(null); setTicketInput(''); startCamera(); }}>
                        <span>Scan Next Ticket</span>
                      </button>
                    </>
                  )}

                  {scanResult.type === 'duplicate' && (
                    <>
                      <div className="result-status-icon duplicate"><AlertTriangle size={36} /></div>
                      <h3 className="result-title amber">⚠ ALREADY CHECKED IN</h3>
                      <p className="result-warning-text">{scanResult.message}</p>
                      {scanResult.ticket && (
                        <div className="result-details-grid" style={{ marginTop: '12px' }}>
                          <div><span className="r-label">Participant:</span> <strong>{scanResult.ticket.student_name}</strong></div>
                          <div><span className="r-label">Ticket ID:</span> <code>{scanResult.ticket.ticket_code}</code></div>
                          <div><span className="r-label">College:</span> {scanResult.ticket.college}</div>
                          <div><span className="r-label">Checked in at:</span> {new Date(scanResult.ticket.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      )}
                      <button className="scan-another-btn" onClick={() => { setScanResult(null); setTicketInput(''); startCamera(); }}>
                        <span>Scan Next Ticket</span>
                      </button>
                    </>
                  )}

                  {scanResult.type === 'wrong_event' && (
                    <>
                      <div className="result-status-icon error"><AlertCircle size={36} color="#EF4444" /></div>
                      <h3 className="result-title" style={{ color: '#EF4444' }}>❌ WRONG EVENT</h3>
                      <p className="result-warning-text">{scanResult.message}</p>
                      <button className="scan-another-btn" onClick={() => { setScanResult(null); setTicketInput(''); startCamera(); }}>
                        <span>Scan Again</span>
                      </button>
                    </>
                  )}

                  {scanResult.type === 'error' && (
                    <>
                      <div className="result-status-icon error"><AlertTriangle size={36} color="#EF4444" /></div>
                      <h3 className="result-title" style={{ color: '#EF4444' }}>❌ INVALID TICKET</h3>
                      <p className="result-warning-text">{scanResult.message || 'QR code is not recognized or ticket is invalid.'}</p>
                      <button className="scan-another-btn" onClick={() => { setScanResult(null); setTicketInput(''); startCamera(); }}>
                        <span>Scan Again</span>
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
                <h2 className="org-page-title">Event Analytics</h2>
                <p className="org-page-subtitle">Real-time attendance ratio and check-in metrics for {activeEvent.title}.</p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-action-export" onClick={handleExportRegistrationsExcel} disabled={isExportingExcel}>
                  {isExportingExcel ? (
                    <>
                      <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Download size={14} />
                      <span>Export Excel</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Attendance Progress & Stats Cards */}
            <div className="dashboard-stats-grid">
              <div className="dash-stat-card">
                <div className="stat-icon-wrapper purple"><Users size={22} /></div>
                <div className="stat-info-col">
                  <span className="dash-stat-num">{totalRegisteredCount}</span>
                  <span className="dash-stat-label">Total Registered</span>
                </div>
              </div>

              <div className="dash-stat-card">
                <div className="stat-icon-wrapper green"><CheckCircle2 size={22} /></div>
                <div className="stat-info-col">
                  <span className="dash-stat-num">{scannedCount}</span>
                  <span className="dash-stat-label">Checked In</span>
                </div>
              </div>

              <div className="dash-stat-card">
                <div className="stat-icon-wrapper amber"><Clock size={22} /></div>
                <div className="stat-info-col">
                  <span className="dash-stat-num">{notCheckedInCount}</span>
                  <span className="dash-stat-label">Not Checked In</span>
                </div>
              </div>

              <div className="dash-stat-card">
                <div className="stat-icon-wrapper blue"><Award size={22} /></div>
                <div className="stat-info-col">
                  <span className="dash-stat-num">{activeEvent.max_participants || 300}</span>
                  <span className="dash-stat-label">Capacity Limit</span>
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
                      <th>PARTICIPANT NAME</th>
                      <th>COLLEGE</th>
                      <th>CHECK-IN TIME</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scannedList.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                          No gate check-ins logged yet.
                        </td>
                      </tr>
                    ) : (
                      scannedList.slice(0, 10).map(s => (
                        <tr key={s.checkin_id || s.ticket_code}>
                          <td><code>{s.ticket_code || 'TICKET'}</code></td>
                          <td><strong>{s.student_name || 'Student Participant'}</strong></td>
                          <td>{s.college || 'Campus'}</td>
                          <td>{s.scanned_at ? new Date(s.scanned_at).toLocaleTimeString() : 'N/A'}</td>
                          <td><span className="status-tag confirmed">CHECKED IN</span></td>
                        </tr>
                      ))
                    )}
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
                <p className="org-page-subtitle">Full roster of all students registered for {activeEvent.title}.</p>
              </div>

              <button className="btn-action-export" onClick={handleExportRegistrationsExcel} disabled={isExportingExcel} style={{ padding: '10px 18px', fontSize: '0.9rem' }}>
                {isExportingExcel ? (
                  <>
                    <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Export Excel</span>
                  </>
                )}
              </button>
            </div>

            {/* Toolbar */}
            <div className="events-toolbar" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div className="toolbar-search-input">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search student name, email, ticket code..." 
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
                      <th>PARTICIPANT NAME</th>
                      <th>EMAIL</th>
                      <th>PHONE</th>
                      <th>COLLEGE</th>
                      <th>REGISTRATION DATE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegisteredList.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                          No registered participants found.
                        </td>
                      </tr>
                    ) : (
                      filteredRegisteredList.map(r => (
                        <tr key={r.registration_id}>
                          <td><code>{r.ticket_code || `REG-${r.registration_id}`}</code></td>
                          <td><strong>{r.student_name || 'Student Participant'}</strong></td>
                          <td>{r.student_email}</td>
                          <td>{r.student_phone || 'N/A'}</td>
                          <td>{r.college || 'University'}</td>
                          <td>{r.registered_at ? new Date(r.registered_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</td>
                          <td>
                            <span className={`status-tag ${(r.registration_status || 'confirmed').toLowerCase()}`}>
                              {r.registration_status || 'Confirmed'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
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
                <p className="org-page-subtitle">Verified gate entry log for {activeEvent.title}.</p>
              </div>

              <button className="btn-action-export" onClick={handleExportCheckinsExcel} disabled={isExportingCheckins} style={{ padding: '10px 18px', fontSize: '0.9rem' }}>
                {isExportingCheckins ? (
                  <>
                    <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Export Check-ins (Excel)</span>
                  </>
                )}
              </button>
            </div>

            <div className="org-card-box">
              <div className="org-table-wrapper">
                <table className="org-table">
                  <thead>
                    <tr>
                      <th>TICKET ID</th>
                      <th>PARTICIPANT NAME</th>
                      <th>EMAIL</th>
                      <th>COLLEGE</th>
                      <th>SCAN TIME</th>
                      <th>GATE STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scannedList.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                          No gate check-ins recorded yet.
                        </td>
                      </tr>
                    ) : (
                      scannedList.map(s => (
                        <tr key={s.checkin_id || s.ticket_code}>
                          <td><code>{s.ticket_code || 'TICKET'}</code></td>
                          <td><strong>{s.student_name || 'Student Participant'}</strong></td>
                          <td>{s.student_email || 'N/A'}</td>
                          <td>{s.college || 'Campus'}</td>
                          <td>{s.scanned_at ? new Date(s.scanned_at).toLocaleTimeString() : 'N/A'}</td>
                          <td><span className="status-tag confirmed">CHECKED IN</span></td>
                        </tr>
                      ))
                    )}
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

            <form className="host-form-card" onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api.updateOrganizerEvent(eventId, editFormData);
                setEditSuccessMsg('✓ Event changes saved successfully!');
                fetchEventManagementData();
                setTimeout(() => setEditSuccessMsg(''), 2000);
              } catch (err) {
                showToast('error', `Failed to update event: ${err.message}`);
              }
            }}>
              <div className="host-form-grid">
                <div className="form-group full-width">
                  <label>Event Name</label>
                  <input type="text" value={editFormData.title || ''} onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })} required />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <input type="text" value={editFormData.category || ''} onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })} required />
                </div>

                <div className="form-group">
                  <label>Venue</label>
                  <input type="text" value={editFormData.venue || editFormData.location || ''} onChange={(e) => setEditFormData({ ...editFormData, venue: e.target.value })} required />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input type="text" value={editFormData.city || ''} onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })} required />
                </div>

                <div className="form-group">
                  <label>Dates</label>
                  <input type="text" value={editFormData.event_date || editFormData.date || ''} onChange={(e) => setEditFormData({ ...editFormData, event_date: e.target.value })} required />
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea rows={3} value={editFormData.description || ''} onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })} />
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button type="submit" className="org-btn-primary" style={{ display: 'inline-flex', width: 'auto' }}>
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
