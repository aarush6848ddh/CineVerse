import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiStar, FiClock, FiCalendar, FiBookmark, FiHeart,
  FiPlay, FiEdit3, FiMessageCircle, FiChevronRight,
  FiExternalLink, FiCheck
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { movieApi, reviewApi, userApi, getImageUrl } from '../services/api';
import ReviewCard from '../components/reviews/ReviewCard';
import MovieCard from '../components/movies/MovieCard';
import toast from 'react-hot-toast';
import './MovieDetails.css';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateWatchlist, updateFavorites } = useAuth();

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    title: '',
    content: '',
    rating: 7,
    containsSpoilers: false,
    tags: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setLoading(true);
      try {
        const response = await movieApi.getDetails(id);
        setMovie(response.data.movie);
        setReviews(response.data.localReviews || []);
        setStats(response.data.localStats);
        setUserStatus(response.data.userStatus);
      } catch (error) {
        console.error('Error fetching movie:', error);
        if (error.response?.status === 404) {
          navigate('/404');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id, navigate]);

  const handleWatchlist = async () => {
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    try {
      const response = await userApi.addToWatchlist(
        movie.id,
        movie.title,
        movie.poster_path
      );
      setUserStatus(prev => ({ ...prev, inWatchlist: response.data.inWatchlist }));
      updateWatchlist(movie.id, response.data.inWatchlist);
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Failed to update watchlist');
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    try {
      const response = await userApi.addToFavorites(
        movie.id,
        movie.title,
        movie.poster_path
      );
      setUserStatus(prev => ({ ...prev, isFavorite: response.data.isFavorite }));
      updateFavorites(movie.id, response.data.isFavorite);
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    if (!reviewForm.title || !reviewForm.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (reviewForm.content.length < 50) {
      toast.error('Review must be at least 50 characters');
      return;
    }

    setSubmitting(true);
    try {
      const response = await reviewApi.create({
        movieId: movie.id,
        movieTitle: movie.title,
        moviePoster: movie.poster_path,
        movieYear: movie.release_date?.split('-')[0],
        title: reviewForm.title,
        content: reviewForm.content,
        rating: reviewForm.rating,
        containsSpoilers: reviewForm.containsSpoilers,
        tags: reviewForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      });

      setReviews(prev => [response.data.review, ...prev]);
      setUserStatus(prev => ({ ...prev, hasReviewed: true }));
      setShowReviewForm(false);
      setReviewForm({
        title: '',
        content: '',
        rating: 7,
        containsSpoilers: false,
        tags: ''
      });
      toast.success('Review submitted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="movie-details-page">
        <div className="movie-details-loading">
          <div className="loading-spinner" />
          <p>Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="movie-details-page">
        <div className="container">
          <div className="empty-state">
            <h2>Movie not found</h2>
            <Link to="/search" className="btn btn-primary">
              Back to Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const releaseYear = movie.release_date?.split('-')[0];
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null;
  const trailer = movie.videos?.find(v => v.type === 'Trailer');
  const directors = movie.credits?.crew?.filter(c => c.job === 'Director') || [];

  return (
    <div className="movie-details-page">
      {/* Hero Section */}
      <section className="movie-hero">
        <div 
          className="hero-backdrop"
          style={{ backgroundImage: `url(${getImageUrl(movie.backdrop_path, 'w1280')})` }}
        />
        <div className="hero-overlay" />
        
        <div className="hero-content container">
          <div className="movie-poster-wrapper">
            {movie.poster_path ? (
              <img 
                src={getImageUrl(movie.poster_path, 'w500')} 
                alt={movie.title}
                className="movie-poster"
              />
            ) : (
              <div className="poster-placeholder-large">🎬</div>
            )}
          </div>

          <div className="movie-info">
            <h1 className="movie-title">{movie.title}</h1>
            
            {movie.tagline && (
              <p className="movie-tagline">"{movie.tagline}"</p>
            )}

            <div className="movie-meta">
              {releaseYear && (
                <span className="meta-item">
                  <FiCalendar /> {releaseYear}
                </span>
              )}
              {runtime && (
                <span className="meta-item">
                  <FiClock /> {runtime}
                </span>
              )}
              {movie.vote_average > 0 && (
                <span className="meta-item rating">
                  <FiStar /> {movie.vote_average.toFixed(1)}
                </span>
              )}
            </div>

            {movie.genres && movie.genres.length > 0 && (
              <div className="movie-genres">
                {movie.genres.map(genre => (
                  <Link 
                    key={genre.id} 
                    to={`/search?genre=${genre.id}`}
                    className="genre-tag"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="movie-actions">
              <button 
                className={`btn btn-lg ${userStatus?.inWatchlist ? 'btn-secondary active' : 'btn-primary'}`}
                onClick={handleWatchlist}
              >
                {userStatus?.inWatchlist ? <FiCheck /> : <FiBookmark />}
                {userStatus?.inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
              <button 
                className={`btn btn-lg btn-secondary ${userStatus?.isFavorite ? 'active' : ''}`}
                onClick={handleFavorite}
              >
                <FiHeart className={userStatus?.isFavorite ? 'filled' : ''} />
                {userStatus?.isFavorite ? 'Favorited' : 'Favorite'}
              </button>
              {trailer && (
                <a 
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-lg btn-ghost"
                >
                  <FiPlay /> Watch Trailer
                </a>
              )}
            </div>

            {/* Local Stats */}
            {stats && stats.totalReviews > 0 && (
              <div className="local-stats">
                <span className="local-rating">
                  <FiStar />
                  <strong>{stats.averageRating?.toFixed(1)}</strong>
                  <span>Community Rating</span>
                </span>
                <span className="local-reviews">
                  <FiMessageCircle />
                  <strong>{stats.totalReviews}</strong>
                  <span>Reviews</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="movie-content">
        <div className="container">
          {/* Tabs */}
          <div className="content-tabs">
            <button 
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab ${activeTab === 'cast' ? 'active' : ''}`}
              onClick={() => setActiveTab('cast')}
            >
              Cast & Crew
            </button>
            <button 
              className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <div className="overview-main">
                  <h2>Overview</h2>
                  <p className="movie-overview">{movie.overview}</p>

                  {directors.length > 0 && (
                    <div className="movie-crew">
                      <h3>Director{directors.length > 1 ? 's' : ''}</h3>
                      <p>{directors.map(d => d.name).join(', ')}</p>
                    </div>
                  )}
                </div>

                {movie.similar && movie.similar.length > 0 && (
                  <div className="similar-movies">
                    <h3>Similar Movies</h3>
                    <div className="similar-grid">
                      {movie.similar.slice(0, 6).map(similar => (
                        <MovieCard key={similar.id} movie={similar} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'cast' && (
              <div className="cast-tab">
                <h2>Cast</h2>
                <div className="cast-grid">
                  {movie.credits?.cast?.map(person => (
                    <div key={person.id} className="cast-card">
                      <div className="cast-photo">
                        {person.profile_path ? (
                          <img src={getImageUrl(person.profile_path, 'w185')} alt={person.name} />
                        ) : (
                          <span>👤</span>
                        )}
                      </div>
                      <div className="cast-info">
                        <h4>{person.name}</h4>
                        <p>{person.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-tab">
                <div className="reviews-header">
                  <h2>Community Reviews</h2>
                  {isAuthenticated && !userStatus?.hasReviewed && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowReviewForm(!showReviewForm)}
                    >
                      <FiEdit3 /> Write a Review
                    </button>
                  )}
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <motion.form 
                    className="review-form"
                    onSubmit={handleReviewSubmit}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <div className="form-group">
                      <label className="form-label">Rating</label>
                      <div className="rating-input">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <button
                            key={num}
                            type="button"
                            className={`rating-btn ${reviewForm.rating >= num ? 'active' : ''}`}
                            onClick={() => setReviewForm(prev => ({ ...prev, rating: num }))}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Review Title *</label>
                      <input
                        type="text"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Give your review a title"
                        className="form-input"
                        maxLength={200}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Your Review *</label>
                      <textarea
                        value={reviewForm.content}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Share your thoughts about this movie (minimum 50 characters)"
                        className="form-input form-textarea"
                        rows={6}
                        minLength={50}
                        maxLength={5000}
                        required
                      />
                      <span className="char-count">
                        {reviewForm.content.length}/5000
                      </span>
                    </div>

                    <div className="form-group">
                      <label className="form-checkbox">
                        <input
                          type="checkbox"
                          checked={reviewForm.containsSpoilers}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, containsSpoilers: e.target.checked }))}
                        />
                        <span>This review contains spoilers</span>
                      </label>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Tags (comma separated)</label>
                      <input
                        type="text"
                        value={reviewForm.tags}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="e.g., action, suspense, must-watch"
                        className="form-input"
                      />
                    </div>

                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="btn btn-ghost"
                        onClick={() => setShowReviewForm(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={submitting}
                      >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* Reviews List */}
                {reviews.length > 0 ? (
                  <div className="reviews-list">
                    {reviews.map(review => (
                      <ReviewCard key={review._id} review={review} />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">💬</div>
                    <h3 className="empty-state-title">No reviews yet</h3>
                    <p className="empty-state-text">
                      Be the first to share your thoughts about this movie!
                    </p>
                    {!isAuthenticated && (
                      <Link to="/login" className="btn btn-primary">
                        Log in to Write a Review
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MovieDetails;

