import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import '../styles/Videos.css';

const Videos = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalVideo, setModalVideo] = useState(null);

  const categories = [ 'All', 'Music', 'Sports', 'Education', 'Entertainment', 'News'];

  useEffect(() => {
    fetchVideoPosts();
  }, [selectedCategory]); // Refetch when category changes

  const fetchVideoPosts = async () => {
    try {
      setLoading(true);
      
      // Add category as query parameter if not 'All'
      const url = selectedCategory === 'All' 
        ? '/posts/feed/videos' 
        : `/posts/feed/videos?category=${selectedCategory}`;
        
      const response = await axiosInstance.get(url);
      
      if (response.data.success) {
        setVideos(response.data.posts || []);
      } else {
        toast.error(response.data.message || 'Failed to fetch videos');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async (postId) => {
    try {
      const response = await axiosInstance.post(`/likes/toPost/${postId}`);
      const updatedPost = response.data?.updatedPost;

      if (updatedPost) {
        setVideos((prevVideos) =>
          prevVideos.map((video) =>
            video._id === postId
              ? { ...video, isLiked: updatedPost.isLiked, likeCount: updatedPost.likeCount }
              : video
          )
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to like post');
    }
  };

  const handleNavigateToProfile = (authorId) => {
    if (authorId) navigate(`/profile/${authorId}`);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  if (loading) {
    return (
      <div className="text-white text-center my-5 fs-5 normal-loading-spinner">
        Loading Videos<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
      </div>
    );
  }

  return (
    <div className="container py-5 py-md-0 mt-4 mt-md-0">
      <h2 className="mb-4 text-center">Explore Videos</h2>

      {/* Category Filter */}
      <div className="mb-4">
        <div className="d-flex justify-content-center gap-2 flex-wrap mb-3">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`btn ${
                selectedCategory === cat ? 'btn-primary' : 'btn-outline-primary'
              } btn-sm`}
              onClick={() => handleCategoryChange(cat)}
              disabled={loading}
            >
              {cat}
            </button>
          ))}
        </div>
        
        {/* Category Description */}
        {selectedCategory !== 'All' && (
          <div className="text-center text-muted mb-3">
            <small>Showing videos in "{selectedCategory}" category</small>
          </div>
        )}
      </div>

      {/* Video Count */}
      {videos.length > 0 && (
        <div className="text-center mb-3">
          <small className="text-muted">
            {videos.length} video{videos.length !== 1 ? 's' : ''} found
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </small>
        </div>
      )}

      {/* Video Cards */}
      <div className="row">
        {videos.length === 0 ? (
          <div className="col-12 text-center py-5">
            <div className="text-muted">
              <h5>No videos found</h5>
              <p>
                {selectedCategory === 'All' 
                  ? "No videos have been posted yet. Be the first to share a video!" 
                  : `No videos found in the "${selectedCategory}" category. Try a different category or check back later.`
                }
              </p>
            </div>
          </div>
        ) : (
          videos.map((post) => (
            <div key={post._id || post.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card shadow-sm rounded-3 h-100">
                {/* Header */}
                <div
                  className="card-header bg-white d-flex align-items-center justify-content-between p-3 border-bottom"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleNavigateToProfile(post.author?.id)}
                >
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={post.author?.profilePicture || '/default-avatar.png'}
                      alt="Profile"
                      className="rounded-circle"
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                    <div>
                      <h6 className="mb-0 fw-bold text-black">
                        {`${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() || 
                         post.author?.username || 'Unknown User'}
                      </h6>
                      <small className="text-muted">
                        {new Date(post.createdAt).toLocaleString()}
                      </small>
                    </div>
                  </div>
                </div>

                {/* Video Preview */}
                <div className="video-thumbnail" onClick={() => setModalVideo(post)}>
                  <video
                    className="card-img-top"
                    muted
                    preload="metadata"
                    poster="/thumbnail.jpg"
                    style={{ cursor: 'pointer', objectFit: 'cover', maxHeight: '250px' }}
                  >
                    <source src={`${post.media}#t=0.1`} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Play button overlay */}
                  <div className="play-button-overlay position-absolute top-50 start-50 translate-middle">
                    <div className="bg-dark bg-opacity-75 rounded-circle p-3">
                      <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="card-body">
                  {post.content && (
                    <p className="card-text mb-2">{post.content}</p>
                  )}
                  
                  {/* Category Badge */}
                  <div className="mb-2">
                    <span className={`badge ${getCategoryBadgeClass(post.category)} me-2`}>
                      {post.category || 'General'}
                    </span>
                    {post.location && (
                      <small className="text-muted">
                        📍 {post.location}
                      </small>
                    )}
                  </div>
                  
                  {/* Stats */}
                  <div className="d-flex justify-content-between text-muted small">
                    <span>👀 Views: N/A</span>
                    <span>⏱️ {getTimeAgo(post.createdAt)}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="card-footer d-flex justify-content-between align-items-center bg-white border-top">
                  <button
                    className={`btn btn-sm ${post.isLiked ? 'btn-danger' : 'btn-outline-danger'}`}
                    onClick={() => handleLikeToggle(post._id || post.id)}
                  >
                    ❤️ {post.likeCount || 0}
                  </button>
                  <button className="btn btn-outline-secondary btn-sm">
                    💬 {post.commentCount || 0}
                  </button>
                  <button className="btn btn-outline-secondary btn-sm">
                    🔗 Share
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for playing video */}
      {modalVideo && (
        <div 
          className="modal fade show d-block" 
          tabIndex="-1" 
          onClick={() => setModalVideo(null)}
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h5 className="modal-title mb-1">
                    {modalVideo.content || 'Video'}
                  </h5>
                  <small className="text-muted">
                    by {modalVideo.author?.firstName} {modalVideo.author?.lastName} • {modalVideo.category}
                  </small>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalVideo(null)}
                ></button>
              </div>
              <div className="modal-body p-0">
                <video 
                  className="w-100" 
                  controls 
                  autoPlay 
                  controlsList="nodownload"
                  style={{ maxHeight: '70vh' }}
                >
                  <source src={modalVideo.media} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="modal-footer">
                <div className="d-flex justify-content-between w-100 align-items-center">
                  <div>
                    <span className={`badge ${getCategoryBadgeClass(modalVideo.category)}`}>
                      {modalVideo.category}
                    </span>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className={`btn btn-sm ${modalVideo.isLiked ? 'btn-danger' : 'btn-outline-danger'}`}
                      onClick={() => handleLikeToggle(modalVideo._id || modalVideo.id)}
                    >
                      ❤️ {modalVideo.likeCount || 0}
                    </button>
                    <button className="btn btn-outline-secondary btn-sm">
                      💬 Comment
                    </button>
                    <button className="btn btn-outline-secondary btn-sm">
                      🔗 Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get category badge class
const getCategoryBadgeClass = (category) => {
  const badgeClasses = {
    'Music': 'bg-purple text-white',
    'Sports': 'bg-success text-white',
    'Education': 'bg-primary text-white',
    'Entertainment': 'bg-warning text-dark',
    'News': 'bg-danger text-white'
  };
  return badgeClasses[category] || 'bg-secondary text-white';
};

// Helper function to get time ago
const getTimeAgo = (dateString) => {
  const now = new Date();
  const postDate = new Date(dateString);
  const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks}w ago`;
};

export default Videos;
