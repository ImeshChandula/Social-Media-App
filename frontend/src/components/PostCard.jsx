import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCommentAlt,
  FaChevronRight,
  FaHeart,
  FaPlay
} from "react-icons/fa";
import LikesPopup from "./LikesPopup";
import PostDropdown from "./PostDropdown";
import PostLikeButton from "./PostLikeButton";
import PostComment from "./PostComment";
import { axiosInstance } from "../lib/axios";
import useAuthStore from "../store/authStore";
import ShareButton from "./ShareButton";
import "../styles/FavoriteAnimation.css"; // ✅ CSS for heart animation

const PostCard = ({
  post,
  isUserPost = false,
  onLikeUpdate,
  onDeletePost,
  disableNavigation = false,
}) => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const postId = post._id || post.id;

  const mediaArray = Array.isArray(post.media)
    ? post.media
    : post.media
    ? [post.media]
    : [];

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showLikesPopup, setShowLikesPopup] = useState(false);
  const [likes, setLikes] = useState([]);
  const [loadingLikes, setLoadingLikes] = useState(false);

  // Like state
  const [localLikeData, setLocalLikeData] = useState({
    isLiked: post.isLiked || false,
    likeCount: post.likeCount || 0,
  });

  // Favorite state
  const [isFavorited, setIsFavorited] = useState(post.isFavorited || false);
  const [burstHearts, setBurstHearts] = useState([]); // for animation

  useEffect(() => {
    setCurrentMediaIndex(0);
  }, [postId]);

  useEffect(() => {
    setLocalLikeData({
      isLiked: post.isLiked || false,
      likeCount: post.likeCount || 0,
    });
    setIsFavorited(post.isFavorited || false);
  }, [post.isLiked, post.likeCount, post.isFavorited]);

  const handleNavigateToProfile = () => {
    if (disableNavigation) return;
    const authorId = post.author?.id || post.author?._id;
    const currentUserId = authUser?._id || authUser?.id;
    if (!authorId) return;
    navigate(authorId === currentUserId ? "/profile" : `/profile/${authorId}`);
  };

  // Navigate to videos page with category filter
  const handleCategoryClick = (category) => {
    navigate(`/videos?category=${category}`);
  };

  const fetchLikes = async () => {
    try {
      setLoadingLikes(true);
      const res = await axiosInstance.get(`/likes/getAllLikedUsers/post/${postId}`);
      setLikes(res.data.data.users || []);
    } catch (error) {
      console.error("Failed to fetch likes", error);
      setLikes([]);
    } finally {
      setLoadingLikes(false);
    }
  };

  const handleOpenLikesPopup = () => {
    fetchLikes();
    setShowLikesPopup(true);
  };

  const handleLikeUpdate = async (postId, isLiked, likeCount) => {
    setLocalLikeData({ isLiked, likeCount });

    if (onLikeUpdate) {
      onLikeUpdate(postId, isLiked, likeCount);
    }
  };

  const handleDeletePost = () => {
    if (onDeletePost) {
      onDeletePost(postId);
    }
  };

  // ✅ Favorite click handler with API integration & animation
  const handleFavoriteClick = async () => {
    const newState = !isFavorited;
    setIsFavorited(newState); // Optimistic UI update

    // Burst animation only when adding favorite
    if (newState) {
      const newHearts = Array.from({ length: 6 }).map(() => ({
        id: Math.random(),
        left: Math.random() * 60 - 30,
        delay: Math.random() * 0.3,
      }));
      setBurstHearts(newHearts);
      setTimeout(() => setBurstHearts([]), 1000);
    }

    try {
      if (newState) {
        await axiosInstance.post(`/posts/favorites/add/${postId}`);
      } else {
        await axiosInstance.delete(`/posts/favorites/remove/${postId}`);
      }
    } catch (error) {
      console.error("Favorite toggle failed", error);
      setIsFavorited(!newState); // rollback on error
    }
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

  const renderMedia = (url, idx) => {
    const isVideo = /\.(mp4|webm|ogg)$/i.test(url) || post.mediaType === 'video';
    const mediaStyles = {
      width: "100%",
      height: "clamp(200px, 30vw, 400px)",
      objectFit: "contain",
      borderRadius: "0.75rem",
    };

    return isVideo ? (
      <div key={idx} className="position-relative">
        <video src={url} controls className="w-100" style={mediaStyles} />
        {/* Video category badge */}
        {post.category && (
          <div className="position-absolute top-0 end-0 m-2">
            <span 
              className={`badge ${getCategoryBadgeClass(post.category)} cursor-pointer`}
              onClick={() => handleCategoryClick(post.category)}
              title={`View more ${post.category} videos`}
            >
              {post.category}
            </span>
          </div>
        )}
      </div>
    ) : (
      <img key={idx} src={url} alt={`media ${idx + 1}`} style={mediaStyles} />
    );
  };

  return (
    <div className="container px-0">
      <div className="card bg-white mb-4 shadow-sm rounded-4 mx-auto">
        {/* Header */}
        <div className="card-header bg-white d-flex justify-content-between p-3 rounded-top-4">
          <div
            className="d-flex align-items-center gap-3"
            onClick={handleNavigateToProfile}
            style={{ cursor: disableNavigation ? "default" : "pointer" }}
          >
            <img
              src={post.author?.profilePicture || "/default-avatar.png"}
              alt="Profile"
              className="rounded-circle"
              style={{ width: 50, height: 50, objectFit: "cover" }}
              onError={(e) => {
                e.target.src = "/default-avatar.png";
              }}
            />
            <div className="flex-grow-1 text-start">
              <h6 className="mb-0 fw-bold">{post.author?.username || "Unknown"}</h6>
              <div className="d-flex align-items-center gap-2">
                <small className="text-muted">
                  {post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
                </small>
                {/* Show category for video posts in header */}
                {post.mediaType === 'video' && post.category && (
                  <span 
                    className={`badge ${getCategoryBadgeClass(post.category)} badge-sm cursor-pointer`}
                    onClick={() => handleCategoryClick(post.category)}
                    title={`View more ${post.category} videos`}
                    style={{ fontSize: '0.7rem' }}
                  >
                    {post.category}
                  </span>
                )}
              </div>
            </div>
          </div>
          {isUserPost && <PostDropdown postId={postId} onDelete={handleDeletePost} />}
        </div>

        {/* Body */}
        <div className="card-body p-4">
          {post.content && <p className="mb-3">{post.content}</p>}
          
          {/* Location */}
          {post.location && (
            <div className="mb-3">
              <small className="text-muted">
                📍 {post.location}
              </small>
            </div>
          )}
          
          {mediaArray.length > 0 && (
            <div className="text-center">{renderMedia(mediaArray[currentMediaIndex], currentMediaIndex)}</div>
          )}
          
          {/* Video category section (for better visibility) */}
          {post.mediaType === 'video' && post.category && (
            <div className="mt-3 d-flex align-items-center justify-content-between">
              <div 
                className="d-flex align-items-center gap-2 cursor-pointer"
                onClick={() => handleCategoryClick(post.category)}
              >
                <FaPlay size={12} className="text-muted" />
                <span className="text-muted small">
                  Video in <strong>{post.category}</strong> category
                </span>
              </div>
              <small className="text-muted">
                Click to view more {post.category} videos
              </small>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="card-footer px-4 bg-white d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            {/* Like */}
            <PostLikeButton
              postId={postId}
              initialIsLiked={localLikeData.isLiked}
              initialLikeCount={localLikeData.likeCount}
              onLikeUpdate={handleLikeUpdate}
            />
            <FaChevronRight
              className="text-black"
              title="View Likes"
              onClick={handleOpenLikesPopup}
              style={{ cursor: "pointer" }}
            />

            {/* ✅ Favorite Button */}
            <div className="favorite-container" onClick={handleFavoriteClick}>
              <FaHeart
                className={`favorite-icon ${isFavorited ? "favorited" : ""}`}
                title={isFavorited ? "Remove from favorites" : "Add to favorites"}
              />
              {burstHearts.map((h) => (
                <span
                  key={h.id}
                  className="floating-heart"
                  style={{
                    left: `${h.left}px`,
                    animationDelay: `${h.delay}s`,
                  }}
                >
                  ❤️
                </span>
              ))}
            </div>
          </div>

          {/* Comments & Share */}
          <button
            className="btn btn-light"
            onClick={() => setShowComments((prev) => !prev)}
          >
            <FaCommentAlt /> {post.comments?.length || 0} comments
          </button>
          <ShareButton postId={postId} />
        </div>

        {showComments && <PostComment postId={postId} />}
        <LikesPopup
          show={showLikesPopup}
          onClose={() => setShowLikesPopup(false)}
          likes={likes}
          loading={loadingLikes}
        />
      </div>
    </div>
  );
};

export default PostCard;
