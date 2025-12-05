import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiPlay, FiTrendingUp, FiStar, FiClock, FiCalendar, 
  FiArrowRight, FiBookmark, FiHeart 
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { movieApi, reviewApi, userApi, getImageUrl } from '../services/api';
import MovieCard from '../components/movies/MovieCard';
import ReviewCard from '../components/reviews/ReviewCard';
import './Home.css';

const Home = () => {
  const { user, isAuthenticated, updateWatchlist } = useAuth();
  const navigate = useNavigate();
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trending');

  const handleAddToWatchlist = async () => {
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    try {
      const response = await userApi.addToWatchlist(
        featuredMovie.id,
        featuredMovie.title,
        featuredMovie.poster_path
      );
      updateWatchlist(featuredMovie.id, response.data.inWatchlist);
    } catch (error) {
      console.error('Failed to update watchlist:', error);
    }
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [trending, popular, topRated, upcoming, reviews, users] = await Promise.all([
          movieApi.getTrending('day'),
          movieApi.getPopular(),
          movieApi.getTopRated(),
          movieApi.getUpcoming(),
          reviewApi.getRecent(1, 6),
          userApi.getRecentUsers()
        ]);

        setTrendingMovies(trending.data.movies || []);
        setPopularMovies(popular.data.movies || []);
        setTopRatedMovies(topRated.data.movies || []);
        setUpcomingMovies(upcoming.data.movies || []);
        setRecentReviews(reviews.data.reviews || []);
        setRecentUsers(users.data.users || []);

        // Set featured movie from trending
        if (trending.data.movies?.length > 0) {
          const featured = trending.data.movies.find(m => m.backdrop_path) || trending.data.movies[0];
          setFeaturedMovie(featured);
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const getDisplayMovies = () => {
    switch (activeTab) {
      case 'trending': return trendingMovies;
      case 'popular': return popularMovies;
      case 'top_rated': return topRatedMovies;
      case 'upcoming': return upcomingMovies;
      default: return trendingMovies;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="home-page">
      {/* Hero Section with Featured Movie */}
      {featuredMovie && (
        <section className="hero-section">
          <div 
            className="hero-backdrop"
            style={{ 
              backgroundImage: `url(${getImageUrl(featuredMovie.backdrop_path, 'w1280')})` 
            }}
          />
          <div className="hero-overlay" />
          <div className="hero-content container">
            <motion.div 
              className="hero-info"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="hero-label">
                <FiTrendingUp /> Trending Now
              </span>
              <h1 className="hero-title">{featuredMovie.title}</h1>
              <p className="hero-overview">{featuredMovie.overview}</p>
              <div className="hero-meta">
                <span className="hero-rating">
                  <FiStar /> {featuredMovie.vote_average?.toFixed(1)}
                </span>
                <span className="hero-year">
                  <FiCalendar /> {featuredMovie.release_date?.split('-')[0]}
                </span>
              </div>
              <div className="hero-actions">
                <Link to={`/details/${featuredMovie.id}`} className="btn btn-primary btn-lg">
                  <FiPlay /> View Details
                </Link>
                <button className="btn btn-secondary btn-lg" onClick={handleAddToWatchlist}>
                  <FiBookmark /> Add to Watchlist
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Personalized Section for Logged-in Users */}
      {isAuthenticated && user && (
        <section className="section user-section">
          <div className="container">
            <div className="user-welcome">
              <motion.div 
                className="welcome-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2>Welcome back, {user.firstName || user.username}! 🎬</h2>
                <p>Continue exploring your movie journey</p>
                <div className="user-stats">
                  <div className="stat-item">
                    <span className="stat-value">{user.watchlist?.length || 0}</span>
                    <span className="stat-label">Watchlist</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{user.favorites?.length || 0}</span>
                    <span className="stat-label">Favorites</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{user.following?.length || 0}</span>
                    <span className="stat-label">Following</span>
                  </div>
                </div>
                <div className="welcome-actions">
                  <Link to="/profile" className="btn btn-secondary">
                    <FiHeart /> My Watchlist
                  </Link>
                  <Link to="/search" className="btn btn-ghost">
                    <FiArrowRight /> Discover More
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Movie Categories Section */}
      <section className="section movies-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Explore Movies</h2>
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'trending' ? 'active' : ''}`}
                onClick={() => setActiveTab('trending')}
              >
                <FiTrendingUp /> Trending
              </button>
              <button 
                className={`tab ${activeTab === 'popular' ? 'active' : ''}`}
                onClick={() => setActiveTab('popular')}
              >
                <FiHeart /> Popular
              </button>
              <button 
                className={`tab ${activeTab === 'top_rated' ? 'active' : ''}`}
                onClick={() => setActiveTab('top_rated')}
              >
                <FiStar /> Top Rated
              </button>
              <button 
                className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setActiveTab('upcoming')}
              >
                <FiClock /> Upcoming
              </button>
            </div>
          </div>

          <motion.div 
            className="movie-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={activeTab}
          >
            {loading ? (
              Array(10).fill(0).map((_, i) => (
                <div key={i} className="movie-card-skeleton skeleton" />
              ))
            ) : (
              getDisplayMovies().slice(0, 10).map((movie, index) => (
                <motion.div key={movie.id} variants={itemVariants}>
                  <MovieCard movie={movie} index={index} />
                </motion.div>
              ))
            )}
          </motion.div>

          <div className="section-footer">
            <Link to={`/search?sort=${activeTab}`} className="btn btn-secondary">
              View All <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Reviews Section */}
      <section className="section reviews-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Latest Reviews</h2>
            <Link to="/search" className="btn btn-ghost">
              See All <FiArrowRight />
            </Link>
          </div>

          <motion.div 
            className="reviews-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {recentReviews.length > 0 ? (
              recentReviews.map((review, index) => (
                <motion.div key={review._id} variants={itemVariants}>
                  <ReviewCard review={review} />
                </motion.div>
              ))
            ) : (
              <div className="empty-state">
                <p>No reviews yet. Be the first to share your thoughts!</p>
                <Link to="/search" className="btn btn-primary">
                  Find a Movie to Review
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Community Section */}
      <section className="section community-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Join Our Community</h2>
          </div>

          <div className="community-grid">
            <div className="community-card">
              <div className="community-icon">🎬</div>
              <h3>Discover Movies</h3>
              <p>Explore thousands of movies from all genres and eras</p>
            </div>
            <div className="community-card">
              <div className="community-icon">✍️</div>
              <h3>Share Reviews</h3>
              <p>Write reviews and share your opinions with other movie lovers</p>
            </div>
            <div className="community-card">
              <div className="community-icon">👥</div>
              <h3>Connect</h3>
              <p>Follow critics and friends to discover their recommendations</p>
            </div>
            <div className="community-card">
              <div className="community-icon">📝</div>
              <h3>Create Lists</h3>
              <p>Curate your own movie lists and share them with the world</p>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="community-cta">
              <h3>Ready to get started?</h3>
              <p>Join thousands of movie enthusiasts today</p>
              <div className="cta-actions">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Create Free Account
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Log In
                </Link>
              </div>
            </div>
          )}

          {/* Recent Members */}
          {recentUsers.length > 0 && (
            <div className="recent-members">
              <h4>Recently Joined</h4>
              <div className="members-list">
                {recentUsers.slice(0, 8).map((member) => (
                  <Link 
                    key={member._id} 
                    to={`/profile/${member._id}`}
                    className="member-avatar"
                    title={member.username}
                  >
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.username} />
                    ) : (
                      <span>{member.username[0].toUpperCase()}</span>
                    )}
                    {member.role === 'critic' && (
                      <span className="critic-badge">★</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Project Info Link */}
      <section className="section project-info-section">
        <div className="container">
          <Link to="/about" className="project-info-link">
            View Project Info, Team Members & GitHub Repository
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

