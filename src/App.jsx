import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { FestoraLoader } from './components/FestoraLoader/FestoraLoader';
import { Navbar } from './components/Navbar/Navbar';
import { Footer } from './components/Footer/Footer';

import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import RegisterPage from './pages/RegisterPage';
import CollegesPage from './pages/CollegesPage';
import AboutPage from './pages/AboutPage';

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  const handleLoaderComplete = () => {
    setIsLoading(false);
  };

  return (
    <div className="festora-app-root">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <FestoraLoader key="festora-loader" onComplete={handleLoaderComplete} />
        ) : (
          <div key="festora-app-main" className="app-main-layout">
            <Navbar />
            <main className="app-content-body">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<HomePage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/colleges" element={<CollegesPage />} />
                <Route path="/about" element={<AboutPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
