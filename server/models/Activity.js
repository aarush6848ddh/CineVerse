const mongoose = require('mongoose');

// Activity Schema - Tracks user activities for feeds
const activitySchema = new mongoose.Schema({
  // User who performed the action
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Type of activity
  type: {
    type: String,
    enum: [
      'review_created',
      'review_liked',
      'movie_favorited',
      'movie_watchlisted',
      'list_created',
      'list_updated',
      'user_followed',
      'comment_added'
    ],
    required: true
  },
  // Target references - polymorphic
  targetType: {
    type: String,
    enum: ['Review', 'User', 'MovieList', 'Movie'],
    required: true
  },
  // For review/list activities
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetType'
  },
  // For movie activities (TMDB ID)
  movieId: {
    type: Number
  },
  // Cached data for quick display
  metadata: {
    movieTitle: String,
    moviePoster: String,
    reviewTitle: String,
    listTitle: String,
    targetUsername: String
  },
  // Visibility
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for user's activities
activitySchema.index({ user: 1, createdAt: -1 });

// Index for recent public activities
activitySchema.index({ isPublic: 1, createdAt: -1 });

// TTL index - activities older than 90 days are removed
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Static method to get user's feed (activities from people they follow)
activitySchema.statics.getFeed = async function(userId, following, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  const activities = await this.find({
    user: { $in: following },
    isPublic: true
  })
    .populate('user', 'username avatar role criticBadge')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  return activities;
};

// Static method to create activity
activitySchema.statics.createActivity = async function(data) {
  try {
    return await this.create(data);
  } catch (error) {
    console.error('Error creating activity:', error);
    // Don't throw - activities are non-critical
  }
};

module.exports = mongoose.model('Activity', activitySchema);

