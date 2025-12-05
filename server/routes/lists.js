const express = require('express');
const router = express.Router();
const MovieList = require('../models/MovieList');
const Activity = require('../models/Activity');
const { verifyToken, requireAuth } = require('../middleware/auth');

// GET /api/lists - Get public lists
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const skip = (page - 1) * limit;

    let query = { isPublic: true };
    if (category) {
      query.category = category;
    }

    const lists = await MovieList.find(query)
      .populate('creator', 'username avatar role criticBadge')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MovieList.countDocuments(query);

    res.json({
      success: true,
      lists,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get lists error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get lists.'
    });
  }
});

// GET /api/lists/popular - Get popular lists
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const lists = await MovieList.getPopularLists(parseInt(limit));

    // Populate creator info
    await MovieList.populate(lists, {
      path: 'creator',
      select: 'username avatar role criticBadge'
    });

    res.json({
      success: true,
      lists
    });
  } catch (error) {
    console.error('Get popular lists error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get popular lists.'
    });
  }
});

// GET /api/lists/user/:userId - Get user's lists
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const isOwnLists = req.user && req.user._id.toString() === req.params.userId;
    const lists = await MovieList.getUserLists(req.params.userId, isOwnLists);

    res.json({
      success: true,
      lists
    });
  } catch (error) {
    console.error('Get user lists error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user lists.'
    });
  }
});

// GET /api/lists/:id - Get single list
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const list = await MovieList.findById(req.params.id)
      .populate('creator', 'username avatar role criticBadge')
      .populate('likes', 'username avatar');

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found.'
      });
    }

    // Check if private and not owner
    const isOwner = req.user && req.user._id.toString() === list.creator._id.toString();
    if (!list.isPublic && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'This list is private.'
      });
    }

    // Check if user has liked this list
    let hasLiked = false;
    if (req.user) {
      hasLiked = list.likes.some(l => l._id.toString() === req.user._id.toString());
    }

    res.json({
      success: true,
      list,
      isOwner,
      hasLiked
    });
  } catch (error) {
    console.error('Get list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get list.'
    });
  }
});

// POST /api/lists - Create new list
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, category, isPublic, tags, movies } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'List title is required.'
      });
    }

    const list = new MovieList({
      creator: req.user._id,
      title,
      description: description || '',
      category: category || 'custom',
      isPublic: isPublic !== false,
      tags: tags || [],
      movies: movies || []
    });

    await list.save();
    await list.populate('creator', 'username avatar role criticBadge');

    // Create activity
    await Activity.createActivity({
      user: req.user._id,
      type: 'list_created',
      targetType: 'MovieList',
      targetId: list._id,
      metadata: {
        listTitle: title
      }
    });

    res.status(201).json({
      success: true,
      message: 'List created successfully!',
      list
    });
  } catch (error) {
    console.error('Create list error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create list.'
    });
  }
});

// PUT /api/lists/:id - Update list
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const list = await MovieList.findById(req.params.id);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found.'
      });
    }

    // Check ownership
    if (list.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own lists.'
      });
    }

    const allowedFields = ['title', 'description', 'category', 'isPublic', 'tags', 'coverImage'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        list[field] = req.body[field];
      }
    }

    await list.save();
    await list.populate('creator', 'username avatar role criticBadge');

    // Create activity
    await Activity.createActivity({
      user: req.user._id,
      type: 'list_updated',
      targetType: 'MovieList',
      targetId: list._id,
      metadata: {
        listTitle: list.title
      }
    });

    res.json({
      success: true,
      message: 'List updated successfully.',
      list
    });
  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update list.'
    });
  }
});

// DELETE /api/lists/:id - Delete list
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const list = await MovieList.findById(req.params.id);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found.'
      });
    }

    // Check ownership
    if (list.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own lists.'
      });
    }

    await list.deleteOne();

    res.json({
      success: true,
      message: 'List deleted successfully.'
    });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete list.'
    });
  }
});

// POST /api/lists/:id/movies - Add movie to list
router.post('/:id/movies', requireAuth, async (req, res) => {
  try {
    const { movieId, movieTitle, moviePoster, movieYear, note, rank } = req.body;

    if (!movieId || !movieTitle) {
      return res.status(400).json({
        success: false,
        message: 'Movie ID and title are required.'
      });
    }

    const list = await MovieList.findById(req.params.id);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found.'
      });
    }

    // Check ownership
    if (list.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only add movies to your own lists.'
      });
    }

    // Check if movie already in list
    if (list.movies.some(m => m.movieId === movieId)) {
      return res.status(400).json({
        success: false,
        message: 'Movie already in list.'
      });
    }

    list.movies.push({
      movieId,
      movieTitle,
      moviePoster,
      movieYear,
      note: note || '',
      rank: rank || list.movies.length + 1
    });

    await list.save();

    res.json({
      success: true,
      message: 'Movie added to list.',
      list
    });
  } catch (error) {
    console.error('Add movie to list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add movie to list.'
    });
  }
});

// DELETE /api/lists/:id/movies/:movieId - Remove movie from list
router.delete('/:id/movies/:movieId', requireAuth, async (req, res) => {
  try {
    const list = await MovieList.findById(req.params.id);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found.'
      });
    }

    // Check ownership
    if (list.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only remove movies from your own lists.'
      });
    }

    const movieId = parseInt(req.params.movieId);
    list.movies = list.movies.filter(m => m.movieId !== movieId);
    await list.save();

    res.json({
      success: true,
      message: 'Movie removed from list.',
      list
    });
  } catch (error) {
    console.error('Remove movie from list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove movie from list.'
    });
  }
});

// POST /api/lists/:id/like - Like/unlike list
router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const list = await MovieList.findById(req.params.id);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found.'
      });
    }

    const hasLiked = list.likes.includes(req.user._id);

    if (hasLiked) {
      list.likes.pull(req.user._id);
    } else {
      list.likes.push(req.user._id);
    }

    await list.save();

    res.json({
      success: true,
      hasLiked: !hasLiked,
      likesCount: list.likes.length
    });
  } catch (error) {
    console.error('Like list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update like status.'
    });
  }
});

module.exports = router;

