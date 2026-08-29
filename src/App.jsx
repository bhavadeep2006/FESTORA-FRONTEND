import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { FestoraLoader } from './components/FestoraLoader/FestoraLoader';
import { Navbar } from './components/Navbar/Navbar';
import { Footer } from './components/Footer/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';

import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import RegisterPage from './pages/RegisterPage';
import CollegesPage from './pages/CollegesPage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import RegisteredTicketsPage from './pages/RegisteredTicketsPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HostEventAuthPromptPage from './pages/HostEventAuthPromptPage';
import HostEventPage from './pages/HostEventPage';
import SavedEventsPage from './pages/SavedEventsPage';
import NotFoundPage from './pages/NotFoundPage';

import EventPaymentPage from './pages/EventPaymentPage';

import OrganizerLoginPage from './pages/OrganizerLoginPage';
import OrganizerDashboardPage from './pages/OrganizerDashboardPage';
import OrganizerEventManagementPage from './pages/OrganizerEventManagementPage';

import ScrollToTop from './components/ScrollToTop';

// Helper route for Host an Event flow
const HostEventRoute = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <HostEventAuthPromptPage />;
  }
  return <HostEventPage />;
};

// Private Organizer Protected Route Guard
const ProtectedOrganizerRoute = ({ children }) => {
  const { isOrganizerAuthenticated } = useAuth();
  if (!isOrganizerAuthenticated) {
    return <Navigate to="/organizer-login" replace />;
  }
  return children;
};

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  const handleLoaderComplete = () => {
    setIsLoading(false);
  };

  const isOrganizerPath = location.pathname.startsWith('/organizer');

  return (
    <div className="festora-app-root">
      <ScrollToTop />
      <AnimatePresence mode="wait">
        {isLoading ? (
          <FestoraLoader key="festora-loader" onComplete={handleLoaderComplete} />
        ) : (
          <div key="festora-app-main" className="app-main-layout">
            {!isOrganizerPath && <Navbar />}
            <main className="app-content-body">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<HomePage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                <Route path="/events/:eventId/payment" element={<EventPaymentPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/colleges" element={<CollegesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/tickets" element={<RegisteredTicketsPage />} />
                <Route path="/saved-events" element={<SavedEventsPage />} />
                <Route path="/host-event" element={<HostEventRoute />} />
                <Route path="/host-dashboard" element={<Navigate to="/host-event" replace />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Private Organizer Routes */}
                <Route path="/organizer-login" element={<OrganizerLoginPage />} />
                <Route 
                  path="/organizer/events/:eventId" 
                  element={
                    <ProtectedOrganizerRoute>
                      <OrganizerEventManagementPage />
                    </ProtectedOrganizerRoute>
                  } 
                />
                <Route 
                  path="/organizer/*" 
                  element={
                    <ProtectedOrganizerRoute>
                      <OrganizerDashboardPage />
                    </ProtectedOrganizerRoute>
                  } 
                />

                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            {!isOrganizerPath && <Footer />}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
