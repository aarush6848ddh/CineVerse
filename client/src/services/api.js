import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      // Only redirect to login if not already on login/register page
      const path = window.location.pathname;
      if (!path.includes('/login') && !path.includes('/register')) {
        localStorage.removeItem('token');
        // Store the intended destination
        sessionStorage.setItem('redirectAfterLogin', path);
      }
    }
    return Promise.reject(error);
  }
);

// Movie API endpoints
export const movieApi = {
  getTrending: (timeWindow = 'week') => 
    api.get(`/movies/trending?timeWindow=${timeWindow}`),
  
  getPopular: (page = 1) => 
    api.get(`/movies/popular?page=${page}`),
  
  getTopRated: (page = 1) => 
    api.get(`/movies/top-rated?page=${page}`),
  
  getNowPlaying: (page = 1) => 
    api.get(`/movies/now-playing?page=${page}`),
  
  getUpcoming: (page = 1) => 
    api.get(`/movies/upcoming?page=${page}`),
  
  search: (query, page = 1, year = null) => {
    let url = `/movies/search?query=${encodeURIComponent(query)}&page=${page}`;
    if (year) url += `&year=${year}`;
    return api.get(url);
  },
  
  getDetails: (id) => 
    api.get(`/movies/${id}`),
  
  getGenres: () => 
    api.get('/movies/genres'),
  
  discover: (params) => 
    api.get('/movies/discover', { params }),
  
  getRecommendations: (id, page = 1) => 
    api.get(`/movies/${id}/recommendations?page=${page}`)
};

// Review API endpoints
export const reviewApi = {
  getRecent: (page = 1, limit = 10, featured = false) => 
    api.get(`/reviews?page=${page}&limit=${limit}${featured ? '&featured=true' : ''}`),
  
  getMovieReviews: (movieId, page = 1, limit = 10) => 
    api.get(`/reviews/movie/${movieId}?page=${page}&limit=${limit}`),
  
  getById: (id) => 
    api.get(`/reviews/${id}`),
  
  create: (reviewData) => 
    api.post('/reviews', reviewData),
  
  update: (id, reviewData) => 
    api.put(`/reviews/${id}`, reviewData),
  
  delete: (id) => 
    api.delete(`/reviews/${id}`),
  
  like: (id) => 
    api.post(`/reviews/${id}/like`),
  
  addComment: (id, content) => 
    api.post(`/reviews/${id}/comment`, { content }),
  
  deleteComment: (reviewId, commentId) => 
    api.delete(`/reviews/${reviewId}/comment/${commentId}`)
};

// User API endpoints
export const userApi = {
  getProfile: (id) => 
    api.get(`/users/${id}`),
  
  updateProfile: (updates) => 
    api.put('/users/profile', updates),
  
  getRecentUsers: () => 
    api.get('/users/recent'),
  
  getCritics: () => 
    api.get('/users/critics'),
  
  follow: (id) => 
    api.post(`/users/${id}/follow`),
  
  getFollowers: (id) => 
    api.get(`/users/${id}/followers`),
  
  getFollowing: (id) => 
    api.get(`/users/${id}/following`),
  
  getUserReviews: (id, page = 1, limit = 10) => 
    api.get(`/users/${id}/reviews?page=${page}&limit=${limit}`),
  
  addToWatchlist: (movieId, movieTitle, moviePoster) => 
    api.post(`/users/watchlist/${movieId}`, { movieTitle, moviePoster }),
  
  addToFavorites: (movieId, movieTitle, moviePoster) => 
    api.post(`/users/favorites/${movieId}`, { movieTitle, moviePoster }),
  
  search: (query, page = 1, limit = 20) => 
    api.get(`/users?search=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)
};

// List API endpoints
export const listApi = {
  getPublic: (page = 1, limit = 10, category = null) => {
    let url = `/lists?page=${page}&limit=${limit}`;
    if (category) url += `&category=${category}`;
    return api.get(url);
  },
  
  getPopular: (limit = 10) => 
    api.get(`/lists/popular?limit=${limit}`),
  
  getUserLists: (userId) => 
    api.get(`/lists/user/${userId}`),
  
  getById: (id) => 
    api.get(`/lists/${id}`),
  
  create: (listData) => 
    api.post('/lists', listData),
  
  update: (id, listData) => 
    api.put(`/lists/${id}`, listData),
  
  delete: (id) => 
    api.delete(`/lists/${id}`),
  
  addMovie: (listId, movieData) => 
    api.post(`/lists/${listId}/movies`, movieData),
  
  removeMovie: (listId, movieId) => 
    api.delete(`/lists/${listId}/movies/${movieId}`),
  
  like: (id) => 
    api.post(`/lists/${id}/like`)
};

// TMDB Image URL helper
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

// Image sizes available from TMDB
export const imageSizes = {
  poster: {
    small: 'w185',
    medium: 'w342',
    large: 'w500',
    original: 'original'
  },
  backdrop: {
    small: 'w300',
    medium: 'w780',
    large: 'w1280',
    original: 'original'
  },
  profile: {
    small: 'w45',
    medium: 'w185',
    large: 'h632',
    original: 'original'
  }
};

export default api;

