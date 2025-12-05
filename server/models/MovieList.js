const mongoose = require('mongoose');

// MovieList Schema - User-created movie lists
// One to Many relationship with User (creator)
// Many to Many relationship with movies
const movieListSchema = new mongoose.Schema({
  // Creator - Many to One
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // List metadata
  title: {
    type: String,
    required: [true, 'List title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  // Movies in the list - One to Many (embedded)
  movies: [{
    movieId: {
      type: Number,
      required: true
    },
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
    note: {
      type: String,
      maxlength: 200
    },
    rank: {
      type: Number
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Category/type of list
  category: {
    type: String,
    enum: ['favorites', 'watchlist', 'custom', 'ranked', 'genre', 'year'],
    default: 'custom'
  },
  // Privacy
  isPublic: {
    type: Boolean,
    default: true
  },
  // Engagement - Many to Many
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Followers of this list
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Tags
  tags: [{
    type: String,
    trim: true
  }],
  // Cover image
  coverImage: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for user's lists
movieListSchema.index({ creator: 1, createdAt: -1 });

// Index for public lists
movieListSchema.index({ isPublic: 1, createdAt: -1 });

// Text search index
movieListSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for movie count
movieListSchema.virtual('movieCount').get(function() {
  return this.movies.length;
});

// Virtual for likes count
movieListSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

movieListSchema.set('toJSON', { virtuals: true });
movieListSchema.set('toObject', { virtuals: true });

// Static method to get user's lists
movieListSchema.statics.getUserLists = async function(userId, includePrivate = false) {
  const query = { creator: userId };
  if (!includePrivate) {
    query.isPublic = true;
  }
  
  return await this.find(query)
    .sort({ createdAt: -1 })
    .populate('creator', 'username avatar');
};

// Static method to get popular lists
movieListSchema.statics.getPopularLists = async function(limit = 10) {
  return await this.aggregate([
    { $match: { isPublic: true } },
    { $addFields: { likesCount: { $size: '$likes' } } },
    { $sort: { likesCount: -1, createdAt: -1 } },
    { $limit: limit }
  ]);
};

module.exports = mongoose.model('MovieList', movieListSchema);

