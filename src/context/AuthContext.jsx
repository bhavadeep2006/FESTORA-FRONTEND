import React, { createContext, useContext, useState, useEffect } from 'react';
import { userProfile as defaultUserProfile, registeredTickets as defaultTickets, eventsData } from '../data/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('festora_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.error('Failed to parse saved auth state', e);
    }
    return defaultUserProfile;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const savedAuth = localStorage.getItem('festora_is_authenticated');
      if (savedAuth !== null) {
        return JSON.parse(savedAuth);
      }
    } catch (e) {
      console.error('Failed to parse auth state', e);
    }
    return false; // Default to false so user can experience full sign in/out flow
  });

  // Saved Events state
  const [savedEventIds, setSavedEventIds] = useState(() => {
    try {
      const saved = localStorage.getItem('festora_saved_events');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return ['felicity-2026']; // Default sample saved event
  });

  // User Registered Tickets state
  const [userTickets, setUserTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('festora_tickets');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultTickets;
  });

  // User Hosted Events state
  const [hostedEvents, setHostedEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('festora_hosted_events');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'hack-hyd-2026',
        title: 'Hyderabad Inter-College AI Summit',
        category: 'Tech & Hackathons',
        status: 'Published',
        registrationsCount: 128,
        date: 'Apr 25, 2026',
        location: 'IIIT Hyderabad',
        banner: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop'
      },
      {
        id: 'draft-cultural-fest',
        title: 'Spring Acoustic Night',
        category: 'Cultural Fests',
        status: 'Draft',
        registrationsCount: 0,
        date: 'May 02, 2026',
        location: 'CBIT Open Grounds',
        banner: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop'
      }
    ];
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
      const saved = localStorage.getItem('festora_is_organizer_auth');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return false;
  });

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

  const login = async (email, password) => {
    const newUser = {
      ...defaultUserProfile,
      email: email || defaultUserProfile.email,
      name: email ? email.split('@')[0] : defaultUserProfile.name
    };
    setUser(newUser);
    setIsAuthenticated(true);
    return { success: true, user: newUser };
  };

  const organizerLogin = async (email, password) => {
    // Demo Organizer Credentials Validation
    if (email.trim().toLowerCase() === 'organizer@festora.demo' && password === 'Festora@123') {
      const orgUser = {
        name: 'Siddharth Rao',
        email: 'organizer@festora.demo',
        organization: 'IIIT Cultural Council',
        role: 'Head Organizer',
        college: 'IIIT Hyderabad',
        phone: '+91 98765 12345',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'
      };
      setOrganizerUser(orgUser);
      setIsOrganizerAuthenticated(true);
      return { success: true, user: orgUser };
    }
    return { success: false, error: 'Invalid organizer credentials.' };
  };

  const organizerLogout = () => {
    setOrganizerUser(null);
    setIsOrganizerAuthenticated(false);
  };

  const signup = async ({ name, email, password, college, year, phone }) => {
    const newUser = {
      ...defaultUserProfile,
      name,
      email,
      phone: phone || defaultUserProfile.phone,
      college: college || defaultUserProfile.college,
      year: year || defaultUserProfile.year
    };
    setUser(newUser);
    setIsAuthenticated(true);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
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
      login,
      signup,
      logout,
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

