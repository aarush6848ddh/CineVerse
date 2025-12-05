const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config/config');
const Review = require('../models/Review');
const { verifyToken } = require('../middleware/auth');

// TMDB API helper
const tmdb = axios.create({
  baseURL: config.tmdb.baseUrl,
  params: {
    api_key: config.tmdb.apiKey
  }
});

// GET /api/movies/trending - Get trending movies
router.get('/trending', async (req, res) => {
  try {
    const { timeWindow = 'week' } = req.query;
    const response = await tmdb.get(`/trending/movie/${timeWindow}`);

    res.json({
      success: true,
      movies: response.data.results,
      page: response.data.page,
      totalPages: response.data.total_pages
    });
  } catch (error) {
    console.error('Trending movies error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending movies.'
    });
  }
});

// GET /api/movies/popular - Get popular movies
router.get('/popular', async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const response = await tmdb.get('/movie/popular', { params: { page } });

    res.json({
      success: true,
      movies: response.data.results,
      page: response.data.page,
      totalPages: response.data.total_pages
    });
  } catch (error) {
    console.error('Popular movies error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular movies.'
    });
  }
});

// GET /api/movies/top-rated - Get top rated movies
router.get('/top-rated', async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const response = await tmdb.get('/movie/top_rated', { params: { page } });

    res.json({
      success: true,
      movies: response.data.results,
      page: response.data.page,
      totalPages: response.data.total_pages
    });
  } catch (error) {
    console.error('Top rated movies error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top rated movies.'
    });
  }
});

// GET /api/movies/now-playing - Get now playing movies
router.get('/now-playing', async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const response = await tmdb.get('/movie/now_playing', { params: { page } });

    res.json({
      success: true,
      movies: response.data.results,
      page: response.data.page,
      totalPages: response.data.total_pages
    });
  } catch (error) {
    console.error('Now playing movies error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch now playing movies.'
    });
  }
});

// GET /api/movies/upcoming - Get upcoming movies
router.get('/upcoming', async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const response = await tmdb.get('/movie/upcoming', { params: { page } });

    res.json({
      success: true,
      movies: response.data.results,
      page: response.data.page,
      totalPages: response.data.total_pages
    });
  } catch (error) {
    console.error('Upcoming movies error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming movies.'
    });
  }
});

// GET /api/movies/search - Search movies
router.get('/search', async (req, res) => {
  try {
    const { query, page = 1, year } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required.'
      });
    }

    const params = { query, page };
    if (year) params.year = year;

    const response = await tmdb.get('/search/movie', { params });

    res.json({
      success: true,
      movies: response.data.results,
      page: response.data.page,
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results
    });
  } catch (error) {
    console.error('Search movies error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to search movies.'
    });
  }
});

// GET /api/movies/genres - Get movie genres
router.get('/genres', async (req, res) => {
  try {
    const response = await tmdb.get('/genre/movie/list');

    res.json({
      success: true,
      genres: response.data.genres
    });
  } catch (error) {
    console.error('Get genres error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch genres.'
    });
  }
});

// GET /api/movies/discover - Discover movies with filters
router.get('/discover', async (req, res) => {
  try {
    const { 
      page = 1, 
      genre, 
      year, 
      sortBy = 'popularity.desc',
      minRating,
      maxRating
    } = req.query;

    const params = { 
      page, 
      sort_by: sortBy,
      include_adult: false
    };

    if (genre) params.with_genres = genre;
    if (year) params.primary_release_year = year;
    if (minRating) params['vote_average.gte'] = minRating;
    if (maxRating) params['vote_average.lte'] = maxRating;

    const response = await tmdb.get('/discover/movie', { params });

    res.json({
      success: true,
      movies: response.data.results,
      page: response.data.page,
      totalPages: response.data.total_pages
    });
  } catch (error) {
    console.error('Discover movies error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to discover movies.'
    });
  }
});

// GET /api/movies/:id - Get movie details
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const movieId = req.params.id;

    // Fetch movie details with credits and videos
    const [movieResponse, creditsResponse, videosResponse, similarResponse] = await Promise.all([
      tmdb.get(`/movie/${movieId}`, { 
        params: { append_to_response: 'release_dates' } 
      }),
      tmdb.get(`/movie/${movieId}/credits`),
      tmdb.get(`/movie/${movieId}/videos`),
      tmdb.get(`/movie/${movieId}/similar`)
    ]);

    const movie = movieResponse.data;
    
    // Get local reviews and stats
    const [reviewsResult, stats] = await Promise.all([
      Review.getMovieReviews(parseInt(movieId), 1, 5),
      Review.getMovieStats(parseInt(movieId))
    ]);

    // Check if user has this movie in watchlist/favorites
    let userStatus = null;
    if (req.user) {
      userStatus = {
        inWatchlist: req.user.watchlist.some(m => m.movieId === parseInt(movieId)),
        isFavorite: req.user.favorites.some(m => m.movieId === parseInt(movieId)),
        hasReviewed: await Review.exists({ author: req.user._id, movieId: parseInt(movieId) })
      };
    }

    res.json({
      success: true,
      movie: {
        ...movie,
        credits: {
          cast: creditsResponse.data.cast?.slice(0, 15),
          crew: creditsResponse.data.crew?.filter(c => 
            ['Director', 'Writer', 'Screenplay', 'Producer'].includes(c.job)
          )
        },
        videos: videosResponse.data.results?.filter(v => 
          v.site === 'YouTube' && ['Trailer', 'Teaser'].includes(v.type)
        ),
        similar: similarResponse.data.results?.slice(0, 6)
      },
      localReviews: reviewsResult.reviews,
      localStats: stats,
      userStatus
    });
  } catch (error) {
    console.error('Get movie details error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch movie details.'
    });
  }
});

// GET /api/movies/:id/credits - Get movie credits
router.get('/:id/credits', async (req, res) => {
  try {
    const response = await tmdb.get(`/movie/${req.params.id}/credits`);

    res.json({
      success: true,
      cast: response.data.cast,
      crew: response.data.crew
    });
  } catch (error) {
    console.error('Get credits error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch credits.'
    });
  }
});

// GET /api/movies/:id/recommendations - Get movie recommendations
router.get('/:id/recommendations', async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const response = await tmdb.get(`/movie/${req.params.id}/recommendations`, { 
      params: { page } 
    });

    res.json({
      success: true,
      movies: response.data.results,
      page: response.data.page,
      totalPages: response.data.total_pages
    });
  } catch (error) {
    console.error('Get recommendations error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations.'
    });
  }
});

// Image URL helper endpoint
router.get('/config/images', async (req, res) => {
  try {
    const response = await tmdb.get('/configuration');

    res.json({
      success: true,
      images: response.data.images
    });
  } catch (error) {
    console.error('Get config error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch configuration.'
    });
  }
});

module.exports = router;

