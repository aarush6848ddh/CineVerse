import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiCalendar } from 'react-icons/fi';
import { getImageUrl } from '../../services/api';
import './MovieCard.css';

const MovieCard = ({ movie, index = 0, showRank = false }) => {
  const releaseYear = movie.release_date?.split('-')[0];
  const rating = movie.vote_average?.toFixed(1);

  const getRatingClass = (rating) => {
    if (rating >= 7) return 'high';
    if (rating >= 5) return 'mid';
    return 'low';
  };

  return (
    <motion.article 
      className="movie-card"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/details/${movie.id}`} className="movie-card-link">
        {showRank && index < 10 && (
          <span className="movie-rank">#{index + 1}</span>
        )}
        <div className="movie-poster">
          {movie.poster_path ? (
            <img 
              src={getImageUrl(movie.poster_path, 'w342')} 
              alt={movie.title}
              loading="lazy"
            />
          ) : (
            <div className="poster-placeholder">
              <span>🎬</span>
              <span className="placeholder-text">No Poster</span>
            </div>
          )}
          <div className="movie-poster-overlay">
            <span className="view-details">View Details</span>
          </div>
        </div>
        <div className="movie-info">
          <h3 className="movie-title" title={movie.title}>
            {movie.title}
          </h3>
          <div className="movie-meta">
            {releaseYear && (
              <span className="movie-year">
                <FiCalendar />
                {releaseYear}
              </span>
            )}
            {rating && rating > 0 && (
              <span className={`movie-rating ${getRatingClass(movie.vote_average)}`}>
                <FiStar />
                {rating}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default MovieCard;

