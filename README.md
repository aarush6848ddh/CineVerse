# CineVerse

A full-stack movie discovery and review platform where users can explore movies, write reviews, create watchlists, and connect with other film enthusiasts.

![CineVerse Banner](https://image.tmdb.org/t/p/original/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg)

## Technologies Used

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

### External APIs
![TMDB](https://img.shields.io/badge/TMDB-01B4E4?style=for-the-badge&logo=themoviedatabase&logoColor=white)

## Features

### User Management
- User registration and authentication with JWT
- Three user roles: Viewer, Critic, and Admin
- Profile customization with avatar, bio, and social links
- Follow/unfollow other users
- Privacy settings for profile visibility

### Movie Discovery
- Browse trending, popular, top-rated, and upcoming movies
- Advanced search with filters (genre, year, rating)
- Detailed movie pages with cast, crew, and trailers
- Similar movie recommendations

### Reviews and Lists
- Write and publish movie reviews with ratings
- Create personal watchlists and favorites
- View reviews from critics and other users

### User Interaction
- Follow critics and friends
- View activity feeds
- Discover new users in the community

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- TMDB API Key

### Setup

1. Clone the repository
```bash
git clone https://github.com/aarush6848ddh/CineVerse.git
cd CineVerse
```

2. Install server dependencies
```bash
npm install
```

3. Install client dependencies
```bash
cd client
npm install
cd ..
```

4. Create environment file
```bash
cp .env.example .env
```

5. Configure environment variables in `.env`
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
TMDB_API_KEY=your_tmdb_api_key
```

6. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
CineVerse/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── context/        # React context providers
│       ├── pages/          # Page components
│       ├── services/       # API service functions
│       └── styles/         # Global styles
├── server/                 # Express backend
│   ├── config/            # Configuration files
│   ├── middleware/        # Custom middleware
│   ├── models/            # Mongoose schemas
│   └── routes/            # API routes
└── package.json
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:id` | Get user profile |
| PUT | `/api/users/:id` | Update user profile |
| POST | `/api/users/:id/follow` | Follow a user |
| DELETE | `/api/users/:id/follow` | Unfollow a user |

### Movies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/movies/trending` | Get trending movies |
| GET | `/api/movies/popular` | Get popular movies |
| GET | `/api/movies/search` | Search movies |
| GET | `/api/movies/:id` | Get movie details |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews/movie/:id` | Get reviews for a movie |
| POST | `/api/reviews` | Create a review |
| PUT | `/api/reviews/:id` | Update a review |
| DELETE | `/api/reviews/:id` | Delete a review |

## Database Schema

### User Model
- username, email, password (hashed)
- firstName, lastName, bio, avatar
- role (viewer, critic, admin)
- watchlist, favorites
- followers, following
- privacySettings

### Review Model
- user (reference)
- movieId, movieTitle, moviePoster
- rating, title, content
- likes, comments
- timestamps

### MovieList Model
- user (reference)
- title, description
- movies array
- isPublic flag

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgements

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for the movie data API
- [React Icons](https://react-icons.github.io/react-icons/) for the icon library
- [Framer Motion](https://www.framer.com/motion/) for animations
