const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Review = require('../models/Review');
const MovieList = require('../models/MovieList');
const Activity = require('../models/Activity');
const { verifyToken, requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/users - Get all users (admin only) or search users
router.get('/', verifyToken, async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('username firstName lastName avatar role criticBadge bio')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users.'
    });
  }
});

// GET /api/users/critics - Get featured critics
router.get('/critics', async (req, res) => {
  try {
    const critics = await User.find({ role: 'critic', isActive: true, criticBadge: true })
      .select('username firstName lastName avatar bio specialization')
      .limit(10)
      .sort({ 'followers.length': -1 });

    res.json({
      success: true,
      critics
    });
  } catch (error) {
    console.error('Get critics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get critics.'
    });
  }
});

// GET /api/users/recent - Get recently joined users
router.get('/recent', async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('username firstName lastName avatar role criticBadge createdAt')
      .limit(10)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get recent users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent users.'
    });
  }
});

// GET /api/users/:id - Get user profile by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar');

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Check if viewing own profile
    const isOwnProfile = req.user && req.user._id.toString() === user._id.toString();
    
    // Get user's reviews
    const reviews = await Review.find({ author: user._id, isPublished: true })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get user's lists
    const lists = await MovieList.getUserLists(user._id, isOwnProfile);

    // Get recent activity
    const activities = await Activity.find({ user: user._id, isPublic: true })
      .sort({ createdAt: -1 })
      .limit(10);

    const profile = isOwnProfile ? user.getFullProfile() : user.getPublicProfile();

    // Add watchlist/favorites for own profile or if privacy allows
    if (isOwnProfile || user.privacySettings.showWatchlist) {
      profile.watchlist = user.watchlist;
    }
    if (isOwnProfile || user.privacySettings.showFavorites) {
      profile.favorites = user.favorites;
    }

    // Check if current user is following this user
    let isFollowing = false;
    if (req.user && !isOwnProfile) {
      isFollowing = user.followers.some(f => f._id.toString() === req.user._id.toString());
    }

    res.json({
      success: true,
      profile,
      reviews,
      lists: lists.slice(0, 5),
      activities,
      isOwnProfile,
      isFollowing
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile.'
    });
  }
});

// PUT /api/users/profile - Update own profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const allowedFields = [
      'firstName', 'lastName', 'bio', 'avatar', 'location', 
      'website', 'phone', 'dateOfBirth', 'specialization', 'privacySettings'
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Username cannot be changed
    if (req.body.username) {
      return res.status(400).json({
        success: false,
        message: 'Username cannot be changed.'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: user.getFullProfile()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update profile.'
    });
  }
});

// POST /api/users/:id/follow - Follow/unfollow user
router.post('/:id/follow', requireAuth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    
    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself.'
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser || !targetUser.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const currentUser = await User.findById(req.user._id);
    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(req.user._id);
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(req.user._id);

      // Create activity
      await Activity.createActivity({
        user: req.user._id,
        type: 'user_followed',
        targetType: 'User',
        targetId: targetUserId,
        metadata: {
          targetUsername: targetUser.username
        }
      });
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      success: true,
      isFollowing: !isFollowing,
      message: isFollowing ? 'Unfollowed successfully.' : 'Following successfully.'
    });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update follow status.'
    });
  }
});

// POST /api/users/watchlist/:movieId - Add/remove from watchlist
router.post('/watchlist/:movieId', requireAuth, async (req, res) => {
  try {
    const movieId = parseInt(req.params.movieId);
    const { movieTitle, moviePoster } = req.body;

    const user = await User.findById(req.user._id);
    const existingIndex = user.watchlist.findIndex(m => m.movieId === movieId);

    if (existingIndex > -1) {
      // Remove from watchlist
      user.watchlist.splice(existingIndex, 1);
    } else {
      // Add to watchlist
      user.watchlist.push({
        movieId,
        addedAt: new Date()
      });

      // Create activity
      await Activity.createActivity({
        user: req.user._id,
        type: 'movie_watchlisted',
        targetType: 'Movie',
        movieId,
        metadata: { movieTitle, moviePoster }
      });
    }

    await user.save();

    res.json({
      success: true,
      inWatchlist: existingIndex === -1,
      message: existingIndex > -1 ? 'Removed from watchlist.' : 'Added to watchlist.'
    });
  } catch (error) {
    console.error('Watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update watchlist.'
    });
  }
});

// POST /api/users/favorites/:movieId - Add/remove from favorites
router.post('/favorites/:movieId', requireAuth, async (req, res) => {
  try {
    const movieId = parseInt(req.params.movieId);
    const { movieTitle, moviePoster } = req.body;

    const user = await User.findById(req.user._id);
    const existingIndex = user.favorites.findIndex(m => m.movieId === movieId);

    if (existingIndex > -1) {
      // Remove from favorites
      user.favorites.splice(existingIndex, 1);
    } else {
      // Add to favorites
      user.favorites.push({
        movieId,
        addedAt: new Date()
      });

      // Create activity
      await Activity.createActivity({
        user: req.user._id,
        type: 'movie_favorited',
        targetType: 'Movie',
        movieId,
        metadata: { movieTitle, moviePoster }
      });
    }

    await user.save();

    res.json({
      success: true,
      isFavorite: existingIndex === -1,
      message: existingIndex > -1 ? 'Removed from favorites.' : 'Added to favorites.'
    });
  } catch (error) {
    console.error('Favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update favorites.'
    });
  }
});

// GET /api/users/:id/followers - Get user's followers
router.get('/:id/followers', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username avatar firstName lastName role criticBadge');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.json({
      success: true,
      followers: user.followers
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get followers.'
    });
  }
});

// GET /api/users/:id/following - Get users the user is following
router.get('/:id/following', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'username avatar firstName lastName role criticBadge');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.json({
      success: true,
      following: user.following
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get following.'
    });
  }
});

// GET /api/users/:id/reviews - Get user's reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await Review.getUserReviews(req.params.id, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reviews.'
    });
  }
});

// DELETE /api/users/:id - Deactivate user (admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully.'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user.'
    });
  }
});

module.exports = router;

