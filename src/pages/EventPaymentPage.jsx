import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { eventsData } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Ticket, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight 
} from 'lucide-react';
import './EventPaymentPage.css';

export const EventPaymentPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, addTicket } = useAuth();

  const event = eventsData.find((e) => e.id === eventId) || eventsData[0];

  // Retrieve transient registration details
  const [regData, setRegData] = useState(() => {
    try {
      const saved = sessionStorage.getItem(`festora_reg_draft_${event.id}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      fullName: user?.name || 'Student Attendee',
      email: user?.email || 'student@university.edu',
      phone: user?.phone || '+91 98765 43210',
      college: user?.college || event.college
    };
  });

  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  const [paymentStatus, setPaymentStatus] = useState('idle'); // 'idle' | 'processing' | 'success' | 'failed'
  const [createdTicket, setCreatedTicket] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Parse Fee Math
  const feeNumber = parseInt((event.price || '299').replace(/[^0-9]/g, ''), 10) || 299;
  const convFee = feeNumber > 0 ? 10 : 0;
  const totalAmount = feeNumber + convFee;

  const handleProcessPayment = (e) => {
    e.preventDefault();
    setPaymentStatus('processing');

    setTimeout(() => {
      // Demo Payment Success check
      const isSuccess = true; // Prototype success flow

      if (isSuccess) {
        const ticketId = `FST-2026-${Math.floor(10000 + Math.random() * 90000)}`;
        const regId = `REG-${Math.floor(100000 + Math.random() * 900000)}`;

        const newTicket = {
          ticketId,
          registrationId: regId,
          eventId: event.id,
          eventTitle: event.title,
          college: event.college,
          location: event.location,
          date: event.date,
          time: event.time,
          ticketType: event.category.toLowerCase().includes('hack') ? 'TEAM HACKER PASS' : 'CONFIRMED PASS',
          price: `₹${totalAmount}`,
          status: 'CONFIRMED',
          paymentStatus: 'Paid',
          badgeColor: '#22C55E',
          banner: event.banner,
          registeredOn: new Date().toLocaleDateString(),
          passholderName: regData.fullName,
          passholderEmail: regData.email,
          qrPlaceholder: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticketId}`
        };

        addTicket(newTicket);
        setCreatedTicket(newTicket);
        setPaymentStatus('success');

        confetti({
          particleCount: 110,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#C4B5FD', '#8B5CF6', '#7C3AED', '#22C55E']
        });
      } else {
        setPaymentStatus('failed');
      }
    }, 1200);
  };

  return (
    <div className="payment-page-view">
      <div className="section-container" style={{ maxWidth: '840px' }}>
        
        {/* SUCCESS STATE */}
        {paymentStatus === 'success' && createdTicket && (
          <motion.div 
            className="payment-result-card success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            <div className="result-icon-circle green">
              <CheckCircle2 size={48} />
            </div>

            <h1 className="result-main-title">✓ Payment Successful</h1>
            <p className="result-main-subtitle">Your event registration has been confirmed!</p>

            <div className="receipt-summary-box">
              <div className="receipt-row">
                <span>Event Title</span>
                <strong>{createdTicket.eventTitle}</strong>
              </div>
              <div className="receipt-row">
                <span>Registration ID</span>
                <code>{createdTicket.registrationId}</code>
              </div>
              <div className="receipt-row">
                <span>Ticket ID</span>
                <code>{createdTicket.ticketId}</code>
              </div>
              <div className="receipt-row">
                <span>Passholder Name</span>
                <strong>{createdTicket.passholderName}</strong>
              </div>
              <div className="receipt-row">
                <span>Amount Paid</span>
                <strong className="green-text">{createdTicket.price}</strong>
              </div>
              <div className="receipt-row">
                <span>Payment Status</span>
                <span className="status-tag confirmed">Paid</span>
              </div>
            </div>

            {/* Digital Ticket Preview */}
            <div className="ticket-qr-preview-card" style={{ marginTop: '24px' }}>
              <img src={createdTicket.qrPlaceholder} alt="Pass QR Code" className="ticket-qr-img" />
              <div className="ticket-qr-meta">
                <span className="ticket-qr-id">{createdTicket.ticketId}</span>
                <span className="ticket-gate-badge"><ShieldCheck size={14} /> VALIDATED AT CAMPUS GATE</span>
              </div>
            </div>

            <div className="result-actions-row">
              <Link to="/tickets" className="auth-btn-primary" style={{ textDecoration: 'none', justifyContent: 'center' }}>
                <Ticket size={18} />
                <span>View Ticket</span>
              </Link>
              <Link to="/tickets" className="auth-btn-google" style={{ textDecoration: 'none', justifyContent: 'center' }}>
                <span>Go to My Tickets</span>
              </Link>
            </div>
          </motion.div>
        )}

        {/* FAILED STATE */}
        {paymentStatus === 'failed' && (
          <motion.div 
            className="payment-result-card failed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="result-icon-circle red">
              <AlertCircle size={48} />
            </div>

            <h1 className="result-main-title red-text">Payment Failed</h1>
            <p className="result-main-subtitle">We couldn't complete your payment. Please try again.</p>

            <div className="result-actions-row" style={{ marginTop: '28px' }}>
              <button className="auth-btn-primary" onClick={() => setPaymentStatus('idle')}>
                <span>Try Again</span>
              </button>
              <Link to={`/events/${event.id}`} className="auth-btn-google" style={{ textDecoration: 'none', justifyContent: 'center' }}>
                <span>Back to Event</span>
              </Link>
            </div>
          </motion.div>
        )}

        {/* PAYMENT FORM STATE */}
        {(paymentStatus === 'idle' || paymentStatus === 'processing') && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            
            <div className="payment-top-bar">
              <Link to={`/register?event=${event.id}`} className="back-btn">
                <ArrowLeft size={16} />
                <span>Back to Registration</span>
              </Link>
            </div>

            <div className="payment-layout-grid">
              
              {/* Left Column: Payment Options */}
              <div className="payment-form-side">
                <div className="payment-card-box">
                  <h2 className="payment-card-title">Select Payment Method</h2>

                  {/* Payment Method Selector Tabs */}
                  <div className="payment-method-selector">
                    <button 
                      type="button" 
                      className={`method-tab ${paymentMethod === 'upi' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('upi')}
                    >
                      <Smartphone size={18} />
                      <span>UPI</span>
                    </button>

                    <button 
                      type="button" 
                      className={`method-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <CreditCard size={18} />
                      <span>Card</span>
                    </button>

                    <button 
                      type="button" 
                      className={`method-tab ${paymentMethod === 'netbanking' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('netbanking')}
                    >
                      <Building2 size={18} />
                      <span>Net Banking</span>
                    </button>
                  </div>

                  <form onSubmit={handleProcessPayment} style={{ marginTop: '20px' }}>
                    
                    {/* UPI Option */}
                    {paymentMethod === 'upi' && (
                      <div className="method-fields-group">
                        <div className="form-group">
                          <label>Enter Virtual Payment Address (VPA / UPI ID)</label>
                          <input 
                            type="text" 
                            placeholder="username@upi / username@okaxis"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            required
                          />
                        </div>
                        <p className="payment-secure-hint">
                          <Lock size={14} /> Encrypted sandbox demo payment transaction.
                        </p>
                      </div>
                    )}

                    {/* Card Option */}
                    {paymentMethod === 'card' && (
                      <div className="method-fields-group">
                        <div className="form-group">
                          <label>Card Number</label>
                          <input 
                            type="text" 
                            placeholder="4532 •••• •••• 8892"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            required
                          />
                        </div>
                        <div className="card-sub-grid">
                          <div className="form-group">
                            <label>Expiry (MM/YY)</label>
                            <input 
                              type="text" 
                              placeholder="08/28"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>CVV</label>
                            <input 
                              type="password" 
                              placeholder="•••"
                              maxLength={4}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="form-group" style={{ marginTop: '12px' }}>
                          <label>Cardholder Name</label>
                          <input 
                            type="text" 
                            placeholder="Name on card"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Net Banking Option */}
                    {paymentMethod === 'netbanking' && (
                      <div className="method-fields-group">
                        <div className="form-group">
                          <label>Select Your Bank</label>
                          <select 
                            value={selectedBank} 
                            onChange={(e) => setSelectedBank(e.target.value)}
                            required
                          >
                            <option value="" disabled>Choose a bank</option>
                            <option value="HDFC">HDFC Bank</option>
                            <option value="ICICI">ICICI Bank</option>
                            <option value="SBI">State Bank of India</option>
                            <option value="AXIS">Axis Bank</option>
                            <option value="KOTAK">Kotak Mahindra Bank</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Pay Action CTA */}
                    <div style={{ marginTop: '28px' }}>
                      <button 
                        type="submit" 
                        className="auth-btn-primary" 
                        disabled={paymentStatus === 'processing'}
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        {paymentStatus === 'processing' ? 'Processing Payment...' : `Pay ₹${totalAmount}`}
                      </button>
                    </div>

                  </form>
                </div>
              </div>

              {/* Right Column: Order Summary Card */}
              <div className="payment-summary-side">
                <div className="summary-card-box">
                  <h3 className="summary-title">Order Summary</h3>

                  <div className="summary-event-mini">
                    <img src={event.banner} alt={event.title} className="summary-event-banner" />
                    <div>
                      <h4 className="summary-event-name">{event.title}</h4>
                      <span className="summary-event-college">{event.college}</span>
                    </div>
                  </div>

                  <div className="summary-divider" />

                  <div className="fee-breakdown-list">
                    <div className="fee-row">
                      <span>Registration Fee</span>
                      <span>₹{feeNumber}</span>
                    </div>
                    {convFee > 0 && (
                      <div className="fee-row">
                        <span>Platform / Convenience Fee</span>
                        <span>₹{convFee}</span>
                      </div>
                    )}
                    <div className="fee-row total">
                      <span>Total Amount</span>
                      <span>₹{totalAmount}</span>
                    </div>
                  </div>

                  <div className="summary-divider" />

                  <div className="attendee-preview-box">
                    <span className="att-label">Passholder Name</span>
                    <span className="att-val">{regData.fullName}</span>
                    <span className="att-email">{regData.email}</span>
                  </div>
                </div>
              </div>

            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
};

export default EventPaymentPage;
