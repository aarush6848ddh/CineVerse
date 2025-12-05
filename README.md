# CineVerse - Movie Discovery & Review Platform

A full-stack web application for discovering, reviewing, and sharing movies. Built with React, Node.js/Express, and MongoDB.

![CineVerse](https://img.shields.io/badge/CineVerse-Movie%20Platform-gold)

## 🎬 Features

### User Roles
- **Viewer** - Browse movies, write reviews, create watchlists, follow users
- **Critic** - All viewer features + verified badge, featured reviews
- **Admin** - Full access to manage users and content

### Pages
1. **Home** (`/`, `/home`) - Landing page with trending movies, personalized content for logged-in users
2. **Search** (`/search`, `/search/:query`) - Search movies via TMDB API with filters
3. **Details** (`/details/:id`) - Movie details with cast, reviews, and related movies
4. **Profile** (`/profile`, `/profile/:id`) - User profiles with public/private views
5. **Login/Register** (`/login`, `/register`) - Authentication with role selection
6. **Admin Dashboard** (`/admin`) - Admin-only user and content management

### Key Features
- 🔐 JWT-based authentication with session management
- 🎭 Role-based access control (Viewer, Critic, Admin)
- 🔍 Real-time movie search via TMDB API
- ⭐ User reviews with ratings and comments
- 📋 Watchlists and favorites
- 👥 Follow/follower system
- 🔒 Privacy settings for profile information
- 📱 Fully responsive design
- 🍪 Privacy policy with cookie consent

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router v6
- Framer Motion (animations)
- React Icons
- React Hot Toast (notifications)
- Axios

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

### External APIs
- [The Movie Database (TMDB)](https://www.themoviedb.org/) for movie data

## 📁 Project Structure

```
wd-final-project/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # Reusable components
│       │   ├── common/     # LoadingScreen, PrivacyPolicy
│       │   ├── layout/     # Navbar, Footer
│       │   ├── movies/     # MovieCard
│       │   └── reviews/    # ReviewCard
│       ├── context/        # AuthContext
│       ├── pages/          # Page components
│       ├── services/       # API service
│       └── styles/         # Global CSS
├── server/                 # Express backend
│   ├── config/             # Configuration
│   ├── middleware/         # Auth middleware
│   ├── models/             # Mongoose models
│   └── routes/             # API routes
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)
- TMDB API Key (get one at https://www.themoviedb.org/settings/api)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wd-final-project
```

2. Install dependencies:
```bash
npm run install-all
```

3. Configure environment:
   - Update `server/config/config.js` with your MongoDB URI and TMDB API key

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Run the application:
```bash
npm start
```

This starts both the server (port 4000) and client (port 3000).

### Development URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api

## 📊 Data Models

### User
- Authentication (username, email, password)
- Profile info (name, bio, avatar, location)
- Private fields (phone, dateOfBirth)
- Role (viewer, critic, admin)
- Relations: followers, following, watchlist, favorites

### Review
- Movie reference (TMDB ID)
- Content (title, content, rating)
- Author reference
- Engagement (likes, comments)

### MovieList
- Creator reference
- List of movies with notes
- Privacy and engagement

### Activity
- User activity tracking for feeds

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/:id/follow` - Follow/unfollow user
- `POST /api/users/watchlist/:movieId` - Add/remove from watchlist
- `POST /api/users/favorites/:movieId` - Add/remove from favorites

### Movies (TMDB)
- `GET /api/movies/trending` - Trending movies
- `GET /api/movies/search` - Search movies
- `GET /api/movies/:id` - Movie details

### Reviews
- `GET /api/reviews` - Recent reviews
- `GET /api/reviews/movie/:movieId` - Movie reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `POST /api/reviews/:id/like` - Like/unlike review

## 🎨 Design System

### Colors
- Background: Dark theme (#0a0a0b, #111113)
- Accent: Cinema Gold (#d4af37)
- Text: White/Gray scale

### Typography
- Display: Playfair Display
- Body: Outfit

### Components
- Responsive navigation
- Movie cards with hover effects
- Review cards with engagement
- Form inputs with validation
- Toast notifications

## 📱 Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🔐 Security Features
- Password hashing with bcrypt
- JWT tokens with expiration
- HTTP-only cookies
- Session management
- Role-based route protection

## 📄 License

This project is for educational purposes as part of a Web Development course.

## 🙏 Acknowledgments
- [TMDB](https://www.themoviedb.org/) for movie data
- Course instructors and teaching assistants

