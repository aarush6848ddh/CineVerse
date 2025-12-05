import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiHeart, FiMessageCircle, FiAlertTriangle } from 'react-icons/fi';
import { getImageUrl } from '../../services/api';
import './ReviewCard.css';

const ReviewCard = ({ review, compact = false }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRatingClass = (rating) => {
    if (rating >= 7) return 'high';
    if (rating >= 5) return 'mid';
    return 'low';
  };

  return (
    <motion.article 
      className={`review-card ${compact ? 'compact' : ''}`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Movie Info */}
      <Link to={`/details/${review.movieId}`} className="review-movie">
        <div className="review-movie-poster">
          {review.moviePoster ? (
            <img src={getImageUrl(review.moviePoster, 'w185')} alt={review.movieTitle} />
          ) : (
            <div className="poster-placeholder-small">🎬</div>
          )}
        </div>
        <div className="review-movie-info">
          <h4 className="review-movie-title">{review.movieTitle}</h4>
          {review.movieYear && (
            <span className="review-movie-year">{review.movieYear}</span>
          )}
        </div>
      </Link>

      {/* Rating */}
      <div className={`review-rating ${getRatingClass(review.rating)}`}>
        <FiStar />
        <span>{review.rating}/10</span>
      </div>

      {/* Review Content */}
      <div className="review-content">
        <h3 className="review-title">
          {review.containsSpoilers && (
            <span className="spoiler-warning" title="Contains Spoilers">
              <FiAlertTriangle />
            </span>
          )}
          {review.title}
        </h3>
        <p className="review-text">{review.content}</p>
      </div>

      {/* Author */}
      <Link to={`/profile/${review.author._id}`} className="review-author">
        <div className="review-author-avatar">
          {review.author.avatar ? (
            <img src={review.author.avatar} alt={review.author.username} />
          ) : (
            <span>{review.author.username[0].toUpperCase()}</span>
          )}
        </div>
        <div className="review-author-info">
          <span className="review-author-name">
            {review.author.username}
            {review.author.criticBadge && (
              <span className="badge badge-critic">Critic</span>
            )}
          </span>
          <span className="review-date">{formatDate(review.createdAt)}</span>
        </div>
      </Link>

      {/* Engagement */}
      <div className="review-engagement">
        <span className="engagement-item">
          <FiHeart />
          {review.likesCount || review.likes?.length || 0}
        </span>
        <span className="engagement-item">
          <FiMessageCircle />
          {review.commentsCount || review.comments?.length || 0}
        </span>
      </div>

      {/* Tags */}
      {review.tags && review.tags.length > 0 && (
        <div className="review-tags">
          {review.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="review-tag">{tag}</span>
          ))}
        </div>
      )}
    </motion.article>
  );
};

export default ReviewCard;

