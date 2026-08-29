import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventsData, categoriesData } from '../data/mockData';
import { EventCard } from '../components/EventCard/EventCard';
import { Search, Filter, Grid, List } from 'lucide-react';
import './EventsPage.css';

export const EventsPage = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';
  const searchQueryParam = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [searchQuery, setSearchQuery] = useState(searchQueryParam);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const filteredEvents = eventsData.filter((evt) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      evt.categoryId === selectedCategory ||
      evt.category.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesSearch =
      !searchQuery ||
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
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
          <span>Showing {filteredEvents.length} events</span>
        </div>

        {/* Events Grid / List */}
        {filteredEvents.length === 0 ? (
          <div className="no-results-box">
            <h3>No events found</h3>
            <p>Try clearing your search query or selecting a different category filter.</p>
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
