import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Ticket, Calendar, MapPin, Clock, ArrowRight, X, CheckCircle2, ShieldCheck, Download, Share2 } from 'lucide-react';
import './RegisteredTicketsPage.css';

export const RegisteredTicketsPage = () => {
  const { userTickets, user } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past'

  const filteredTickets = userTickets.filter(t => {
    if (activeTab === 'upcoming') return t.status === 'CONFIRMED' || t.status === 'UPCOMING';
    return t.status === 'PAST' || t.status === 'COMPLETED';
  });

  return (
    <div className="tickets-page-view">
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
              <Ticket size={14} /> MY DIGITAL PASSES ({userTickets.length})
            </span>
            <h1 className="tickets-title">Registered Campus Passes</h1>
            <p className="tickets-subtitle">
              Your confirmed digital entry passes with QR gate verification for Hyderabad university fests.
            </p>

            <div className="dash-tab-bar" style={{ marginTop: '20px', borderBottom: 'none' }}>
              <div className="tab-buttons">
                <button 
                  className={`dash-filter-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                  onClick={() => setActiveTab('upcoming')}
                >
                  Upcoming Passes ({userTickets.filter(t => t.status !== 'PAST').length})
                </button>
                <button 
                  className={`dash-filter-btn ${activeTab === 'past' ? 'active' : ''}`}
                  onClick={() => setActiveTab('past')}
                >
                  Past Events ({userTickets.filter(t => t.status === 'PAST').length})
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tickets Grid / List */}
        {filteredTickets.length === 0 ? (
          <div className="dash-empty-state" style={{ marginTop: '24px' }}>
            <h3>No {activeTab} tickets found</h3>
            <p>Explore upcoming events and register for your passes.</p>
          </div>
        ) : (
          <div className="tickets-grid-list">
            {filteredTickets.map((ticket, idx) => (
              <motion.div
                key={ticket.ticketId}
                className="digital-ticket-card"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileTap={{ scale: 0.985 }}
              >
                {/* Left Ticket Stub Poster Banner */}
                <div className="ticket-banner-stub">
                  <img src={ticket.banner} alt={ticket.eventTitle} className="ticket-banner-img" />
                  <div className="ticket-banner-overlay" />
                  <span className="ticket-type-tag">{ticket.ticketType}</span>
                  <span className="ticket-status-pill" style={{ background: ticket.badgeColor }}>
                    <CheckCircle2 size={12} /> {ticket.status}
                  </span>
                </div>

                {/* Center Ticket Information Body */}
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

                {/* Right Mini QR Preview Code */}
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
                    <span className="modal-college-name">{selectedTicket.college} &bull; {selectedTicket.location}</span>
                  </div>
                </div>

                <div className="modal-ticket-body">
                  {/* QR Code Container */}
                  <div className="modal-qr-container">
                    <img src={selectedTicket.qrPlaceholder} alt="QR Pass" className="modal-qr-code" />
                    <span className="modal-ticket-id">{selectedTicket.ticketId}</span>
                    <span className="modal-verification-status">
                      <ShieldCheck size={14} /> SCAN AT CAMPUS GATE
                    </span>
                  </div>

                  {/* Registered Details */}
                  <div className="modal-info-grid">
                    <div className="modal-info-item">
                      <span className="modal-info-label">Passholder Name</span>
                      <span className="modal-info-val">{user?.name || 'Student Passholder'}</span>
                    </div>

                    <div className="modal-info-item">
                      <span className="modal-info-label">Registered College</span>
                      <span className="modal-info-val">{user?.college || selectedTicket.college}</span>
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
                  <button className="modal-action-btn primary" onClick={() => alert("Downloading digital pass QR...")}>
                    <Download size={16} />
                    <span>Download Pass</span>
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
