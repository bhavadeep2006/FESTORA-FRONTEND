import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('festora_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.error('Failed to parse saved user state', e);
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('festora_token');
    return Boolean(token && localStorage.getItem('festora_user'));
  });

  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // User Saved Events state
  const [savedEventIds, setSavedEventIds] = useState(() => {
    try {
      const saved = localStorage.getItem('festora_saved_events');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // User Registered Tickets state
  const [userTickets, setUserTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('festora_tickets');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // User Hosted Events state
  const [hostedEvents, setHostedEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('festora_hosted_events');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Organizer Private Auth State
  const [organizerUser, setOrganizerUser] = useState(() => {
    try {
      const saved = localStorage.getItem('festora_organizer_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  const [isOrganizerAuthenticated, setIsOrganizerAuthenticated] = useState(() => {
    try {
      const orgToken = localStorage.getItem('festora_organizer_token');
      const saved = localStorage.getItem('festora_is_organizer_auth');
      if (saved !== null && orgToken) return JSON.parse(saved);
    } catch (e) {}
    return false;
  });

  // On mount, validate token via GET /api/auth/me if token exists
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('festora_token');
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        return;
      }

      try {
        const data = await api.getMe();
        if (data && data.user) {
          const authUser = {
            id: data.user.id,
            name: data.user.full_name,
            email: data.user.email,
            phone: data.user.phone,
            college: data.user.college,
            year: data.user.year_of_study,
            department: data.user.department,
            avatar: data.user.avatar_url || data.user.avatar
          };
          setUser(authUser);
          setIsAuthenticated(true);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('[Auth] Token validation failed:', err.message);
        logout();
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('festora_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('festora_user');
      }
      localStorage.setItem('festora_is_authenticated', JSON.stringify(isAuthenticated));
      localStorage.setItem('festora_saved_events', JSON.stringify(savedEventIds));
      localStorage.setItem('festora_tickets', JSON.stringify(userTickets));
      localStorage.setItem('festora_hosted_events', JSON.stringify(hostedEvents));

      if (organizerUser) {
        localStorage.setItem('festora_organizer_user', JSON.stringify(organizerUser));
      } else {
        localStorage.removeItem('festora_organizer_user');
      }
      localStorage.setItem('festora_is_organizer_auth', JSON.stringify(isOrganizerAuthenticated));
    } catch (e) {
      console.error('Failed to sync auth state to localStorage', e);
    }
  }, [user, isAuthenticated, savedEventIds, userTickets, hostedEvents, organizerUser, isOrganizerAuthenticated]);

  const setAuthSession = (token, rawUser) => {
    if (token) {
      localStorage.setItem('festora_token', token);
    }
    const formattedUser = {
      id: rawUser.id,
      name: rawUser.full_name || rawUser.name,
      email: rawUser.email,
      phone: rawUser.phone,
      college: rawUser.college,
      year: rawUser.year_of_study || rawUser.year,
      department: rawUser.department,
      avatar: rawUser.avatar_url || rawUser.avatar
    };
    setUser(formattedUser);
    setIsAuthenticated(true);
    return formattedUser;
  };

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.token && res.user) {
      const authUser = setAuthSession(res.token, res.user);
      return { success: true, user: authUser };
    }
    throw new Error(res.message || 'Login failed.');
  };

  const googleLogin = async (credentialOrToken) => {
    const res = await api.verifyGoogleToken(credentialOrToken);
    if (res.token && res.user) {
      const authUser = setAuthSession(res.token, res.user);
      return { success: true, user: authUser };
    }
    throw new Error(res.message || 'Google authentication failed.');
  };

  const register = async (registerData) => {
    const res = await api.register(registerData);
    return res;
  };

  const verifyOtp = async (email, otp) => {
    const res = await api.verifyOtp({ email, otp });
    if (res.token && res.user) {
      const authUser = setAuthSession(res.token, res.user);
      return { success: true, user: authUser, message: res.message };
    }
    throw new Error(res.message || 'Verification failed.');
  };

  const resendOtp = async (email) => {
    const res = await api.resendOtp(email);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('festora_token');
    localStorage.removeItem('festora_user');
    localStorage.removeItem('festora_is_authenticated');
    setUser(null);
    setIsAuthenticated(false);
  };

  const organizerLogin = async (email, password) => {
    try {
      const res = await api.organizerLogin({ email, password });
      if (res.token && res.organizer) {
        localStorage.setItem('festora_organizer_token', res.token);
        const orgUser = {
          id: res.organizer.id,
          name: res.organizer.name,
          email: res.organizer.email,
          organization: res.organizer.organization_name,
          role: 'Head Organizer',
          college: res.organizer.organization_name || 'IIIT Hyderabad',
          phone: res.organizer.phone || '+91 98765 12345',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'
        };
        setOrganizerUser(orgUser);
        setIsOrganizerAuthenticated(true);
        return { success: true, user: orgUser };
      }
      return { success: false, error: res.message || 'Invalid organizer credentials.' };
    } catch (err) {
      const msg = err.data?.message || err.message || 'Organizer login failed.';
      return { success: false, error: msg };
    }
  };

  const organizerLogout = () => {
    localStorage.removeItem('festora_organizer_token');
    localStorage.removeItem('festora_organizer_user');
    localStorage.removeItem('festora_is_organizer_auth');
    setOrganizerUser(null);
    setIsOrganizerAuthenticated(false);
  };

  const updateUserProfile = (updatedData) => {
    setUser(prev => ({
      ...prev,
      ...updatedData
    }));
  };

  const updateOrganizerProfile = (updatedData) => {
    setOrganizerUser(prev => ({
      ...prev,
      ...updatedData
    }));
  };

  const toggleSaveEvent = (eventId) => {
    setSavedEventIds(prev =>
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  const addTicket = (newTicket) => {
    setUserTickets(prev => [newTicket, ...prev]);
  };

  const addHostedEvent = (newEvent) => {
    setHostedEvents(prev => [newEvent, ...prev]);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      login,
      googleLogin,
      register,
      verifyOtp,
      resendOtp,
      logout,
      setAuthSession,
      updateUserProfile,
      savedEventIds,
      toggleSaveEvent,
      userTickets,
      addTicket,
      hostedEvents,
      addHostedEvent,
      organizerUser,
      isOrganizerAuthenticated,
      organizerLogin,
      organizerLogout,
      updateOrganizerProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
