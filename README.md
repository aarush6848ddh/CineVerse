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

## License

This project is licensed under the MIT License.

## Acknowledgements

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for the movie data API
- [React Icons](https://react-icons.github.io/react-icons/) for the icon library
- [Framer Motion](https://www.framer.com/motion/) for animations
