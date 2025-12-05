const mongoose = require('mongoose');

// Review Schema - One to Many with User (author), references TMDB movie
const reviewSchema = new mongoose.Schema({
  // Author relationship - Many to One
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // TMDB Movie ID
  movieId: {
    type: Number,
    required: true
  },
  // Movie info cached for quick access
  movieTitle: {
    type: String,
    required: true
  },
  moviePoster: {
    type: String,
    default: ''
  },
  movieYear: {
    type: Number
  },
  // Review content
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Review content is required'],
    minlength: [50, 'Review must be at least 50 characters'],
    maxlength: [5000, 'Review cannot exceed 5000 characters']
  },
  // Rating out of 10
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Rating cannot exceed 10']
  },
  // Spoiler warning
  containsSpoilers: {
    type: Boolean,
    default: false
  },
  // Engagement metrics - Many to Many with Users
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Comments - Embedded One to Many
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Tags for categorization
  tags: [{
    type: String,
    trim: true
  }],
  // Status
  isPublished: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  // For critics - additional fields
  isCriticReview: {
    type: Boolean,
    default: false
  },
  criticScore: {
    type: Number,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Compound index for movie and author (one review per movie per user)
reviewSchema.index({ movieId: 1, author: 1 }, { unique: true });

// Index for searching
reviewSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Index for sorting by movie
reviewSchema.index({ movieId: 1, createdAt: -1 });

// Virtual for likes count
reviewSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Virtual for comments count
reviewSchema.virtual('commentsCount').get(function() {
  return this.comments.length;
});

// Ensure virtuals are included in JSON
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

// Static method to get reviews for a movie
reviewSchema.statics.getMovieReviews = async function(movieId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const reviews = await this.find({ movieId, isPublished: true })
    .populate('author', 'username avatar role criticBadge')
    .sort({ isFeatured: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await this.countDocuments({ movieId, isPublished: true });
  
  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Static method to get user reviews
reviewSchema.statics.getUserReviews = async function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const reviews = await this.find({ author: userId, isPublished: true })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await this.countDocuments({ author: userId, isPublished: true });
  
  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Static method to get average rating for a movie
reviewSchema.statics.getMovieStats = async function(movieId) {
  const stats = await this.aggregate([
    { $match: { movieId, isPublished: true } },
    {
      $group: {
        _id: '$movieId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        criticAverage: {
          $avg: {
            $cond: ['$isCriticReview', '$rating', null]
          }
        }
      }
    }
  ]);
  
  return stats[0] || { averageRating: 0, totalReviews: 0, criticAverage: 0 };
};

module.exports = mongoose.model('Review', reviewSchema);

