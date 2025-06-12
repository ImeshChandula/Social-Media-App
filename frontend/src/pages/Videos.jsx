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

  const categories = ['All', 'Music', 'Sports', 'Education', 'Entertainment', 'News'];

  useEffect(() => {
    const fetchVideoPosts = async () => {
      try {
        const response = await axiosInstance.get('/posts/feed/videos');
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

    fetchVideoPosts();
  }, []);

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

  const filteredVideos =
    selectedCategory === 'All'
      ? videos
      : videos.filter((video) => video.category === selectedCategory);

  const handleNavigateToProfile = (authorId) => {
    if (authorId) navigate(`/profile/${authorId}`);
  };

  if (loading) return <p className="text-center mt-5">Loading videos...</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Explore Videos</h2>

      {/* Category Filter */}
      <div className="mb-4 d-flex justify-content-center gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Video Cards */}
      <div className="row">
        {filteredVideos.length === 0 ? (
          <div className="col-12 text-center">
            <p>No videos found for "{selectedCategory}"</p>
          </div>
        ) : (
          filteredVideos.map((post) => (
            <div key={post._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card shadow-sm rounded-3 h-100">
                {/* Header */}
                <div
                  className="card-header bg-white d-flex align-items-center justify-content-between p-3 border-bottom"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleNavigateToProfile(post.author?.id)}
                >
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={post.author?.profilePicture}
                      alt="Profile"
                      className="rounded-circle"
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                    <div>
                      <h6 className="mb-0 fw-bold text-black">
                        {`${post.author?.firstName || ''} ${post.author?.lastName || ''}`}
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
                </div>

                {/* Content */}
                <div className="card-body">
                  <h5 className="card-title">{post.title}</h5>
                  <p className="card-text text-muted">{post.description}</p>
                  <p className="small text-muted mb-0">
                    Category: <strong>{post.category || 'General'}</strong>
                  </p>
                </div>

                {/* Footer */}
                <div className="card-footer d-flex justify-content-between align-items-center bg-white border-top">
                  <button
                    className={`btn btn-sm ${post.isLiked ? 'btn-danger' : 'btn-outline-danger'}`}
                    onClick={() => handleLikeToggle(post._id)}
                  >
                    ❤️ {post.likeCount || 0}
                  </button>
                  <button className="btn btn-outline-secondary btn-sm">💬 Comment</button>
                  <button className="btn btn-outline-secondary btn-sm">🔗 Share</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for playing video */}
      {modalVideo && (
        <div className="modal fade show d-block" tabIndex="-1" onClick={() => setModalVideo(null)}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h5 className="modal-title">{modalVideo.title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalVideo(null)}
                ></button>
              </div>
              <div className="modal-body">
                <video className="w-100" controls autoPlay controlsList="nodownload">
                  <source src={modalVideo.media} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;
