import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiEdit2, FiMapPin, FiLink, FiCalendar, FiMail, FiPhone,
  FiUsers, FiHeart, FiBookmark, FiMessageCircle, FiList,
  FiStar, FiUserPlus, FiUserCheck, FiSettings, FiAward
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { userApi, getImageUrl } from '../services/api';
import MovieCard from '../components/movies/MovieCard';
import ReviewCard from '../components/reviews/ReviewCard';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated, refreshUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [lists, setLists] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [followersData, setFollowersData] = useState([]);
  const [followingData, setFollowingData] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        // Determine which profile to fetch
        const profileId = id || (currentUser ? currentUser._id : null);
        
        if (!profileId) {
          navigate('/login');
          return;
        }

        const response = await userApi.getProfile(profileId);
        setProfile(response.data.profile);
        setReviews(response.data.reviews || []);
        setLists(response.data.lists || []);
        setIsOwnProfile(response.data.isOwnProfile);
        setIsFollowing(response.data.isFollowing);

        // Fetch followers/following data
        const [followersRes, followingRes] = await Promise.all([
          userApi.getFollowers(profileId),
          userApi.getFollowing(profileId)
        ]);
        setFollowersData(followersRes.data.followers || []);
        setFollowingData(followingRes.data.following || []);

      } catch (error) {
        console.error('Error fetching profile:', error);
        if (error.response?.status === 404) {
          navigate('/404');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, currentUser, navigate]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    try {
      const response = await userApi.follow(profile._id);
      setIsFollowing(response.data.isFollowing);
      
      // Update followers count
      setProfile(prev => ({
        ...prev,
        followersCount: prev.followersCount + (response.data.isFollowing ? 1 : -1)
      }));
      
      toast.success(response.data.message);
      refreshUser();
    } catch (error) {
      toast.error('Failed to update follow status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="loading-spinner" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="empty-state">
            <h2>Profile not found</h2>
            <Link to="/" className="btn btn-primary">Go Home</Link>
          </div>
        </div>
      </div>
    );
  }

  const getUserInitials = () => {
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
    }
    return profile.username[0].toUpperCase();
  };

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <section className="profile-header">
        <div className="container">
          <div className="profile-header-content">
            <div className="profile-avatar-large">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.username} />
              ) : (
                <span>{getUserInitials()}</span>
              )}
              {profile.criticBadge && (
                <div className="critic-badge-large">
                  <FiAward />
                </div>
              )}
            </div>

            <div className="profile-info">
              <div className="profile-name-row">
                <h1 className="profile-name">
                  {profile.firstName || profile.lastName 
                    ? `${profile.firstName} ${profile.lastName}`.trim()
                    : profile.username
                  }
                </h1>
                {profile.role === 'critic' && (
                  <span className="badge badge-gold">Verified Critic</span>
                )}
                {profile.role === 'admin' && (
                  <span className="badge badge-gold">Admin</span>
                )}
              </div>
              
              <p className="profile-username">@{profile.username}</p>
              
              {profile.bio && (
                <p className="profile-bio">{profile.bio}</p>
              )}

              <div className="profile-meta">
                {profile.location && (
                  <span className="meta-item">
                    <FiMapPin /> {profile.location}
                  </span>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="meta-item">
                    <FiLink /> Website
                  </a>
                )}
                <span className="meta-item">
                  <FiCalendar /> Joined {formatDate(profile.createdAt)}
                </span>
              </div>

              {/* Private Info - Only for own profile */}
              {isOwnProfile && (
                <div className="profile-private-info">
                  {profile.email && (
                    <span className="private-item">
                      <FiMail /> {profile.email}
                    </span>
                  )}
                  {profile.phone && (
                    <span className="private-item">
                      <FiPhone /> {profile.phone}
                    </span>
                  )}
                </div>
              )}

              {/* Critic Specialization */}
              {profile.specialization && profile.specialization.length > 0 && (
                <div className="profile-specialization">
                  <span className="label">Specializes in:</span>
                  <div className="specialization-tags">
                    {profile.specialization.map((spec, index) => (
                      <span key={index} className="spec-tag">{spec}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="profile-stats">
                <button 
                  className="stat-item"
                  onClick={() => setActiveTab('followers')}
                >
                  <span className="stat-value">{profile.followersCount || 0}</span>
                  <span className="stat-label">Followers</span>
                </button>
                <button 
                  className="stat-item"
                  onClick={() => setActiveTab('following')}
                >
                  <span className="stat-value">{profile.followingCount || 0}</span>
                  <span className="stat-label">Following</span>
                </button>
                <div className="stat-item">
                  <span className="stat-value">{reviews.length}</span>
                  <span className="stat-label">Reviews</span>
                </div>
                {(isOwnProfile || profile.watchlistCount !== undefined) && (
                  <div className="stat-item">
                    <span className="stat-value">{profile.watchlistCount || profile.watchlist?.length || 0}</span>
                    <span className="stat-label">Watchlist</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="profile-actions">
                {isOwnProfile ? (
                  <Link to="/edit-profile" className="btn btn-secondary">
                    <FiEdit2 /> Edit Profile
                  </Link>
                ) : (
                  <button 
                    className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={handleFollow}
                  >
                    {isFollowing ? (
                      <>
                        <FiUserCheck /> Following
                      </>
                    ) : (
                      <>
                        <FiUserPlus /> Follow
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="profile-content">
        <div className="container">
          {/* Tabs */}
          <div className="profile-tabs">
            <button 
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <FiStar /> Overview
            </button>
            <button 
              className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <FiMessageCircle /> Reviews
            </button>
            {(isOwnProfile || profile.watchlist) && (
              <button 
                className={`tab ${activeTab === 'watchlist' ? 'active' : ''}`}
                onClick={() => setActiveTab('watchlist')}
              >
                <FiBookmark /> Watchlist
              </button>
            )}
            {(isOwnProfile || profile.favorites) && (
              <button 
                className={`tab ${activeTab === 'favorites' ? 'active' : ''}`}
                onClick={() => setActiveTab('favorites')}
              >
                <FiHeart /> Favorites
              </button>
            )}
            <button 
              className={`tab ${activeTab === 'followers' ? 'active' : ''}`}
              onClick={() => setActiveTab('followers')}
            >
              <FiUsers /> Followers
            </button>
            <button 
              className={`tab ${activeTab === 'following' ? 'active' : ''}`}
              onClick={() => setActiveTab('following')}
            >
              <FiUserPlus /> Following
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-content">
                {/* Recent Reviews */}
                <div className="content-section">
                  <div className="section-header">
                    <h3>Recent Reviews</h3>
                    {reviews.length > 3 && (
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => setActiveTab('reviews')}
                      >
                        View All
                      </button>
                    )}
                  </div>
                  {reviews.length > 0 ? (
                    <div className="reviews-grid">
                      {reviews.slice(0, 3).map(review => (
                        <ReviewCard key={review._id} review={review} compact />
                      ))}
                    </div>
                  ) : (
                    <p className="empty-text">No reviews yet</p>
                  )}
                </div>

                {/* Watchlist Preview */}
                {(isOwnProfile || profile.watchlist) && profile.watchlist?.length > 0 && (
                  <div className="content-section">
                    <div className="section-header">
                      <h3>Watchlist</h3>
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => setActiveTab('watchlist')}
                      >
                        View All
                      </button>
                    </div>
                    <div className="movie-preview-list">
                      {profile.watchlist.slice(0, 5).map(item => (
                        <Link 
                          key={item.movieId} 
                          to={`/details/${item.movieId}`}
                          className="movie-preview-item"
                        >
                          {item.posterPath ? (
                            <img 
                              src={`https://image.tmdb.org/t/p/w92${item.posterPath}`} 
                              alt={item.title || 'Movie'} 
                              className="preview-poster"
                            />
                          ) : (
                            <FiBookmark />
                          )}
                          <span>{item.title || `Movie #${item.movieId}`}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lists Preview */}
                {lists.length > 0 && (
                  <div className="content-section">
                    <div className="section-header">
                      <h3>Movie Lists</h3>
                    </div>
                    <div className="lists-grid">
                      {lists.slice(0, 3).map(list => (
                        <div key={list._id} className="list-card">
                          <h4>{list.title}</h4>
                          <p>{list.movieCount || list.movies?.length || 0} movies</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-content">
                {reviews.length > 0 ? (
                  <div className="reviews-full-list">
                    {reviews.map(review => (
                      <ReviewCard key={review._id} review={review} />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FiMessageCircle className="empty-icon" />
                    <h3>No reviews yet</h3>
                    <p>
                      {isOwnProfile 
                        ? "You haven't written any reviews yet. Start by watching a movie!"
                        : `${profile.username} hasn't written any reviews yet.`
                      }
                    </p>
                    {isOwnProfile && (
                      <Link to="/search" className="btn btn-primary">
                        Find Movies to Review
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'watchlist' && (
              <div className="watchlist-content">
                {profile.watchlist && profile.watchlist.length > 0 ? (
                  <div className="movie-card-grid">
                    {profile.watchlist.map(item => (
                      <Link 
                        key={item.movieId}
                        to={`/details/${item.movieId}`}
                        className="movie-list-card"
                      >
                        {item.posterPath ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w185${item.posterPath}`} 
                            alt={item.title || 'Movie'} 
                            className="movie-list-poster"
                          />
                        ) : (
                          <div className="movie-list-placeholder">
                            <FiBookmark />
                          </div>
                        )}
                        <div className="movie-list-info">
                          <h4>{item.title || `Movie #${item.movieId}`}</h4>
                          <span className="added-date">Added to watchlist</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FiBookmark className="empty-icon" />
                    <h3>Watchlist is empty</h3>
                    <p>
                      {isOwnProfile 
                        ? "Start adding movies you want to watch!"
                        : `${profile.username}'s watchlist is empty.`
                      }
                    </p>
                    {isOwnProfile && (
                      <Link to="/search" className="btn btn-primary">
                        Discover Movies
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="favorites-content">
                {profile.favorites && profile.favorites.length > 0 ? (
                  <div className="movie-card-grid">
                    {profile.favorites.map(item => (
                      <Link 
                        key={item.movieId}
                        to={`/details/${item.movieId}`}
                        className="movie-list-card"
                      >
                        {item.posterPath ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w185${item.posterPath}`} 
                            alt={item.title || 'Movie'} 
                            className="movie-list-poster"
                          />
                        ) : (
                          <div className="movie-list-placeholder">
                            <FiHeart />
                          </div>
                        )}
                        <div className="movie-list-info">
                          <h4>{item.title || `Movie #${item.movieId}`}</h4>
                          <span className="added-date">Favorited</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FiHeart className="empty-icon" />
                    <h3>No favorites yet</h3>
                    <p>
                      {isOwnProfile 
                        ? "Mark movies as favorites to see them here!"
                        : `${profile.username} hasn't added any favorites yet.`
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'followers' && (
              <div className="followers-content">
                {followersData.length > 0 ? (
                  <div className="users-grid">
                    {followersData.map(user => (
                      <Link 
                        key={user._id} 
                        to={`/profile/${user._id}`}
                        className="user-card"
                      >
                        <div className="user-avatar">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.username} />
                          ) : (
                            <span>{user.username[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div className="user-info">
                          <span className="user-name">
                            {user.firstName || user.username}
                            {user.criticBadge && <FiAward className="critic-icon" />}
                          </span>
                          <span className="user-username">@{user.username}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FiUsers className="empty-icon" />
                    <h3>No followers yet</h3>
                    <p>
                      {isOwnProfile 
                        ? "Share your profile to gain followers!"
                        : `${profile.username} doesn't have any followers yet.`
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'following' && (
              <div className="following-content">
                {followingData.length > 0 ? (
                  <div className="users-grid">
                    {followingData.map(user => (
                      <Link 
                        key={user._id} 
                        to={`/profile/${user._id}`}
                        className="user-card"
                      >
                        <div className="user-avatar">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.username} />
                          ) : (
                            <span>{user.username[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div className="user-info">
                          <span className="user-name">
                            {user.firstName || user.username}
                            {user.criticBadge && <FiAward className="critic-icon" />}
                          </span>
                          <span className="user-username">@{user.username}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FiUserPlus className="empty-icon" />
                    <h3>Not following anyone</h3>
                    <p>
                      {isOwnProfile 
                        ? "Follow critics and other movie lovers!"
                        : `${profile.username} isn't following anyone yet.`
                      }
                    </p>
                    {isOwnProfile && (
                      <Link to="/search" className="btn btn-primary">
                        Discover Users
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;

