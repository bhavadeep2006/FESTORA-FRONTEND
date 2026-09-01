import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Ticket, Calendar, MapPin, Clock, ArrowRight, X, CheckCircle2, ShieldCheck, Download, RefreshCw, AlertCircle } from 'lucide-react';
import './RegisteredTicketsPage.css';

export const RegisteredTicketsPage = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [downloadingTicketId, setDownloadingTicketId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMyRegistrations();
      setRegistrations(res.registrations || []);
    } catch (err) {
      console.error('Error fetching registrations:', err);
      setError(err.message || 'Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const formattedTickets = registrations.map(reg => {
    const isPast = new Date(reg.event_date) < new Date();
    const formattedDate = reg.event_date 
      ? new Date(reg.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Upcoming';

    const qrDataUrl = reg.qr_token 
      ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(reg.qr_token)}`
      : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop';

    return {
      registrationId: reg.registration_id,
      ticketId: reg.ticket_code || `REG-${reg.registration_id}`,
      ticketCode: reg.ticket_code,
      eventTitle: reg.event_title,
      category: reg.category || 'Event Pass',
      ticketType: 'STUDENT PASS',
      college: reg.venue || reg.student_college || 'Campus Venue',
      venue: reg.venue || 'Campus Auditorium',
      city: reg.city || 'Hyderabad',
      location: reg.city ? `${reg.venue || 'Campus'}, ${reg.city}` : (reg.venue || 'Campus Venue'),
      date: formattedDate,
      time: reg.start_time ? `${reg.start_time}${reg.end_time ? ' - ' + reg.end_time : ''}` : 'TBA',
      price: reg.registration_fee && Number(reg.registration_fee) > 0 ? `₹${reg.registration_fee}` : 'Free Pass',
      status: isPast ? 'COMPLETED' : (reg.registration_status ? reg.registration_status.toUpperCase() : 'CONFIRMED'),
      banner: reg.poster_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop',
      qrPlaceholder: qrDataUrl,
      qrToken: reg.qr_token,
      badgeColor: isPast ? '#64748B' : '#8B5CF6',
      // Raw student fields for PDF
      studentName: reg.student_name || user?.name || 'Student Passholder',
      studentEmail: reg.student_email || user?.email || 'N/A',
      studentPhone: reg.student_phone || user?.phone || 'N/A',
      studentCollege: reg.student_college || user?.college || 'University',
      studentDepartment: reg.student_department || user?.department || 'N/A',
      studentYear: reg.student_year || user?.year_of_study || 'N/A',
      registeredAt: reg.registered_at,
      checkedInAt: reg.checked_in_at
    };
  });

  // Professional PDF Generation using jsPDF & Image QR fetch
  const handleDownloadTicketPDF = async (ticket) => {
    setDownloadingTicketId(ticket.registrationId);
    showToast('success', 'Generating Ticket PDF...');

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // 1. Header Styling
      doc.setFillColor(139, 92, 246); // FESTORA Purple (#8B5CF6)
      doc.rect(0, 0, 210, 32, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('FESTORA', 16, 18);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL DIGITAL EVENT ENTRY PASS', 16, 25);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('TICKET PASS', 194, 20, { align: 'right' });

      let currentY = 44;

      // 2. Event Title Box
      doc.setFillColor(245, 243, 255); // Light purple fill
      doc.setDrawColor(221, 214, 254);
      doc.roundedRect(14, currentY, 182, 28, 3, 3, 'FD');

      doc.setTextColor(109, 40, 217);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text((ticket.category || 'CAMPUS EVENT').toUpperCase(), 20, currentY + 9);

      doc.setTextColor(30, 27, 75);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      const eventTitleText = doc.splitTextToSize(ticket.eventTitle, 170);
      doc.text(eventTitleText, 20, currentY + 18);

      currentY += 36;

      // 3. Grid Details Section: Event Info & Student Info
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(17, 24, 39);
      doc.text('EVENT INFORMATION', 16, currentY);
      doc.text('PARTICIPANT DETAILS', 110, currentY);

      doc.setLineWidth(0.4);
      doc.setDrawColor(229, 231, 235);
      doc.line(16, currentY + 2, 96, currentY + 2);
      doc.line(110, currentY + 2, 194, currentY + 2);

      currentY += 8;

      // Event Info Left Column
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(107, 114, 128);
      doc.text('Date:', 16, currentY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(17, 24, 39);
      doc.text(ticket.date, 40, currentY);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(107, 114, 128);
      doc.text('Time:', 16, currentY + 6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(17, 24, 39);
      doc.text(ticket.time, 40, currentY + 6);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(107, 114, 128);
      doc.text('Venue:', 16, currentY + 12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(17, 24, 39);
      doc.text(ticket.venue, 40, currentY + 12);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(107, 114, 128);
      doc.text('City:', 16, currentY + 18);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(17, 24, 39);
      doc.text(ticket.city, 40, currentY + 18);

      // Student Info Right Column
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(107, 114, 128);
      doc.text('Name:', 110, currentY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(17, 24, 39);
      doc.text(ticket.studentName, 134, currentY);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(107, 114, 128);
      doc.text('Email:', 110, currentY + 6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(17, 24, 39);
      doc.text(ticket.studentEmail, 134, currentY + 6);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(107, 114, 128);
      doc.text('Phone:', 110, currentY + 12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(17, 24, 39);
      doc.text(ticket.studentPhone || 'N/A', 134, currentY + 12);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(107, 114, 128);
      doc.text('College:', 110, currentY + 18);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(17, 24, 39);
      doc.text(ticket.studentCollege || 'University', 134, currentY + 18);

      currentY += 28;

      // 4. Ticket Metadata Box
      doc.setFillColor(249, 250, 251);
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(14, currentY, 182, 24, 2, 2, 'FD');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(107, 114, 128);
      doc.text('Ticket ID / Code:', 20, currentY + 8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(109, 40, 217);
      doc.text(ticket.ticketId, 20, currentY + 16);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(107, 114, 128);
      doc.text('Registration ID:', 75, currentY + 8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(17, 24, 39);
      doc.text(`#${ticket.registrationId}`, 75, currentY + 16);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(107, 114, 128);
      doc.text('Registration Date:', 125, currentY + 8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(17, 24, 39);
      const regDateStr = ticket.registeredAt ? new Date(ticket.registeredAt).toLocaleDateString() : ticket.date;
      doc.text(regDateStr, 125, currentY + 16);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(107, 114, 128);
      doc.text('Status:', 168, currentY + 8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 197, 94);
      doc.text(ticket.status, 168, currentY + 16);

      currentY += 34;

      // 5. QR Code Section (Convert Image Data to PNG Base64 safely)
      doc.setDrawColor(229, 231, 235);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(65, currentY, 80, 82, 4, 4, 'FD');

      try {
        const response = await fetch(ticket.qrPlaceholder);
        const blob = await response.blob();
        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        const base64Image = await base64Promise;

        doc.addImage(base64Image, 'PNG', 75, currentY + 6, 60, 60);
      } catch (imgErr) {
        console.warn('QR image load error in PDF generation:', imgErr);
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.text('QR Token: ' + (ticket.qrToken || ticket.ticketId), 105, currentY + 36, { align: 'center' });
      }

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(107, 114, 128);
      doc.text('GATE VERIFICATION QR TOKEN', 105, currentY + 71, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text(ticket.qrToken || ticket.ticketId, 105, currentY + 76, { align: 'center' });

      currentY += 92;

      // 6. Check-in Status Banner
      const isCheckedIn = Boolean(ticket.checkedInAt);
      if (isCheckedIn) {
        doc.setFillColor(220, 252, 231); // Light green fill
        doc.setDrawColor(34, 197, 94);
        doc.roundedRect(40, currentY, 130, 14, 3, 3, 'FD');

        doc.setTextColor(22, 101, 52);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        const checkinStr = `CHECKED IN AT GATE (${new Date(ticket.checkedInAt).toLocaleString()})`;
        doc.text(checkinStr, 105, currentY + 9, { align: 'center' });
      } else {
        doc.setFillColor(243, 244, 246);
        doc.setDrawColor(209, 213, 219);
        doc.roundedRect(40, currentY, 130, 14, 3, 3, 'FD');

        doc.setTextColor(75, 85, 99);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('STATUS: NOT CHECKED IN — PRESENT QR AT EVENT ENTRANCE', 105, currentY + 9, { align: 'center' });
      }

      // 7. Footer Notice
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(156, 163, 175);
      doc.text('Please present this PDF or digital pass on your mobile device at the event check-in gate.', 105, 280, { align: 'center' });
      doc.text('Powered by Festora Campus Event Platform • www.festora.demo', 105, 285, { align: 'center' });

      // Save PDF file
      const sanitizedTitle = (ticket.eventTitle || 'Event').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `FESTORA_${sanitizedTitle}_${ticket.ticketId}.pdf`;

      doc.save(filename);
      showToast('success', 'Ticket PDF downloaded successfully.');
    } catch (err) {
      console.error('[PDF GENERATION ERROR]:', err);
      showToast('error', 'Unable to generate ticket PDF. Please try again.');
    } finally {
      setDownloadingTicketId(null);
    }
  };

  const filteredTickets = formattedTickets.filter(t => {
    if (activeTab === 'upcoming') return t.status !== 'COMPLETED' && t.status !== 'CANCELLED';
    return t.status === 'COMPLETED' || t.status === 'CANCELLED';
  });

  return (
    <div className="tickets-page-view">

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

      <div className="section-container tickets-container">
        
        {/* Header Bar */}
        <motion.div 
          className="tickets-page-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <span className="tickets-eyebrow">
              <Ticket size={14} /> MY DIGITAL PASSES ({formattedTickets.length})
            </span>
            <h1 className="tickets-title">Registered Campus Passes</h1>
            <p className="tickets-subtitle">
              Your confirmed digital entry passes with QR gate verification for university fests.
            </p>

            <div className="dash-tab-bar" style={{ marginTop: '20px', borderBottom: 'none' }}>
              <div className="tab-buttons">
                <button 
                  className={`dash-filter-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                  onClick={() => setActiveTab('upcoming')}
                >
                  Upcoming Passes ({formattedTickets.filter(t => t.status !== 'COMPLETED').length})
                </button>
                <button 
                  className={`dash-filter-btn ${activeTab === 'past' ? 'active' : ''}`}
                  onClick={() => setActiveTab('past')}
                >
                  Past Events ({formattedTickets.filter(t => t.status === 'COMPLETED').length})
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="no-results-box" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: '#8B5CF6' }} />
            <h3 style={{ marginTop: '16px' }}>Loading Registered Passes</h3>
            <p>Fetching digital tickets from Festora database...</p>
          </div>
        ) : error ? (
          <div className="no-results-box" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', textAlign: 'center' }}>
            <AlertCircle size={32} color="#EF4444" style={{ margin: '0 auto' }} />
            <h3 style={{ marginTop: '12px', color: '#F87171' }}>Error Loading Tickets</h3>
            <p>{error}</p>
            <button className="reset-filter-btn" onClick={fetchRegistrations} style={{ marginTop: '16px' }}>
              Retry
            </button>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="dash-empty-state" style={{ marginTop: '24px' }}>
            <h3>No {activeTab} tickets found</h3>
            <p>Explore upcoming events and register for your passes.</p>
          </div>
        ) : (
          <div className="tickets-grid-list">
            {filteredTickets.map((ticket, idx) => (
              <motion.div
                key={ticket.registrationId}
                className="digital-ticket-card"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileTap={{ scale: 0.985 }}
              >
                <div className="ticket-banner-stub">
                  <img src={ticket.banner} alt={ticket.eventTitle} className="ticket-banner-img" />
                  <div className="ticket-banner-overlay" />
                  <span className="ticket-type-tag">{ticket.ticketType}</span>
                  <span className="ticket-status-pill" style={{ background: ticket.badgeColor }}>
                    <CheckCircle2 size={12} /> {ticket.status}
                  </span>
                </div>

                <div className="ticket-body-content">
                  <div className="ticket-header-meta">
                    <span className="ticket-college-name">{ticket.college}</span>
                    <span className="ticket-id-tag">ID: {ticket.ticketId}</span>
                  </div>

                  <h3 className="ticket-event-name">{ticket.eventTitle}</h3>

                  <div className="ticket-details-row">
                    <div className="detail-chip">
                      <Calendar size={14} />
                      <span>{ticket.date}</span>
                    </div>
                    <div className="detail-chip">
                      <Clock size={14} />
                      <span>{ticket.time}</span>
                    </div>
                    <div className="detail-chip">
                      <MapPin size={14} />
                      <span>{ticket.location}</span>
                    </div>
                  </div>

                  <div className="ticket-footer-bar">
                    <div className="ticket-price-box">
                      <span className="price-label">Pass Price</span>
                      <span className="price-val">{ticket.price}</span>
                    </div>

                    <button 
                      className="view-ticket-btn"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <span>View Digital Ticket</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="ticket-qr-stub">
                  <img src={ticket.qrPlaceholder} alt="QR Code" className="ticket-mini-qr" />
                  <span className="scan-gate-label">Gate Verification</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Ticket Details Modal */}
        <AnimatePresence>
          {selectedTicket && (
            <div className="ticket-modal-backdrop" onClick={() => setSelectedTicket(null)}>
              <motion.div 
                className="ticket-modal-card"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <button className="modal-close-btn" onClick={() => setSelectedTicket(null)}>
                  <X size={20} />
                </button>

                <div className="modal-ticket-banner">
                  <img src={selectedTicket.banner} alt={selectedTicket.eventTitle} className="modal-banner-img" />
                  <div className="modal-banner-overlay" />
                  <div className="modal-banner-content">
                    <span className="modal-type-badge">{selectedTicket.ticketType}</span>
                    <h2 className="modal-event-title">{selectedTicket.eventTitle}</h2>
                    <span className="modal-college-name">{selectedTicket.college}</span>
                  </div>
                </div>

                <div className="modal-ticket-body">
                  <div className="modal-qr-container">
                    <img src={selectedTicket.qrPlaceholder} alt="QR Pass" className="modal-qr-code" />
                    <span className="modal-ticket-id">{selectedTicket.ticketId}</span>
                    <span className="modal-verification-status">
                      <ShieldCheck size={14} /> SCAN AT CAMPUS GATE
                    </span>
                  </div>

                  <div className="modal-info-grid">
                    <div className="modal-info-item">
                      <span className="modal-info-label">Passholder Name</span>
                      <span className="modal-info-val">{selectedTicket.studentName}</span>
                    </div>

                    <div className="modal-info-item">
                      <span className="modal-info-label">Student Email</span>
                      <span className="modal-info-val">{selectedTicket.studentEmail}</span>
                    </div>

                    <div className="modal-info-item">
                      <span className="modal-info-label">Event Dates</span>
                      <span className="modal-info-val">{selectedTicket.date}</span>
                    </div>

                    <div className="modal-info-item">
                      <span className="modal-info-label">Timings</span>
                      <span className="modal-info-val">{selectedTicket.time}</span>
                    </div>

                    <div className="modal-info-item">
                      <span className="modal-info-label">Pass Price</span>
                      <span className="modal-info-val">{selectedTicket.price}</span>
                    </div>

                    <div className="modal-info-item">
                      <span className="modal-info-label">Registration Status</span>
                      <span className="modal-info-val status-confirmed">
                        <CheckCircle2 size={14} /> {selectedTicket.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="modal-actions-bar">
                  <button className="modal-action-btn secondary" onClick={() => setSelectedTicket(null)}>
                    Back to My Tickets
                  </button>
                  <button 
                    className="modal-action-btn primary"
                    onClick={() => handleDownloadTicketPDF(selectedTicket)}
                    disabled={downloadingTicketId === selectedTicket.registrationId}
                  >
                    {downloadingTicketId === selectedTicket.registrationId ? (
                      <>
                        <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        <span>Generating PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        <span>Download PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default RegisteredTicketsPage;

