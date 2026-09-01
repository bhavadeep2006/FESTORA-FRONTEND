import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
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
  RefreshCw,
  Download,
  Plus,
  AlertCircle,
  Bell,
  User,
  Inbox,
  XCircle,
  QrCode,
  MoreVertical
} from 'lucide-react';
import './OrganizerDashboard.css';

export const OrganizerDashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { organizerUser, organizerLogout, hostedEvents, addHostedEvent, updateOrganizerProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'events' | 'create' | 'registrations' | 'settings'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Real backend data states
  const [dashboardStats, setDashboardStats] = useState({
    total_events: 0,
    published_events: 0,
    draft_events: 0,
    upcoming_events: 0,
    total_registrations: 0,
    total_checked_in: 0
  });
  const [realEvents, setRealEvents] = useState([]);
  const [realRegistrations, setRealRegistrations] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Export Loading & Toast Notification state
  const [exportingEventId, setExportingEventId] = useState(null);
  const [exportAllLoading, setExportAllLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter & Search states for Registrations table
  const [regSearch, setRegSearch] = useState('');
  const [regFilterEvent, setRegFilterEvent] = useState('All');
  const [regFilterStatus, setRegFilterStatus] = useState('All');

  // Notifications & Host Requests states
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const [hostRequests, setHostRequests] = useState([]);
  const [hostRequestFilter, setHostRequestFilter] = useState('All');
  const [selectedHostRequest, setSelectedHostRequest] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.getOrganizerNotifications();
      if (res && res.notifications) {
        setNotifications(res.notifications);
        setUnreadNotifCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.warn('[ORGANIZER] Error fetching notifications:', err);
    }
  };

  const fetchHostRequests = async () => {
    try {
      const res = await api.getOrganizerHostRequests();
      if (res && res.requests) {
        setHostRequests(res.requests);
      }
    } catch (err) {
      console.warn('[ORGANIZER] Error fetching host requests:', err);
    }
  };

  const handleMarkNotifRead = async (notif) => {
    try {
      if (!notif.is_read) {
        await api.markNotificationRead(notif.id);
        fetchNotifications();
      }
      if (notif.reference_type === 'host_event_request') {
        setShowNotifDropdown(false);
        setActiveTab('host-requests');
        if (notif.reference_id) {
          const reqRes = await api.getOrganizerHostRequestById(notif.reference_id).catch(() => null);
          if (reqRes && reqRes.request) {
            setSelectedHostRequest(reqRes.request);
          }
        }
      }
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const handleMarkAllNotifsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  const [hostReqSearch, setHostReqSearch] = useState('');

  const handleApproveHostRequest = async (id) => {
    const req = hostRequests.find(r => r.id === id);
    const eventTitle = req ? req.event_name : `#${id}`;
    if (!window.confirm(`Approve host request for "${eventTitle}" and publish as a live event on Festora?`)) return;

    setUpdatingStatusId(id);
    try {
      const res = await api.approveOrganizerHostRequest(id);
      showToast('success', `✓ Host Request #${id} approved! Published Event #${res.event_id} created.`);
      fetchOrganizerData();
      if (selectedHostRequest && selectedHostRequest.id === id) {
        setSelectedHostRequest(res.request);
      }
    } catch (err) {
      console.error('Error approving host request:', err);
      showToast('error', err.message || 'Failed to approve host request.');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleRejectHostRequest = async (id) => {
    const reason = window.prompt("Enter rejection reason (optional):", "Submission criteria not met.");
    if (reason === null) return;

    setUpdatingStatusId(id);
    try {
      const res = await api.rejectOrganizerHostRequest(id, reason);
      showToast('success', `Host Request #${id} rejected.`);
      fetchOrganizerData();
      if (selectedHostRequest && selectedHostRequest.id === id) {
        setSelectedHostRequest(res.request);
      }
    } catch (err) {
      console.error('Error rejecting host request:', err);
      showToast('error', err.message || 'Failed to reject host request.');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleUpdateHostRequestStatus = async (id, status) => {
    if (status === 'approved') {
      return handleApproveHostRequest(id);
    }
    if (status === 'rejected') {
      return handleRejectHostRequest(id);
    }

    setUpdatingStatusId(id);
    try {
      const res = await api.updateOrganizerHostRequestStatus(id, status);
      showToast('success', `Request #${id} status updated to '${status}'.`);
      fetchHostRequests();
      if (selectedHostRequest && selectedHostRequest.id === id) {
        setSelectedHostRequest(res.request);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      showToast('error', err.message || 'Failed to update request status.');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const fetchOrganizerData = async () => {
    setLoadingData(true);
    try {
      console.log('[ORGANIZER] fetching portal summary and events...');
      const [summaryRes, eventsRes, regsRes] = await Promise.all([
        api.getOrganizerDashboardSummary().catch(() => null),
        api.getOrganizerEvents().catch(() => null),
        api.getAllOrganizerRegistrations().catch(() => null)
      ]);

      if (summaryRes) {
        setDashboardStats(summaryRes);
      }
      if (eventsRes && eventsRes.events) {
        setRealEvents(eventsRes.events);
      }
      if (regsRes && regsRes.registrations) {
        console.log('[ORGANIZER] Registrations fetched:', regsRes.registrations.length);
        setRealRegistrations(regsRes.registrations);
      }

      fetchNotifications();
      fetchHostRequests();
    } catch (err) {
      console.error('[ORGANIZER] Error fetching portal data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchOrganizerData();
  }, []);

  // Excel Export Handler for a Single Event
  const handleExportEventExcel = async (evt) => {
    setExportingEventId(evt.id);
    try {
      // Fetch registrations for this specific event
      const res = await api.getOrganizerEventRegistrations(evt.id);
      const rawRegs = res && res.registrations ? res.registrations : [];

      if (rawRegs.length === 0) {
        showToast('error', `No registrations found for "${evt.title}".`);
        setExportingEventId(null);
        return;
      }

      // Format data into professional spreadsheet rows
      const worksheetData = rawRegs.map((reg, index) => {
        const teamLeaderName = reg.team_members ? (reg.team_members.find(m => m.is_team_leader)?.name || reg.student_name) : reg.student_name;
        const memberNames = reg.team_members ? reg.team_members.map(m => `${m.name} (${m.email})`).join('; ') : reg.student_name;

        const row = {
          'S.No': index + 1,
          'Participant / Leader Name': teamLeaderName,
          'Email': reg.student_email || 'N/A',
          'Phone': reg.student_phone || 'N/A',
          'College': reg.college || 'N/A',
          'Department': reg.department || 'N/A',
          'Year': reg.year_of_study || 'N/A',
          'Event Name': evt.title || 'Campus Event',
          'Registration Type': reg.registration_type ? reg.registration_type.toUpperCase() : 'INDIVIDUAL',
          'Team Name': reg.team_name || 'N/A',
          'Team Members': memberNames,
          'Registration Date': reg.registered_at ? new Date(reg.registered_at).toLocaleString() : 'N/A',
          'Registration Status': (reg.registration_status || 'confirmed').toUpperCase(),
          'Ticket Code': reg.ticket_code || 'N/A',
          'Ticket Status': (reg.ticket_status || 'active').toUpperCase()
        };

        if (Array.isArray(reg.custom_fields_data)) {
          reg.custom_fields_data.forEach(cf => {
            if (cf.field_label) {
              row[cf.field_label] = cf.value || '';
            }
          });
        }

        return row;
      });

      // Create SheetJS Worksheet & Workbook
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

      // Generate sanitized filename: FESTORA_Event_<id>_Registrations.xlsx
      const sanitizedTitle = (evt.title || 'Event').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `FESTORA_Event_${evt.id || sanitizedTitle}_Registrations.xlsx`;

      // Download actual .xlsx binary spreadsheet
      XLSX.writeFile(workbook, filename);
      showToast('success', `Exported ${rawRegs.length} registration(s) to ${filename}`);
    } catch (err) {
      console.error('[EXPORT EXCEL ERROR]:', err);
      showToast('error', 'Unable to export registrations. Please try again.');
    } finally {
      setExportingEventId(null);
    }
  };

  // Excel Export Handler for All Registrations
  const handleExportAllRegistrationsExcel = () => {
    if (filteredRegistrations.length === 0) {
      showToast('error', 'No registrations available to export.');
      return;
    }

    setExportAllLoading(true);
    try {
      const worksheetData = filteredRegistrations.map((reg, index) => {
        const row = {
          'S.No': index + 1,
          'Ticket Code / Reg ID': reg.id,
          'Event Name': reg.event,
          'Participant / Leader Name': reg.participant,
          'Team Name': reg.teamName || 'N/A',
          'College': reg.college,
          'Email Address': reg.email,
          'Registration Date': reg.date,
          'Status': reg.status
        };

        if (Array.isArray(reg.customFieldsData)) {
          reg.customFieldsData.forEach(cf => {
            if (cf.field_label) {
              row[cf.field_label] = cf.value || '';
            }
          });
        }

        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'All_Registrations');
      const filename = `FESTORA_All_Registrations_Export_${Date.now()}.xlsx`;

      XLSX.writeFile(workbook, filename);
      showToast('success', `Exported ${filteredRegistrations.length} registration(s) successfully!`);
    } catch (err) {
      console.error('[EXPORT ALL EXCEL ERROR]:', err);
      showToast('error', 'Unable to export registrations. Please try again.');
    } finally {
      setExportAllLoading(false);
    }
  };

  const [createStep, setCreateStep] = useState('form'); // 'form' | 'preview'
  const [editingEventId, setEditingEventId] = useState(null);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [myEventsFilter, setMyEventsFilter] = useState('All'); // 'All' | 'published' | 'draft' | 'closed'

  const [eventFormData, setEventFormData] = useState({
    title: '',
    category: 'Technical',
    description: '',
    banner: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop',
    college: organizerUser?.college || 'IIIT Hyderabad',
    venue: '',
    city: '',
    date: '',
    startTime: '09:00:00',
    endTime: '18:00:00',
    price: '0.00',
    maxParticipants: '300',
    contactEmail: organizerUser?.email || 'organizer@festora.in',
    contactPhone: organizerUser?.phone || '+91 98765 12345',
    prizePool: '',
    eligibility: '',
    rules: '',
    registrationType: 'individual',
    minTeamSize: 2,
    maxTeamSize: 4,
    customFields: []
  });
  const [createMsg, setCreateMsg] = useState('');
  const [optionInputMap, setOptionInputMap] = useState({});

  // Organizer Profile Settings State
  const [profileForm, setProfileForm] = useState({
    name: organizerUser?.name || 'Siddharth Rao',
    organization: organizerUser?.organization || 'IIIT Cultural Council',
    email: organizerUser?.email || 'organizer@festora.in',
    phone: organizerUser?.phone || '+91 98765 12345',
    college: organizerUser?.college || 'IIIT Hyderabad'
  });
  const [settingsMsg, setSettingsMsg] = useState('');

  const handleLogout = () => {
    organizerLogout();
    navigate('/organizer-login');
  };

  const resetEventForm = () => {
    setEditingEventId(null);
    setEventFormData({
      title: '',
      category: 'Technical',
      description: '',
      banner: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop',
      college: organizerUser?.college || 'IIIT Hyderabad',
      venue: '',
      city: '',
      date: '',
      startTime: '09:00:00',
      endTime: '18:00:00',
      price: '0.00',
      maxParticipants: '300',
      contactEmail: organizerUser?.email || 'organizer@festora.in',
      contactPhone: organizerUser?.phone || '+91 98765 12345',
      prizePool: '',
      eligibility: '',
      rules: '',
      registrationType: 'individual',
      minTeamSize: 2,
      maxTeamSize: 4,
      customFields: []
    });
  };

  const handleAddCustomField = () => {
    setEventFormData({
      ...eventFormData,
      customFields: [
        ...eventFormData.customFields,
        {
          id: `field_${Date.now()}`,
          field_label: '',
          field_type: 'Short Text',
          is_required: false,
          placeholder: '',
          options: []
        }
      ]
    });
  };

  const handleUpdateCustomField = (index, key, val) => {
    const updated = [...eventFormData.customFields];
    updated[index][key] = val;
    setEventFormData({ ...eventFormData, customFields: updated });
  };

  const handleDeleteCustomField = (index) => {
    setEventFormData({
      ...eventFormData,
      customFields: eventFormData.customFields.filter((_, i) => i !== index)
    });
  };

  const handleAddCustomFieldOption = (fieldIndex) => {
    const text = optionInputMap[fieldIndex];
    if (!text || !text.trim()) return;
    const updated = [...eventFormData.customFields];
    const currentOpts = updated[fieldIndex].options || [];
    updated[fieldIndex].options = [...currentOpts, text.trim()];
    setEventFormData({ ...eventFormData, customFields: updated });
    setOptionInputMap({ ...optionInputMap, [fieldIndex]: '' });
  };

  const handleDeleteCustomFieldOption = (fieldIndex, optionIndex) => {
    const updated = [...eventFormData.customFields];
    updated[fieldIndex].options = updated[fieldIndex].options.filter((_, i) => i !== optionIndex);
    setEventFormData({ ...eventFormData, customFields: updated });
  };

  const handleStartEditEvent = (evt) => {
    setEditingEventId(evt.id);
    let formattedDate = '';
    if (evt.event_date) {
      const d = new Date(evt.event_date);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toISOString().split('T')[0];
      } else {
        formattedDate = evt.event_date;
      }
    }
    setEventFormData({
      title: evt.title || '',
      category: evt.category || 'Technical',
      description: evt.description || '',
      banner: evt.poster_url || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop',
      college: evt.college_or_organization || organizerUser?.college || 'IIIT Hyderabad',
      venue: evt.venue && evt.venue !== 'TBA' ? evt.venue : '',
      city: evt.city && evt.city !== 'TBA' ? evt.city : '',
      date: formattedDate,
      startTime: evt.start_time || '09:00:00',
      endTime: evt.end_time || '18:00:00',
      price: evt.registration_fee !== undefined ? evt.registration_fee.toString() : '0.00',
      maxParticipants: evt.max_participants !== undefined ? evt.max_participants.toString() : '300',
      contactEmail: evt.contact_email || organizerUser?.email || '',
      contactPhone: evt.contact_phone || organizerUser?.phone || '',
      prizePool: evt.prize_pool || '',
      eligibility: evt.eligibility || '',
      rules: evt.rules || '',
      registrationType: evt.registration_type || 'individual',
      minTeamSize: evt.min_team_size || 2,
      maxTeamSize: evt.max_team_size || 4,
      customFields: evt.custom_fields || []
    });
    setCreateMsg('');
    setActiveTab('create');
  };

  const handleDeleteOrganizerEvent = async (id) => {
    if (!window.confirm(`Are you sure you want to delete Event #${id}?`)) return;
    try {
      await api.deleteOrganizerEvent(id);
      showToast('success', 'Event deleted successfully.');
      fetchOrganizerData();
    } catch (err) {
      console.error('Error deleting event:', err);
      showToast('error', err.message || 'Failed to delete event.');
    }
  };

  const handlePublishDraftDirect = async (id) => {
    try {
      await api.publishOrganizerEvent(id);
      showToast('success', 'Event published successfully.');
      fetchOrganizerData();
    } catch (err) {
      console.error('Error publishing draft:', err);
      showToast('error', err.message || 'Failed to publish event.');
    }
  };

  const formattedRegistrationsList = realRegistrations.map(r => ({
    id: r.ticket_code || `REG-${r.registration_id}`,
    event: r.event_title || 'Campus Event',
    participant: r.student_name,
    college: r.college || 'University',
    email: r.student_email,
    date: r.registered_at ? new Date(r.registered_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
    status: r.registration_status ? (r.registration_status.charAt(0).toUpperCase() + r.registration_status.slice(1)) : 'Confirmed'
  }));

  const filteredRegistrations = formattedRegistrationsList.filter(r => {
    const matchesSearch = !regSearch || r.participant.toLowerCase().includes(regSearch.toLowerCase()) || r.email.toLowerCase().includes(regSearch.toLowerCase()) || r.college.toLowerCase().includes(regSearch.toLowerCase());
    const matchesEvent = regFilterEvent === 'All' || r.event === regFilterEvent;
    const matchesStatus = regFilterStatus === 'All' || r.status === regFilterStatus;
    return matchesSearch && matchesEvent && matchesStatus;
  });

  const handleSaveEvent = async (statusType = 'published') => {
    if (isSubmittingEvent) return;

    if (statusType === 'published') {
      if (!eventFormData.title || !eventFormData.title.trim()) {
        showToast('error', 'Event title is required to publish.');
        setCreateMsg('Event title is required to publish.');
        return;
      }
      if (!eventFormData.category || !eventFormData.category.trim()) {
        showToast('error', 'Please select a Category before publishing.');
        setCreateMsg('Please select a Category before publishing.');
        return;
      }
      if (!eventFormData.venue || !eventFormData.venue.trim()) {
        showToast('error', 'Venue location is required to publish.');
        setCreateMsg('Venue location is required to publish.');
        return;
      }
      if (!eventFormData.city || !eventFormData.city.trim()) {
        showToast('error', 'City is required to publish.');
        setCreateMsg('City is required to publish.');
        return;
      }
      if (!eventFormData.date) {
        showToast('error', 'Event date is required to publish.');
        setCreateMsg('Event date is required to publish.');
        return;
      }
    } else {
      if (!eventFormData.title || !eventFormData.title.trim()) {
        showToast('error', 'Event title is required to save a draft.');
        setCreateMsg('Event title is required to save a draft.');
        return;
      }
    }

    setIsSubmittingEvent(true);
    try {
      let posterUrl = eventFormData.banner;
      if (!posterUrl || posterUrl.startsWith('blob:')) {
        posterUrl = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop';
      }

      const payload = {
        title: eventFormData.title,
        description: eventFormData.description,
        category: eventFormData.category || 'Technical',
        college_or_organization: eventFormData.college || organizerUser?.college || 'IIIT Hyderabad',
        venue: eventFormData.venue || 'TBA',
        city: eventFormData.city || 'TBA',
        event_date: eventFormData.date || '2026-12-31',
        start_time: eventFormData.startTime || '09:00:00',
        end_time: eventFormData.endTime || '18:00:00',
        registration_fee: parseFloat(eventFormData.price) || 0.00,
        max_participants: parseInt(eventFormData.maxParticipants, 10) || 300,
        poster_url: posterUrl,
        contact_name: organizerUser?.name || 'Organizer Head',
        contact_email: eventFormData.contactEmail || organizerUser?.email || 'organizer@festora.in',
        contact_phone: eventFormData.contactPhone || organizerUser?.phone || '+91 98765 12345',
        prize_pool: eventFormData.prizePool,
        eligibility: eventFormData.eligibility,
        rules: eventFormData.rules,
        status: statusType.toLowerCase(),
        registration_type: eventFormData.registrationType,
        min_team_size: eventFormData.minTeamSize,
        max_team_size: eventFormData.maxTeamSize,
        custom_fields: eventFormData.customFields
      };

      if (editingEventId) {
        if (statusType.toLowerCase() === 'published') {
          await api.publishOrganizerEvent(editingEventId, payload);
          showToast('success', 'Event published successfully.');
          setCreateMsg('✓ Event published successfully!');
        } else {
          await api.updateOrganizerEvent(editingEventId, payload);
          showToast('success', 'Event saved as draft.');
          setCreateMsg('✓ Event saved as draft.');
        }
      } else {
        await api.createOrganizerEvent(payload);
        if (statusType.toLowerCase() === 'published') {
          showToast('success', 'Event published successfully.');
          setCreateMsg('✓ Event published successfully!');
        } else {
          showToast('success', 'Event saved as draft.');
          setCreateMsg('✓ Event saved as draft.');
        }
      }

      fetchOrganizerData();
      resetEventForm();
      setTimeout(() => {
        setCreateMsg('');
        setActiveTab('events');
      }, 900);
    } catch (err) {
      console.error('[SAVE/PUBLISH EVENT ERROR]:', err);
      showToast('error', err.message || 'Failed to save event.');
      setCreateMsg(`Failed: ${err.message}`);
    } finally {
      setIsSubmittingEvent(false);
    }
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

  return (
    <div className="org-dashboard-layout">
      
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
            className={`org-nav-btn ${activeTab === 'host-requests' ? 'active' : ''}`}
            onClick={() => { setActiveTab('host-requests'); setMobileSidebarOpen(false); }}
          >
            <Inbox size={18} />
            <span>Host Requests</span>
            {hostRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="notif-badge-counter" style={{ position: 'relative', top: 0, right: 0, marginLeft: 'auto' }}>
                {hostRequests.filter(r => r.status === 'pending').length}
              </span>
            )}
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
        
        {/* Top Header Bar with Notification Bell */}
        <div className="org-header-top-bar">
          <div>
            <span className="eyebrow-tag"><Sparkles size={14} /> FESTORA CONTROL CENTER</span>
          </div>

          <div className="org-notif-wrapper">
            <button 
              className="org-notif-bell-btn"
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              title="Notifications"
            >
              <Bell size={20} />
              {unreadNotifCount > 0 && (
                <span className="notif-badge-counter">{unreadNotifCount}</span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="notif-popover-card">
                <div className="notif-popover-header">
                  <h4 className="notif-popover-title">Notifications ({notifications.length})</h4>
                  {unreadNotifCount > 0 && (
                    <button className="notif-mark-read-all" onClick={handleMarkAllNotifsRead}>
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="notif-list-scroll">
                  {notifications.length === 0 ? (
                    <div className="notif-empty">No notifications yet.</div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                        onClick={() => handleMarkNotifRead(n)}
                      >
                        <Bell size={16} className="notif-item-icon" />
                        <div style={{ flex: 1 }}>
                          <h5 className="notif-item-title">{n.title}</h5>
                          <p className="notif-item-msg">{n.message}</p>
                          <span className="notif-item-time">
                            {new Date(n.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="org-page-header">
              <div>
                <span className="eyebrow-tag"><ShieldCheck size={14} /> PRIVATE ORGANIZER DASHBOARD</span>
                <h1 className="org-page-title">Welcome back, {organizerUser?.name}</h1>
                <p className="org-page-subtitle">Here is the real-time summary of your hosted campus events and student registrations.</p>
              </div>
              <button className="org-btn-primary" onClick={() => setActiveTab('create')}>
                <Plus size={18} />
                <span>Create New Event</span>
              </button>
            </div>

            {/* Overview Summary 4 Cards Grid */}
            <div className="dashboard-stats-grid">
              <div className="dash-stat-card">
                <div className="stat-icon-wrapper purple"><FileText size={22} /></div>
                <div className="stat-info-col">
                  <span className="dash-stat-num">{dashboardStats.total_events}</span>
                  <span className="dash-stat-label">Total Events</span>
                </div>
              </div>

              <div className="dash-stat-card">
                <div className="stat-icon-wrapper green"><CheckCircle2 size={22} /></div>
                <div className="stat-info-col">
                  <span className="dash-stat-num">{dashboardStats.published_events}</span>
                  <span className="dash-stat-label">Published Events</span>
                </div>
              </div>

              <div className="dash-stat-card">
                <div className="stat-icon-wrapper amber"><Clock size={22} /></div>
                <div className="stat-info-col">
                  <span className="dash-stat-num">{dashboardStats.upcoming_events}</span>
                  <span className="dash-stat-label">Upcoming Events</span>
                </div>
              </div>

              <div className="dash-stat-card">
                <div className="stat-icon-wrapper blue"><Users size={22} /></div>
                <div className="stat-info-col">
                  <span className="dash-stat-num">{dashboardStats.total_registrations}</span>
                  <span className="dash-stat-label">Total Registrations</span>
                </div>
              </div>
            </div>

            {/* Recent Registrations Quick Table Preview */}
            <div className="org-card-box" style={{ marginTop: '32px' }}>
              <div className="org-card-title-row">
                <h3>Recent Student Registrations</h3>
                <button className="btn-action-manage" onClick={() => setActiveTab('registrations')}>
                  <span>View All ({formattedRegistrationsList.length})</span>
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
                    {formattedRegistrationsList.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                          No student registrations found yet.
                        </td>
                      </tr>
                    ) : (
                      formattedRegistrationsList.slice(0, 5).map(r => (
                        <tr key={r.id}>
                          <td><strong>{r.event}</strong></td>
                          <td>{r.participant}</td>
                          <td>{r.college}</td>
                          <td>{r.email}</td>
                          <td>{r.date}</td>
                          <td><span className={`status-tag ${r.status.toLowerCase()}`}>{r.status}</span></td>
                        </tr>
                      ))
                    )}
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
                <p className="org-page-subtitle">View, edit drafts, publish, export Excel, or track student registration counts for your events.</p>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div className="host-tab-toggles">
                  <button className={`tab-toggle-btn ${myEventsFilter === 'All' ? 'active' : ''}`} onClick={() => setMyEventsFilter('All')}>
                    <span>All ({realEvents.length})</span>
                  </button>
                  <button className={`tab-toggle-btn ${myEventsFilter === 'published' ? 'active' : ''}`} onClick={() => setMyEventsFilter('published')}>
                    <span>Published ({realEvents.filter(e => e.status === 'published').length})</span>
                  </button>
                  <button className={`tab-toggle-btn ${myEventsFilter === 'draft' ? 'active' : ''}`} onClick={() => setMyEventsFilter('draft')}>
                    <span>Drafts ({realEvents.filter(e => e.status === 'draft' || !e.status).length})</span>
                  </button>
                </div>

                <button className="org-btn-primary" onClick={() => { resetEventForm(); setActiveTab('create'); }}>
                  <Plus size={18} />
                  <span>Create New Event</span>
                </button>
              </div>
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
                    {realEvents.filter(e => myEventsFilter === 'All' || (e.status || 'draft') === myEventsFilter).length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                          No events found for this status.
                        </td>
                      </tr>
                    ) : (
                      realEvents
                        .filter(e => myEventsFilter === 'All' || (e.status || 'draft') === myEventsFilter)
                        .map(evt => (
                          <tr key={evt.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img 
                                  src={evt.poster_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop'} 
                                  alt={evt.title} 
                                  className="event-thumb-img"
                                />
                                <strong style={{ fontSize: '0.925rem' }}>{evt.title}</strong>
                              </div>
                            </td>
                            <td><span className="dash-cat-label">{evt.category}</span></td>
                            <td>{evt.event_date ? new Date(evt.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}</td>
                            <td>{`${evt.venue || 'Campus Venue'}${evt.city ? ', ' + evt.city : ''}`}</td>
                            <td>
                              <span className={`status-pill-badge ${evt.status === 'published' ? 'approved' : evt.status === 'closed' ? 'rejected' : 'pending'}`}>
                                {evt.status ? (evt.status.charAt(0).toUpperCase() + evt.status.slice(1)) : 'Draft'}
                              </span>
                            </td>
                            <td>
                              <strong style={{ color: 'var(--strong-lavender)', fontSize: '0.95rem' }}>
                                {evt.registration_count || 0}
                              </strong>
                            </td>
                            <td>
                              <div className="dash-event-actions" style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                {/* 1. View Public Event */}
                                <button 
                                  className="dash-action-btn" 
                                  onClick={() => navigate(`/events/${evt.id}`)}
                                  title="View Public Event Details Page"
                                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                >
                                  <Eye size={13} />
                                  <span>View</span>
                                </button>

                                {/* 2. Manage Dashboard & Registrations */}
                                <button 
                                  className="dash-action-btn" 
                                  onClick={() => navigate(`/organizer/events/${evt.id}`)}
                                  title="Manage Event Dashboard & Registrations"
                                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                >
                                  <LayoutDashboard size={13} />
                                  <span>Manage</span>
                                </button>

                                {/* 3. Scan QR Ticket Entry */}
                                <button 
                                  className="dash-action-btn" 
                                  onClick={() => navigate(`/organizer/events/${evt.id}`)}
                                  title="Open Ticket Gate QR Scanner"
                                  style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'rgba(139, 92, 246, 0.12)', color: '#8B5CF6', borderColor: 'rgba(139, 92, 246, 0.3)' }}
                                >
                                  <QrCode size={13} />
                                  <span>Scan QR</span>
                                </button>

                                {/* 4. Export Registrations Excel */}
                                <button 
                                  className="btn-action-export" 
                                  onClick={() => handleExportEventExcel(evt)}
                                  disabled={exportingEventId === evt.id}
                                  title="Download Excel Spreadsheet of Registrations"
                                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                >
                                  {exportingEventId === evt.id ? (
                                    <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
                                  ) : (
                                    <Download size={13} />
                                  )}
                                  <span>Export</span>
                                </button>

                                {/* 5. More Actions Dropdown (⋮) */}
                                <div style={{ position: 'relative' }}>
                                  <button 
                                    className="dash-action-btn" 
                                    onClick={() => setOpenMenuId(openMenuId === evt.id ? null : evt.id)}
                                    title="More Options"
                                    style={{ padding: '6px 8px' }}
                                  >
                                    <MoreVertical size={14} />
                                  </button>

                                  {openMenuId === evt.id && (
                                    <div 
                                      className="action-dropdown-popover" 
                                      style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: '100%',
                                        marginTop: '4px',
                                        background: 'var(--surface-primary)',
                                        border: '1px solid var(--border-card)',
                                        borderRadius: '10px',
                                        padding: '6px',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                                        zIndex: 100,
                                        minWidth: '140px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px'
                                      }}
                                    >
                                      <button 
                                        onClick={() => { setOpenMenuId(null); handleStartEditEvent(evt); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', borderRadius: '6px', fontSize: '0.825rem', width: '100%', textAlign: 'left' }}
                                      >
                                        <Edit3 size={13} />
                                        <span>Edit Event</span>
                                      </button>

                                      {evt.status === 'draft' && (
                                        <button 
                                          onClick={() => { setOpenMenuId(null); handlePublishDraftDirect(evt.id); }}
                                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', color: '#8B5CF6', cursor: 'pointer', borderRadius: '6px', fontSize: '0.825rem', width: '100%', textAlign: 'left' }}
                                        >
                                          <Sparkles size={13} />
                                          <span>Publish Draft</span>
                                        </button>
                                      )}

                                      <button 
                                        onClick={() => { setOpenMenuId(null); handleDeleteOrganizerEvent(evt.id); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', borderRadius: '6px', fontSize: '0.825rem', width: '100%', textAlign: 'left' }}
                                      >
                                        <X size={13} />
                                        <span>Delete Event</span>
                                      </button>
                                    </div>
                                  )}
                                </div>

                              </div>
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

        {/* CREATE / EDIT EVENT TAB */}
        {activeTab === 'create' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="org-page-header">
              <div>
                <span className="eyebrow-tag"><PlusCircle size={14} /> {editingEventId ? `EDITING EVENT #${editingEventId}` : 'PRIVATE ORGANIZER CREATOR'}</span>
                <h1 className="org-page-title">{editingEventId ? `Edit Event: ${eventFormData.title || 'Untitled'}` : 'Create & Publish Event'}</h1>
                <p className="org-page-subtitle">Save progress as draft or publish event live for student registrations.</p>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {editingEventId && (
                  <button className="dash-action-btn" onClick={resetEventForm}>
                    <Plus size={14} />
                    <span>Create New Event</span>
                  </button>
                )}

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
            </div>

            {createMsg && (
              <div className={`auth-alert ${createMsg.startsWith('Failed') ? 'error' : 'success'}`} style={{ marginBottom: '20px' }} role="alert">
                <CheckCircle2 size={18} />
                <span>{createMsg}</span>
              </div>
            )}

            {createStep === 'form' ? (
              <form className="host-form-card" onSubmit={(e) => { e.preventDefault(); handleSaveEvent('published'); }}>
                <div className="host-form-grid">
                  <div className="form-group full-width">
                    <label>Event Name *</label>
                    <input type="text" placeholder="e.g. Hack-Versify 2026" value={eventFormData.title} onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })} required />
                  </div>

                  {/* Event Poster Upload */}
                  <div className="form-group full-width">
                    <label>Event Poster</label>
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
                    <label>Category</label>
                    <select value={eventFormData.category} onChange={(e) => setEventFormData({ ...eventFormData, category: e.target.value })}>
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
                    <label>College / Organization</label>
                    <input type="text" value={eventFormData.college} onChange={(e) => setEventFormData({ ...eventFormData, college: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label>Venue</label>
                    <input type="text" placeholder="e.g. Auditorium Block A" value={eventFormData.venue} onChange={(e) => setEventFormData({ ...eventFormData, venue: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label>City</label>
                    <input type="text" placeholder="e.g. Hyderabad" value={eventFormData.city} onChange={(e) => setEventFormData({ ...eventFormData, city: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label>Date(s)</label>
                    <input type="date" value={eventFormData.date} onChange={(e) => setEventFormData({ ...eventFormData, date: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label>Start Time</label>
                    <input type="text" placeholder="09:00:00" value={eventFormData.startTime} onChange={(e) => setEventFormData({ ...eventFormData, startTime: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label>End Time</label>
                    <input type="text" placeholder="18:00:00" value={eventFormData.endTime} onChange={(e) => setEventFormData({ ...eventFormData, endTime: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label>Registration Fee (₹)</label>
                    <input type="text" placeholder="0.00" value={eventFormData.price} onChange={(e) => setEventFormData({ ...eventFormData, price: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label>Maximum Participants</label>
                    <input type="text" placeholder="300" value={eventFormData.maxParticipants} onChange={(e) => setEventFormData({ ...eventFormData, maxParticipants: e.target.value })} />
                  </div>

                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea rows={3} placeholder="Provide details about your event..." value={eventFormData.description} onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })} />
                  </div>

                  {/* REGISTRATION TYPE & TEAM SETTINGS SECTION */}
                  <div className="form-group full-width" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-card)', padding: '20px', borderRadius: '14px', marginTop: '12px' }}>
                    <label style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                      Registration Type
                    </label>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                      Choose whether participants register individually or as a team.
                    </p>

                    <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600' }}>
                        <input
                          type="radio"
                          name="registrationType"
                          value="individual"
                          checked={eventFormData.registrationType === 'individual'}
                          onChange={() => setEventFormData({ ...eventFormData, registrationType: 'individual' })}
                        />
                        <span>Individual Registration</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600' }}>
                        <input
                          type="radio"
                          name="registrationType"
                          value="team"
                          checked={eventFormData.registrationType === 'team'}
                          onChange={() => setEventFormData({ ...eventFormData, registrationType: 'team' })}
                        />
                        <span>Team Registration</span>
                      </label>
                    </div>

                    {eventFormData.registrationType === 'team' && (
                      <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-card)', marginTop: '12px' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#8B5CF6' }}>Team Settings</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Minimum Team Size</label>
                            <input
                              type="number"
                              min={1}
                              max={50}
                              value={eventFormData.minTeamSize}
                              onChange={(e) => setEventFormData({ ...eventFormData, minTeamSize: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-card)', background: 'var(--surface-card)', color: 'var(--text-primary)' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Maximum Team Size</label>
                            <input
                              type="number"
                              min={1}
                              max={50}
                              value={eventFormData.maxTeamSize}
                              onChange={(e) => setEventFormData({ ...eventFormData, maxTeamSize: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-card)', background: 'var(--surface-card)', color: 'var(--text-primary)' }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CUSTOM REGISTRATION FIELDS SECTION */}
                  <div className="form-group full-width" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-card)', padding: '20px', borderRadius: '14px', marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        Registration Form (Custom Fields)
                      </label>
                      <button
                        type="button"
                        onClick={handleAddCustomField}
                        style={{ background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#8B5CF6', padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        + Add Custom Field
                      </button>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      Add additional information you want participants to provide during registration.
                    </p>

                    {eventFormData.customFields.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
                        No custom registration fields added yet. Default registration fields (Name, Email, College, Phone) will be collected.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {eventFormData.customFields.map((f, fIdx) => (
                          <div key={f.id || fIdx} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#8B5CF6' }}>Custom Field {fIdx + 1}</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomField(fIdx)}
                                style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600' }}
                              >
                                Delete Field
                              </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                              <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Field Label *</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Department, T-shirt Size"
                                  value={f.field_label || ''}
                                  onChange={(e) => handleUpdateCustomField(fIdx, 'field_label', e.target.value)}
                                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-card)', background: 'var(--surface-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                                />
                              </div>

                              <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Field Type</label>
                                <select
                                  value={f.field_type || 'Short Text'}
                                  onChange={(e) => handleUpdateCustomField(fIdx, 'field_type', e.target.value)}
                                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-card)', background: 'var(--surface-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                                >
                                  <option value="Short Text">Short Text</option>
                                  <option value="Long Text">Long Text</option>
                                  <option value="Number">Number</option>
                                  <option value="Email">Email</option>
                                  <option value="Phone">Phone</option>
                                  <option value="Dropdown / Select">Dropdown / Select</option>
                                  <option value="Radio Buttons">Radio Buttons</option>
                                  <option value="Checkbox">Checkbox</option>
                                  <option value="Date">Date</option>
                                </select>
                              </div>
                            </div>

                            {/* Dropdown / Radio Options Manager */}
                            {(f.field_type === 'Dropdown / Select' || f.field_type === 'Radio Buttons' || f.field_type === 'dropdown' || f.field_type === 'radio') && (
                              <div style={{ background: 'var(--surface-card)', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid var(--border-card)' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Options</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                                  {(f.options || []).map((opt, oIdx) => (
                                    <span key={oIdx} style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8B5CF6', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                      {opt}
                                      <button type="button" onClick={() => handleDeleteCustomFieldOption(fIdx, oIdx)} style={{ background: 'none', border: 'none', color: '#8B5CF6', cursor: 'pointer', fontSize: '0.9rem' }}>×</button>
                                    </span>
                                  ))}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <input
                                    type="text"
                                    placeholder="Enter option value"
                                    value={optionInputMap[fIdx] || ''}
                                    onChange={(e) => setOptionInputMap({ ...optionInputMap, [fIdx]: e.target.value })}
                                    style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-card)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleAddCustomFieldOption(fIdx)}
                                    style={{ background: '#8B5CF6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600' }}
                                  >
                                    + Add Option
                                  </button>
                                </div>
                              </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={Boolean(f.is_required)}
                                  onChange={(e) => handleUpdateCustomField(fIdx, 'is_required', e.target.checked)}
                                />
                                <span>☑ Required</span>
                              </label>

                              <input
                                type="text"
                                placeholder="Placeholder text (optional)"
                                value={f.placeholder || ''}
                                onChange={(e) => handleUpdateCustomField(fIdx, 'placeholder', e.target.value)}
                                style={{ width: '50%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-card)', background: 'var(--surface-card)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="host-form-actions" style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                  <button 
                    type="button" 
                    className="btn-secondary-draft" 
                    onClick={() => handleSaveEvent('draft')}
                    disabled={isSubmittingEvent}
                  >
                    {isSubmittingEvent ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                    <span>Save Draft</span>
                  </button>
                  <button 
                    type="button" 
                    className="btn-primary-publish" 
                    onClick={() => handleSaveEvent('published')}
                    disabled={isSubmittingEvent}
                  >
                    {isSubmittingEvent ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={16} />}
                    <span>{editingEventId ? 'Publish Event Changes' : 'Publish Event'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="preview-container-box">
                <h3 className="preview-heading-tag">FESTORA EVENT PREVIEW</h3>
                <div style={{ maxWidth: '360px', margin: '20px auto' }}>
                  <EventCard event={previewData} />
                </div>
                <button className="btn-primary-publish" style={{ display: 'inline-flex', width: 'auto', margin: '20px auto 0 auto' }} onClick={() => handleSaveEvent('published')}>
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

              <button 
                className="btn-action-export" 
                onClick={handleExportAllRegistrationsExcel}
                disabled={exportAllLoading}
                style={{ padding: '10px 18px', fontSize: '0.9rem' }}
              >
                {exportAllLoading ? (
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

            {/* Toolbar search & filters */}
            <div className="events-toolbar" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div className="toolbar-search-input">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search student participant, email, college..." 
                  value={regSearch}
                  onChange={(e) => setRegSearch(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <select className="form-select" value={regFilterStatus} onChange={(e) => setRegFilterStatus(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                  <option value="All">All Statuses</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                </select>

                <button className="dash-action-btn" onClick={fetchOrganizerData} title="Refresh Registrations List">
                  <RefreshCw size={14} style={{ animation: loadingData ? 'spin 1s linear infinite' : 'none' }} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            <div className="org-card-box">
              <div className="org-table-wrapper">
                <table className="org-table">
                  <thead>
                    <tr>
                      <th>REG / TICKET ID</th>
                      <th>EVENT</th>
                      <th>PARTICIPANT</th>
                      <th>COLLEGE</th>
                      <th>EMAIL</th>
                      <th>DATE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                          No registrations found for the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredRegistrations.map(r => (
                        <tr key={r.id}>
                          <td><code>{r.id}</code></td>
                          <td><strong>{r.event}</strong></td>
                          <td>{r.participant}</td>
                          <td>{r.college}</td>
                          <td>{r.email}</td>
                          <td>{r.date}</td>
                          <td><span className={`status-tag ${r.status.toLowerCase()}`}>{r.status}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* HOST REQUESTS TAB */}
        {activeTab === 'host-requests' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="org-page-header">
              <div>
                <span className="eyebrow-tag"><Inbox size={14} /> HOSTING PROPOSALS</span>
                <h1 className="org-page-title">Event Hosting Requests</h1>
                <p className="org-page-subtitle">Review proposals from students and campus organizers requesting to host events on Festora.</p>
              </div>

              <div className="host-tab-toggles">
                <button className={`tab-toggle-btn ${hostRequestFilter === 'All' ? 'active' : ''}`} onClick={() => setHostRequestFilter('All')}>
                  <span>All ({hostRequests.length})</span>
                </button>
                <button className={`tab-toggle-btn ${hostRequestFilter === 'pending' ? 'active' : ''}`} onClick={() => setHostRequestFilter('pending')}>
                  <span>Pending ({hostRequests.filter(r => r.status === 'pending').length})</span>
                </button>
                <button className={`tab-toggle-btn ${hostRequestFilter === 'approved' ? 'active' : ''}`} onClick={() => setHostRequestFilter('approved')}>
                  <span>Approved ({hostRequests.filter(r => r.status === 'approved').length})</span>
                </button>
                <button className={`tab-toggle-btn ${hostRequestFilter === 'rejected' ? 'active' : ''}`} onClick={() => setHostRequestFilter('rejected')}>
                  <span>Rejected ({hostRequests.filter(r => r.status === 'rejected').length})</span>
                </button>
              </div>
            </div>

            {/* Host Requests Search Bar */}
            <div className="events-toolbar" style={{ marginBottom: '20px' }}>
              <div className="toolbar-search-input">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search event name, requester name, college, email, city..." 
                  value={hostReqSearch}
                  onChange={(e) => setHostReqSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="org-card-box">
              <div className="org-table-wrapper">
                <table className="org-table">
                  <thead>
                    <tr>
                      <th>REQ ID</th>
                      <th>APPLICANT</th>
                      <th>COLLEGE / ORG</th>
                      <th>EVENT NAME</th>
                      <th>CATEGORY</th>
                      <th>PROPOSED DATE</th>
                      <th>EXPECTED PARTICIPANTS</th>
                      <th>SUBMITTED</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hostRequests.filter(r => {
                      const matchesStatus = hostRequestFilter === 'All' || r.status === hostRequestFilter;
                      const q = hostReqSearch.toLowerCase().trim();
                      const matchesSearch = !q ||
                        (r.event_name && r.event_name.toLowerCase().includes(q)) ||
                        (r.name && r.name.toLowerCase().includes(q)) ||
                        (r.college_or_organization && r.college_or_organization.toLowerCase().includes(q)) ||
                        (r.email && r.email.toLowerCase().includes(q)) ||
                        (r.city && r.city.toLowerCase().includes(q)) ||
                        (r.category && r.category.toLowerCase().includes(q));
                      return matchesStatus && matchesSearch;
                    }).length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                          No host event requests found matching your query.
                        </td>
                      </tr>
                    ) : (
                      hostRequests
                        .filter(r => {
                          const matchesStatus = hostRequestFilter === 'All' || r.status === hostRequestFilter;
                          const q = hostReqSearch.toLowerCase().trim();
                          const matchesSearch = !q ||
                            (r.event_name && r.event_name.toLowerCase().includes(q)) ||
                            (r.name && r.name.toLowerCase().includes(q)) ||
                            (r.college_or_organization && r.college_or_organization.toLowerCase().includes(q)) ||
                            (r.email && r.email.toLowerCase().includes(q)) ||
                            (r.city && r.city.toLowerCase().includes(q)) ||
                            (r.category && r.category.toLowerCase().includes(q));
                          return matchesStatus && matchesSearch;
                        })
                        .map(r => (
                          <tr key={r.id}>
                            <td><code>#{r.id}</code></td>
                            <td><strong>{r.name}</strong><br /><span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{r.email}</span></td>
                            <td>{r.college_or_organization}</td>
                            <td><strong>{r.event_name}</strong></td>
                            <td><span className="dash-cat-label">{r.category || 'General'}</span></td>
                            <td>{r.preferred_date || 'TBA'}</td>
                            <td>{r.expected_participants || 'Open'}</td>
                            <td>{r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Just now'}</td>
                            <td>
                              <span className={`status-pill-badge ${r.status || 'pending'}`}>
                                {r.status || 'pending'}
                              </span>
                            </td>
                            <td>
                              <button className="dash-action-btn" onClick={() => setSelectedHostRequest(r)} title="Review Full Request Details">
                                <Eye size={14} />
                                <span>View Details</span>
                              </button>
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
                  <input type="password" placeholder="Enter current password" />
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

      {/* SaaS Detail Review Modal for Host Request */}
      {selectedHostRequest && (
        <div className="ticket-modal-backdrop" onClick={() => setSelectedHostRequest(null)}>
          <div className="ticket-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="modal-close-btn" onClick={() => setSelectedHostRequest(null)}>
              <X size={20} />
            </button>

            <div style={{ marginBottom: '20px' }}>
              <span className="eyebrow-tag"><Inbox size={14} /> HOST REQUEST #{selectedHostRequest.id}</span>
              <h2 style={{ fontSize: '1.45rem', marginTop: '6px', marginBottom: '8px' }}>{selectedHostRequest.event_name}</h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={`status-pill-badge ${selectedHostRequest.status || 'pending'}`}>
                  Status: {selectedHostRequest.status ? (selectedHostRequest.status.charAt(0).toUpperCase() + selectedHostRequest.status.slice(1)) : 'Pending'}
                </span>
                {selectedHostRequest.event_id && (
                  <span className="status-pill-badge approved" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' }}>
                    Created Event #{selectedHostRequest.event_id}
                  </span>
                )}
              </div>
            </div>

            {/* Requester Information Card */}
            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--strong-lavender)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} /> REQUESTER INFORMATION
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', background: 'var(--surface-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 700 }}>FULL NAME</p>
                  <p style={{ margin: 0, fontWeight: 700 }}>{selectedHostRequest.name}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 700 }}>EMAIL ADDRESS</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{selectedHostRequest.email}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 700 }}>PHONE NUMBER</p>
                  <p style={{ margin: 0 }}>{selectedHostRequest.phone || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 700 }}>DESIGNATION / ROLE</p>
                  <p style={{ margin: 0 }}>{selectedHostRequest.role || 'Student Organizer'}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 700 }}>COLLEGE / ORGANIZATION</p>
                  <p style={{ margin: 0, fontWeight: 700 }}>{selectedHostRequest.college_or_organization}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 700 }}>CITY</p>
                  <p style={{ margin: 0 }}>{selectedHostRequest.city || 'Hyderabad'}</p>
                </div>
              </div>
            </div>

            {/* Event Information Card */}
            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--strong-lavender)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} /> PROPOSED EVENT DETAILS
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', background: 'var(--surface-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 700 }}>EVENT NAME</p>
                  <p style={{ margin: 0, fontWeight: 700 }}>{selectedHostRequest.event_name}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 700 }}>CATEGORY</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{selectedHostRequest.category || 'Technical'}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 700 }}>PROPOSED DATE(S)</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{selectedHostRequest.preferred_date || 'TBA'}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 700 }}>EXPECTED ATTENDEES</p>
                  <p style={{ margin: 0 }}>{selectedHostRequest.expected_participants || 'Open Entry'}</p>
                </div>
                {selectedHostRequest.social_link && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 700 }}>SOCIAL / WEBSITE LINK</p>
                    <a href={selectedHostRequest.social_link} target="_blank" rel="noreferrer" style={{ color: '#8B5CF6', wordBreak: 'break-all' }}>{selectedHostRequest.social_link}</a>
                  </div>
                )}
              </div>
            </div>

            {selectedHostRequest.event_description && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 700 }}>EVENT DESCRIPTION</p>
                <p style={{ margin: 0, background: 'var(--surface-secondary)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', lineHeight: '1.5', border: '1px solid var(--border-card)' }}>
                  {selectedHostRequest.event_description}
                </p>
              </div>
            )}

            {selectedHostRequest.additional_message && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 700 }}>ADDITIONAL NOTES</p>
                <p style={{ margin: 0, background: 'var(--surface-secondary)', padding: '12px', borderRadius: '8px', fontSize: '0.875rem', border: '1px solid var(--border-card)' }}>
                  {selectedHostRequest.additional_message}
                </p>
              </div>
            )}

            {selectedHostRequest.rejection_reason && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.775rem', color: '#EF4444', fontWeight: 700 }}>REJECTION REASON</p>
                <p style={{ margin: 0, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '12px', borderRadius: '8px', fontSize: '0.875rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  {selectedHostRequest.rejection_reason}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '14px', marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-subtle)' }}>
              <button 
                className="btn-secondary-draft" 
                onClick={() => handleRejectHostRequest(selectedHostRequest.id)}
                disabled={updatingStatusId === selectedHostRequest.id || selectedHostRequest.status === 'rejected'}
                style={{ flex: 1, borderColor: 'rgba(239, 68, 68, 0.4)', color: '#EF4444' }}
              >
                {updatingStatusId === selectedHostRequest.id ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <XCircle size={16} />}
                <span>Reject Request</span>
              </button>

              <button 
                className="btn-primary-publish" 
                onClick={() => handleApproveHostRequest(selectedHostRequest.id)}
                disabled={updatingStatusId === selectedHostRequest.id || selectedHostRequest.status === 'approved'}
                style={{ flex: 1, background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' }}
              >
                {updatingStatusId === selectedHostRequest.id ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={16} />}
                <span>{selectedHostRequest.status === 'approved' ? 'Approved & Published' : 'Approve & Create Event'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrganizerDashboardPage;
