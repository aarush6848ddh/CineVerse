const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema - supports multiple roles: viewer, critic, admin
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['viewer', 'critic', 'admin'],
    default: 'viewer'
  },
  // Profile Information
  firstName: {
    type: String,
    trim: true,
    default: ''
  },
  lastName: {
    type: String,
    trim: true,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  // Private fields - only visible to the user themselves
  phone: {
    type: String,
    default: ''
  },
  dateOfBirth: {
    type: Date
  },
  // Critic-specific fields
  criticBadge: {
    type: Boolean,
    default: false
  },
  criticSince: {
    type: Date
  },
  specialization: {
    type: [String], // e.g., ['Horror', 'Sci-Fi', 'Drama']
    default: []
  },
  // Social connections - Many to Many relationships
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Watchlist - One to Many with Movie references
  watchlist: [{
    movieId: {
      type: Number, // TMDB movie ID
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Favorites
  favorites: [{
    movieId: {
      type: Number,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Privacy settings
  privacySettings: {
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false },
    showDateOfBirth: { type: Boolean, default: false },
    showWatchlist: { type: Boolean, default: true },
    showFavorites: { type: Boolean, default: true }
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get public profile (hide sensitive info)
userSchema.methods.getPublicProfile = function() {
  const profile = {
    _id: this._id,
    username: this.username,
    role: this.role,
    firstName: this.firstName,
    lastName: this.lastName,
    bio: this.bio,
    avatar: this.avatar,
    location: this.location,
    website: this.website,
    criticBadge: this.criticBadge,
    specialization: this.specialization,
    followersCount: this.followers.length,
    followingCount: this.following.length,
    createdAt: this.createdAt
  };

  if (this.privacySettings.showWatchlist) {
    profile.watchlistCount = this.watchlist.length;
  }
  if (this.privacySettings.showFavorites) {
    profile.favoritesCount = this.favorites.length;
  }

  return profile;
};

// Get full profile (for the user themselves)
userSchema.methods.getFullProfile = function() {
  return {
    _id: this._id,
    username: this.username,
    email: this.email,
    role: this.role,
    firstName: this.firstName,
    lastName: this.lastName,
    bio: this.bio,
    avatar: this.avatar,
    location: this.location,
    website: this.website,
    phone: this.phone,
    dateOfBirth: this.dateOfBirth,
    criticBadge: this.criticBadge,
    criticSince: this.criticSince,
    specialization: this.specialization,
    followers: this.followers,
    following: this.following,
    watchlist: this.watchlist,
    favorites: this.favorites,
    privacySettings: this.privacySettings,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    lastLogin: this.lastLogin
  };
};

// Index for search
userSchema.index({ username: 'text', firstName: 'text', lastName: 'text' });

module.exports = mongoose.model('User', userSchema);

