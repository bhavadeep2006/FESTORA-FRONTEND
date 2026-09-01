const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop';

/**
 * Normalizes backend event fields into the structure used by frontend UI components.
 */
export const normalizeEvent = (evt) => {
  if (!evt) return null;

  let formattedDate = 'Upcoming';
  if (evt.event_date) {
    try {
      formattedDate = new Date(evt.event_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      formattedDate = evt.event_date;
    }
  }

  const rawFee = evt.ticket_price ?? evt.registration_fee ?? evt.price;
  let priceLabel = 'Free Entry';
  if (rawFee && Number(rawFee) > 0) {
    priceLabel = `₹${rawFee}`;
  } else if (rawFee && String(rawFee).trim() !== '0' && String(rawFee).trim() !== '0.00') {
    priceLabel = rawFee;
  }

  let rulesList = ['Valid student ID card required at gate.'];
  if (Array.isArray(evt.rules)) {
    rulesList = evt.rules;
  } else if (typeof evt.rules === 'string' && evt.rules.trim()) {
    try {
      const parsed = JSON.parse(evt.rules);
      if (Array.isArray(parsed)) rulesList = parsed;
      else rulesList = [evt.rules];
    } catch (e) {
      rulesList = evt.rules.split('\n').map(r => r.trim()).filter(Boolean);
    }
  }

  return {
    ...evt,
    id: evt.id ? String(evt.id) : evt.id,
    title: evt.title || 'Festora Event',
    category: evt.category || 'General',
    banner: evt.poster_url || evt.banner_url || evt.banner || DEFAULT_BANNER,
    tag: evt.tag || evt.category || 'Featured',
    badgeColor: evt.badgeColor || '#8B5CF6',
    college: evt.college_or_organization || evt.organization_name || evt.college || evt.venue || 'Campus Venue',
    location: evt.city || evt.location || 'Hyderabad',
    date: formattedDate,
    time: evt.time || (evt.start_time ? `${evt.start_time}${evt.end_time ? ' - ' + evt.end_time : ''}` : 'TBA'),
    attendees: evt.attendees || (evt.max_participants ? `${evt.max_participants} Seats` : (evt.max_capacity ? `${evt.max_capacity} Seats` : 'Open Entry')),
    price: priceLabel,
    organizers: evt.college_or_organization || evt.organization_name || evt.organizer_name || evt.organizers || 'Festora Organizer',
    description: evt.description || 'Join us for this exciting campus event on Festora!',
    eligibility: evt.eligibility || 'Open to college students with valid student ID',
    prizes: evt.prizes || evt.prize_pool || 'Exciting Rewards & Certificates',
    rules: rulesList
  };
};

/**
 * Generic fetch wrapper for Festora backend APIs.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const passedHeaders = options.headers || {};
  const existingAuthHeader = passedHeaders['Authorization'] || passedHeaders['authorization'];

  const headers = {
    'Content-Type': 'application/json',
    ...passedHeaders,
  };

  const isOrganizerEndpoint = endpoint.startsWith('/api/organizer');
  const isOrganizerPublicEndpoint = endpoint === '/api/organizer/login';

  if (!existingAuthHeader) {
    if (isOrganizerEndpoint) {
      if (!isOrganizerPublicEndpoint) {
        const orgToken = localStorage.getItem('festora_organizer_token');
        if (orgToken) {
          headers['Authorization'] = `Bearer ${orgToken}`;
        } else {
          console.warn('[FRONTEND REQUEST] Warning: Protected organizer endpoint called but no festora_organizer_token found in localStorage');
        }
      }
    } else {
      const studentToken = localStorage.getItem('festora_token');
      if (studentToken) {
        headers['Authorization'] = `Bearer ${studentToken}`;
      }
    }
  } else {
    headers['Authorization'] = existingAuthHeader;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      const netError = new Error(`Cannot connect to Festora Backend at ${API_BASE_URL}. Ensure server is running.`);
      netError.status = 0;
      throw netError;
    }
    throw error;
  }
}

/**
 * Public & Auth APIs
 */
export const api = {
  // POST /api/auth/register
  register: async (userData) => {
    return await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // POST /api/auth/verify-otp
  verifyOtp: async (data) => {
    return await request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // POST /api/auth/resend-otp
  resendOtp: async (email) => {
    return await request('/api/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  // POST /api/auth/login
  login: async (credentials) => {
    return await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  // GET /api/auth/me
  getMe: async () => {
    return await request('/api/auth/me', {
      method: 'GET'
    });
  },

  // POST /api/auth/forgot-password
  forgotPassword: async (email) => {
    return await request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  // POST /api/auth/reset-password
  resetPassword: async (data) => {
    return await request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Google Auth Helpers
  googleLoginUrl: () => `${API_BASE_URL}/api/auth/google`,

  verifyGoogleToken: async (credentialData) => {
    return await request('/api/auth/google/verify-token', {
      method: 'POST',
      body: JSON.stringify(credentialData)
    });
  },

  // GET /api/events
  getPublicEvents: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.category && filters.category !== 'all') {
      queryParams.append('category', filters.category);
    }
    if (filters.city) {
      queryParams.append('city', filters.city);
    }
    if (filters.date) {
      queryParams.append('date', filters.date);
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const data = await request(`/api/events${queryString}`);
    
    const events = Array.isArray(data.events) 
      ? data.events.map(normalizeEvent) 
      : (Array.isArray(data) ? data.map(normalizeEvent) : []);

    return {
      count: events.length,
      events
    };
  },

  // GET /api/events/:id
  getPublicEventById: async (id) => {
    const data = await request(`/api/events/${id}`);
    const rawEvent = data.event || data;
    return {
      event: normalizeEvent(rawEvent)
    };
  },

  // POST /api/student/events/:eventId/register
  registerForEvent: async (eventId, registrationData = {}) => {
    return await request(`/api/student/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify(registrationData)
    });
  },

  // GET /api/student/my-registrations
  getMyRegistrations: async () => {
    return await request('/api/student/my-registrations', {
      method: 'GET'
    });
  },

  // POST /api/organizer/login
  organizerLogin: async (credentials) => {
    return await request('/api/organizer/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  // GET /api/organizer/me
  getOrganizerMe: async () => {
    const token = localStorage.getItem('festora_organizer_token');
    return await request('/api/organizer/me', {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  // GET /api/organizer/dashboard
  getOrganizerDashboardSummary: async () => {
    const token = localStorage.getItem('festora_organizer_token');
    return await request('/api/organizer/dashboard', {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  // GET /api/organizer/events
  getOrganizerEvents: async () => {
    const token = localStorage.getItem('festora_organizer_token');
    return await request('/api/organizer/events', {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  // POST /api/organizer/events
  createOrganizerEvent: async (eventData) => {
    const organizerToken = localStorage.getItem('festora_organizer_token');
    console.log('[CREATE EVENT FRONTEND] organizer token present:', organizerToken ? 'YES' : 'NO', 'length:', organizerToken ? organizerToken.length : 0);
    console.log('[CREATE EVENT FRONTEND] endpoint: /api/organizer/events');
    return await request('/api/organizer/events', {
      method: 'POST',
      headers: organizerToken ? { Authorization: `Bearer ${organizerToken}` } : {},
      body: JSON.stringify(eventData)
    });
  },

  // PUT /api/organizer/events/:id
  updateOrganizerEvent: async (id, eventData) => {
    const token = localStorage.getItem('festora_organizer_token');
    return await request(`/api/organizer/events/${id}`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(eventData)
    });
  },

  // PUT /api/organizer/events/:id/publish
  publishOrganizerEvent: async (id, eventData = {}) => {
    const token = localStorage.getItem('festora_organizer_token');
    return await request(`/api/organizer/events/${id}/publish`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ ...eventData, status: 'published' })
    });
  },

  // DELETE /api/organizer/events/:id
  deleteOrganizerEvent: async (id) => {
    const token = localStorage.getItem('festora_organizer_token');
    return await request(`/api/organizer/events/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  // GET /api/organizer/registrations-all
  getAllOrganizerRegistrations: async () => {
    const token = localStorage.getItem('festora_organizer_token');
    return await request('/api/organizer/registrations-all', {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  // GET /api/organizer/events/:eventId/registrations
  getOrganizerEventRegistrations: async (eventId) => {
    const token = localStorage.getItem('festora_organizer_token');
    return await request(`/api/organizer/events/${eventId}/registrations`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  // POST /api/organizer/events/:eventId/checkin
  processCheckin: async (eventId, qrToken) => {
    const token = localStorage.getItem('festora_organizer_token');
    return await request(`/api/organizer/events/${eventId}/checkin`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ qr_token: qrToken })
    });
  },

  // GET /api/organizer/events/:eventId/checkins
  getEventCheckins: async (eventId) => {
    const token = localStorage.getItem('festora_organizer_token');
    return await request(`/api/organizer/events/${eventId}/checkins`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  // GET /api/organizer/events/:eventId/attendance
  getEventAttendanceSummary: async (eventId) => {
    const token = localStorage.getItem('festora_organizer_token');
    return await request(`/api/organizer/events/${eventId}/attendance`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  // POST /api/host-event-requests - Public submission
  submitHostEventRequest: async (formData) => {
    return await request('/api/host-event-requests', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  },

  // GET /api/organizer/notifications
  getOrganizerNotifications: async () => {
    const token = localStorage.getItem('festora_organizer_token');
    return await request('/api/organizer/notifications', {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  // PUT /api/organizer/notifications/:id/read
  markNotificationRead: async (id) => {
    const token = localStorage.getItem('festora_organizer_token');
    return await request(`/api/organizer/notifications/${id}/read`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  // PUT /api/organizer/notifications/read-all
  markAllNotificationsRead: async () => {
    const token = localStorage.getItem('festora_organizer_token');
    return await request('/api/organizer/notifications/read-all', {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  // GET /api/organizer/host-event-requests
  getOrganizerHostRequests: async (status = '') => {
    const token = localStorage.getItem('festora_organizer_token');
    const query = status ? `?status=${status}` : '';
    return await request(`/api/organizer/host-event-requests${query}`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  // GET /api/organizer/host-event-requests/:id
  getOrganizerHostRequestById: async (id) => {
    const token = localStorage.getItem('festora_organizer_token');
    return await request(`/api/organizer/host-event-requests/${id}`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  // PUT /api/organizer/host-event-requests/:id/status
  updateOrganizerHostRequestStatus: async (id, status) => {
    const token = localStorage.getItem('festora_organizer_token');
    return await request(`/api/organizer/host-event-requests/${id}/status`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ status })
    });
  },

  // POST /api/host-requests/:id/approve
  approveOrganizerHostRequest: async (id) => {
    const token = localStorage.getItem('festora_organizer_token');
    return await request(`/api/host-requests/${id}/approve`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },

  // POST /api/host-requests/:id/reject
  rejectOrganizerHostRequest: async (id, rejection_reason = '') => {
    const token = localStorage.getItem('festora_organizer_token');
    return await request(`/api/host-requests/${id}/reject`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ rejection_reason })
    });
  }
};

export default api;

