// Server Configuration
// In production, use environment variables for sensitive data

module.exports = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/cineverse'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'cineverse_super_secret_key_2024',
    expiresIn: '7d'
  },
  tmdb: {
    apiKey: process.env.TMDB_API_KEY || '2dca580c2a14b55200e784d157207b4d',
    baseUrl: 'https://api.themoviedb.org/3',
    imageBaseUrl: 'https://image.tmdb.org/t/p'
  },
  session: {
    secret: process.env.SESSION_SECRET || 'session_secret_key_2024'
  },
  port: process.env.PORT || 4000
};

