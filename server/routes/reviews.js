const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Activity = require('../models/Activity');
const { verifyToken, requireAuth } = require('../middleware/auth');

// GET /api/reviews - Get recent reviews
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, featured } = req.query;
    const skip = (page - 1) * limit;

    let query = { isPublished: true };
    if (featured === 'true') {
      query.isFeatured = true;
    }

    const reviews = await Review.find(query)
      .populate('author', 'username avatar role criticBadge')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reviews.'
    });
  }
});

// GET /api/reviews/movie/:movieId - Get reviews for a movie
router.get('/movie/:movieId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const movieId = parseInt(req.params.movieId);

    const result = await Review.getMovieReviews(movieId, parseInt(page), parseInt(limit));
    const stats = await Review.getMovieStats(movieId);

    res.json({
      success: true,
      ...result,
      stats
    });
  } catch (error) {
    console.error('Get movie reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reviews.'
    });
  }
});

// GET /api/reviews/:id - Get single review
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('author', 'username avatar role criticBadge bio')
      .populate('comments.author', 'username avatar');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.'
      });
    }

    res.json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get review.'
    });
  }
});

// POST /api/reviews - Create review
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      movieId, movieTitle, moviePoster, movieYear,
      title, content, rating, containsSpoilers, tags
    } = req.body;

    // Validation
    if (!movieId || !movieTitle || !title || !content || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Movie ID, title, content, and rating are required.'
      });
    }

    // Check if user already reviewed this movie
    const existingReview = await Review.findOne({
      author: req.user._id,
      movieId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this movie. You can edit your existing review.'
      });
    }

    const review = new Review({
      author: req.user._id,
      movieId,
      movieTitle,
      moviePoster,
      movieYear,
      title,
      content,
      rating,
      containsSpoilers: containsSpoilers || false,
      tags: tags || [],
      isCriticReview: req.user.role === 'critic',
      criticScore: req.user.role === 'critic' ? rating * 10 : null
    });

    await review.save();

    // Create activity
    await Activity.createActivity({
      user: req.user._id,
      type: 'review_created',
      targetType: 'Review',
      targetId: review._id,
      movieId,
      metadata: {
        movieTitle,
        moviePoster,
        reviewTitle: title
      }
    });

    // Populate author for response
    await review.populate('author', 'username avatar role criticBadge');

    res.status(201).json({
      success: true,
      message: 'Review created successfully!',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this movie.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create review.'
    });
  }
});

// PUT /api/reviews/:id - Update review
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.'
      });
    }

    // Check ownership
    if (review.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own reviews.'
      });
    }

    const allowedFields = ['title', 'content', 'rating', 'containsSpoilers', 'tags'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        review[field] = req.body[field];
      }
    }

    // Update critic score if user is critic
    if (req.user.role === 'critic' && req.body.rating) {
      review.criticScore = req.body.rating * 10;
    }

    await review.save();
    await review.populate('author', 'username avatar role criticBadge');

    res.json({
      success: true,
      message: 'Review updated successfully.',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update review.'
    });
  }
});

// DELETE /api/reviews/:id - Delete review
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.'
      });
    }

    // Check ownership
    if (review.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews.'
      });
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: 'Review deleted successfully.'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review.'
    });
  }
});

// POST /api/reviews/:id/like - Like/unlike review
router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.'
      });
    }

    const isLiked = review.likes.includes(req.user._id);

    if (isLiked) {
      review.likes.pull(req.user._id);
    } else {
      review.likes.push(req.user._id);

      // Create activity
      await Activity.createActivity({
        user: req.user._id,
        type: 'review_liked',
        targetType: 'Review',
        targetId: review._id,
        movieId: review.movieId,
        metadata: {
          movieTitle: review.movieTitle,
          reviewTitle: review.title
        }
      });
    }

    await review.save();

    res.json({
      success: true,
      isLiked: !isLiked,
      likesCount: review.likes.length
    });
  } catch (error) {
    console.error('Like review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update like status.'
    });
  }
});

// POST /api/reviews/:id/comment - Add comment to review
router.post('/:id/comment', requireAuth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required.'
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.'
      });
    }

    review.comments.push({
      author: req.user._id,
      content: content.trim()
    });

    await review.save();
    await review.populate('comments.author', 'username avatar');

    // Create activity
    await Activity.createActivity({
      user: req.user._id,
      type: 'comment_added',
      targetType: 'Review',
      targetId: review._id,
      metadata: {
        reviewTitle: review.title
      }
    });

    res.json({
      success: true,
      message: 'Comment added successfully.',
      comments: review.comments
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment.'
    });
  }
});

// DELETE /api/reviews/:id/comment/:commentId - Delete comment
router.delete('/:id/comment/:commentId', requireAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.'
      });
    }

    const comment = review.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.'
      });
    }

    // Check ownership
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments.'
      });
    }

    review.comments.pull({ _id: req.params.commentId });
    await review.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully.'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment.'
    });
  }
});

module.exports = router;

