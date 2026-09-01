import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { EventCard } from '../components/EventCard/EventCard';
import { Search, Grid, List, RefreshCw, AlertCircle } from 'lucide-react';
import './EventsPage.css';

export const EventsPage = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';
  const searchQueryParam = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [searchQuery, setSearchQuery] = useState(searchQueryParam);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getPublicEvents({ category: selectedCategory });
      setEvents(response.events || []);
    } catch (err) {
      console.error('Failed to load events from backend:', err);
      setError(err.message || 'Unable to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory]);

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      !searchQuery ||
      evt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.college?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.location?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="events-page-view">
      <div className="events-page-header">
        <div className="section-container">
          <span className="eyebrow-tag">Event Directory</span>
          <h1 className="events-page-title">Explore All Campus Events</h1>
          <p className="events-page-desc">
            Discover hackathons, cultural festivals, tech workshops, and sports meets happening across universities nationwide.
          </p>
        </div>
      </div>

      <div className="section-container events-body-container">
        
        {/* Search & Filter Toolbar */}
        <div className="events-toolbar">
          <div className="toolbar-search-input">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by event title, college name, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="toolbar-view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
            <button
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="category-filter-bar">
          <button
            className={`cat-pill-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Events
          </button>
          <button
            className={`cat-pill-btn ${selectedCategory === 'cultural' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('cultural')}
          >
            Cultural
          </button>
          <button
            className={`cat-pill-btn ${selectedCategory === 'tech' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('tech')}
          >
            Hackathon
          </button>
          <button
            className={`cat-pill-btn ${selectedCategory === 'sports' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('sports')}
          >
            Sports
          </button>
          <button
            className={`cat-pill-btn ${selectedCategory === 'workshops' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('workshops')}
          >
            Workshop
          </button>
          <button
            className={`cat-pill-btn ${selectedCategory === 'gaming' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('gaming')}
          >
            Esports
          </button>
        </div>

        {/* Results Counter */}
        <div className="results-count-bar">
          <span>{loading ? 'Loading events...' : `Showing ${filteredEvents.length} events`}</span>
        </div>

        {/* Loading / Error / Empty States */}
        {loading ? (
          <div className="no-results-box" style={{ padding: '60px 20px' }}>
            <RefreshCw size={32} className="spin-icon" style={{ animation: 'spin 1s linear infinite', color: '#8B5CF6' }} />
            <h3 style={{ marginTop: '16px' }}>Fetching Events from Festora Backend</h3>
            <p>Connecting to database...</p>
          </div>
        ) : error ? (
          <div className="no-results-box" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <AlertCircle size={32} color="#EF4444" />
            <h3 style={{ marginTop: '12px', color: '#F87171' }}>Backend Connection Error</h3>
            <p>{error}</p>
            <button className="reset-filter-btn" onClick={fetchEvents} style={{ marginTop: '16px' }}>
              Retry Connection
            </button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="no-results-box">
            <h3>No events found</h3>
            <p>There are currently no published events matching your search criteria.</p>
            <button
              className="reset-filter-btn"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className={`events-display-wrapper ${viewMode}`}>
            {filteredEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default EventsPage;
