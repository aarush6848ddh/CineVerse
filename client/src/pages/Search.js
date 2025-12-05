import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiFilter, FiX, FiGrid, FiList, 
  FiChevronDown, FiTrendingUp, FiStar, FiCalendar
} from 'react-icons/fi';
import { movieApi, getImageUrl } from '../services/api';
import MovieCard from '../components/movies/MovieCard';
import './Search.css';

const Search = () => {
  const { query: urlQuery } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState(urlQuery || '');
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    sort: searchParams.get('sort') || 'popular',
    genre: searchParams.get('genre') || '',
    year: searchParams.get('year') || '',
    minRating: searchParams.get('minRating') || ''
  });

  const sortOptions = [
    { value: 'popular', label: 'Most Popular', icon: FiTrendingUp },
    { value: 'top_rated', label: 'Top Rated', icon: FiStar },
    { value: 'release_date', label: 'Release Date', icon: FiCalendar },
    { value: 'title', label: 'Title A-Z', icon: null }
  ];

  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

  // Fetch genres on mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await movieApi.getGenres();
        setGenres(response.data.genres || []);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    fetchGenres();
  }, []);

  // Fetch movies based on search or browse
  const fetchMovies = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      let response;

      if (urlQuery) {
        // Search mode
        response = await movieApi.search(urlQuery, page, filters.year || null);
      } else {
        // Browse mode - use discover or category endpoints
        const sortMap = {
          'popular': 'popularity.desc',
          'top_rated': 'vote_average.desc',
          'release_date': 'release_date.desc',
          'title': 'title.asc'
        };

        response = await movieApi.discover({
          page,
          sortBy: sortMap[filters.sort],
          genre: filters.genre || undefined,
          year: filters.year || undefined,
          minRating: filters.minRating || undefined
        });
      }

      if (page === 1) {
        setMovies(response.data.movies || []);
      } else {
        setMovies(prev => [...prev, ...(response.data.movies || [])]);
      }
      
      setTotalResults(response.data.totalResults || response.data.movies?.length || 0);
      setCurrentPage(page);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  }, [urlQuery, filters]);

  // Fetch on URL or filter change
  useEffect(() => {
    setCurrentPage(1);
    fetchMovies(1);
  }, [urlQuery, filters.sort, filters.genre, filters.year, filters.minRating, fetchMovies]);

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search/${encodeURIComponent(searchInput.trim())}`);
    } else {
      navigate('/search');
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      sort: 'popular',
      genre: '',
      year: '',
      minRating: ''
    });
    setSearchParams({});
  };

  // Load more
  const loadMore = () => {
    if (currentPage < totalPages && !loading) {
      fetchMovies(currentPage + 1);
    }
  };

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'popular').length;

  return (
    <div className="search-page">
      <div className="container">
        {/* Search Header */}
        <div className="search-header">
          <h1>
            {urlQuery ? (
              <>
                Results for "<span className="search-query">{urlQuery}</span>"
              </>
            ) : (
              'Discover Movies'
            )}
          </h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search for movies..."
                className="search-input"
              />
              {searchInput && (
                <button 
                  type="button" 
                  className="search-clear"
                  onClick={() => {
                    setSearchInput('');
                    navigate('/search');
                  }}
                >
                  <FiX />
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
        </div>

        {/* Toolbar */}
        <div className="search-toolbar">
          <div className="toolbar-left">
            {totalResults > 0 && (
              <span className="results-count">
                {totalResults.toLocaleString()} movies found
              </span>
            )}
          </div>

          <div className="toolbar-right">
            {/* Filter Toggle */}
            <button 
              className={`toolbar-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="filter-count">{activeFiltersCount}</span>
              )}
            </button>

            {/* View Mode */}
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <FiGrid />
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="filters-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="filters-content">
                {/* Sort By */}
                <div className="filter-group">
                  <label>Sort By</label>
                  <div className="filter-select-wrapper">
                    <select
                      value={filters.sort}
                      onChange={(e) => handleFilterChange('sort', e.target.value)}
                      className="filter-select"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="select-icon" />
                  </div>
                </div>

                {/* Genre */}
                <div className="filter-group">
                  <label>Genre</label>
                  <div className="filter-select-wrapper">
                    <select
                      value={filters.genre}
                      onChange={(e) => handleFilterChange('genre', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All Genres</option>
                      {genres.map(genre => (
                        <option key={genre.id} value={genre.id}>
                          {genre.name}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="select-icon" />
                  </div>
                </div>

                {/* Year */}
                <div className="filter-group">
                  <label>Year</label>
                  <div className="filter-select-wrapper">
                    <select
                      value={filters.year}
                      onChange={(e) => handleFilterChange('year', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All Years</option>
                      {years.map(year => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="select-icon" />
                  </div>
                </div>

                {/* Minimum Rating */}
                <div className="filter-group">
                  <label>Min Rating</label>
                  <div className="filter-select-wrapper">
                    <select
                      value={filters.minRating}
                      onChange={(e) => handleFilterChange('minRating', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">Any Rating</option>
                      <option value="9">9+</option>
                      <option value="8">8+</option>
                      <option value="7">7+</option>
                      <option value="6">6+</option>
                      <option value="5">5+</option>
                    </select>
                    <FiChevronDown className="select-icon" />
                  </div>
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <button className="clear-filters" onClick={clearFilters}>
                    <FiX />
                    Clear Filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className={`search-results ${viewMode}`}>
          {loading && movies.length === 0 ? (
            <div className="movie-grid">
              {Array(12).fill(0).map((_, i) => (
                <div key={i} className="movie-card-skeleton skeleton" />
              ))}
            </div>
          ) : movies.length > 0 ? (
            <>
              <motion.div 
                className={viewMode === 'grid' ? 'movie-grid' : 'movie-list'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {movies.map((movie, index) => (
                  <MovieCard 
                    key={`${movie.id}-${index}`} 
                    movie={movie} 
                    index={index}
                    showRank={filters.sort === 'top_rated'}
                  />
                ))}
              </motion.div>

              {/* Load More */}
              {currentPage < totalPages && (
                <div className="load-more">
                  <button 
                    className="btn btn-secondary"
                    onClick={loadMore}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                  <span className="page-info">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3 className="empty-state-title">No movies found</h3>
              <p className="empty-state-text">
                {urlQuery 
                  ? `We couldn't find any movies matching "${urlQuery}". Try a different search term.`
                  : 'Try adjusting your filters or search for something specific.'
                }
              </p>
              {(urlQuery || activeFiltersCount > 0) && (
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setSearchInput('');
                    clearFilters();
                    navigate('/search');
                  }}
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;

