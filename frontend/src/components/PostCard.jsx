import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCommentAlt,
  FaChevronRight,
  FaHeart,
  FaPlay,
  FaFlag,
  FaTimes
} from "react-icons/fa";
import LikesPopup from "./LikesPopup";
import PostDropdown from "./PostDropdown";
import PostLikeButton from "./PostLikeButton";
import PostComment from "./PostComment";
import { axiosInstance } from "../lib/axios";
import useAuthStore from "../store/authStore";
import ShareButton from "./ShareButton";
import toast from "react-hot-toast";
import "../styles/FavoriteAnimation.css"; // ✅ CSS for heart animation

const PostCard = ({
  post,
  isUserPost = false,
  onLikeUpdate,
  onDeletePost,
  onReportPost,
  isBeingReported = false,
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

  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // Report reason options
  const reportReasons = [
    "Spam",
    "Inappropriate content",
    "Harassment or bullying",
    "False information",
    "Copyright infringement",
    "Violence or harmful behavior",
    "Hate speech",
    "Other"
  ];

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

  // ✅ Report functionality
  const handleReportClick = () => {
    if (isUserPost) {
      toast.error("You cannot report your own post");
      return;
    }
    setShowReportModal(true);
  };

  const handleReportSubmit = async () => {
    if (!reportReason.trim()) {
      toast.error("Please select or enter a reason for reporting");
      return;
    }

    if (!onReportPost) {
      toast.error("Report functionality is not available");
      return;
    }

    setReportSubmitting(true);

    try {
      const result = await onReportPost(postId, reportReason);
      
      if (result.success) {
        setShowReportModal(false);
        setReportReason("");
        // Post will be removed from feed by parent component
      } else {
        toast.error(result.message || "Failed to report post");
      }
    } catch (error) {
      console.error("Report submission error:", error);
      toast.error("Failed to report post");
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleReportModalClose = () => {
    if (reportSubmitting) return; // Prevent closing while submitting
    setShowReportModal(false);
    setReportReason("");
  };

  const handleReportReasonChange = (e) => {
    setReportReason(e.target.value);
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
          
          {/* Action buttons */}
          <div className="d-flex align-items-center gap-2">
            {/* Report button - only show for other users' posts */}
            {!isUserPost && (
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={handleReportClick}
                disabled={isBeingReported}
                title="Report this post"
              >
                {isBeingReported ? (
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Reporting...</span>
                  </div>
                ) : (
                  <FaFlag />
                )}
              </button>
            )}
            
            {/* Post dropdown for user's own posts */}
            {isUserPost && <PostDropdown postId={postId} onDelete={handleDeletePost} />}
          </div>
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
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-light"
              onClick={() => setShowComments((prev) => !prev)}
            >
              <FaCommentAlt /> {post.comments?.length || 0} comments
            </button>
            <ShareButton postId={postId} />
          </div>
        </div>

        {showComments && <PostComment postId={postId} />}
        
        {/* Likes Popup */}
        <LikesPopup
          show={showLikesPopup}
          onClose={() => setShowLikesPopup(false)}
          likes={likes}
          loading={loadingLikes}
        />

        {/* ✅ Report Modal */}
        {showReportModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <FaFlag className="me-2 text-danger" />
                    Report Post
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleReportModalClose}
                    disabled={reportSubmitting}
                  ></button>
                </div>
                
                <div className="modal-body">
                  <p className="text-muted mb-3">
                    Help us understand what's wrong with this post. Your report will be reviewed by our team.
                  </p>
                  
                  <div className="mb-3">
                    <label className="form-label">Reason for reporting:</label>
                    
                    {/* Predefined reasons */}
                    {reportReasons.map((reason) => (
                      <div key={reason} className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="reportReason"
                          id={`reason-${reason}`}
                          value={reason}
                          checked={reportReason === reason}
                          onChange={handleReportReasonChange}
                          disabled={reportSubmitting}
                        />
                        <label className="form-check-label" htmlFor={`reason-${reason}`}>
                          {reason}
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Custom reason input */}
                  <div className="mb-3">
                    <label className="form-label">Or specify your reason:</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Please describe why you're reporting this post..."
                      value={reportReason.startsWith('Spam') || 
                             reportReason.startsWith('Inappropriate') || 
                             reportReason.startsWith('Harassment') || 
                             reportReason.startsWith('False') || 
                             reportReason.startsWith('Copyright') || 
                             reportReason.startsWith('Violence') || 
                             reportReason.startsWith('Hate') || 
                             reportReason === 'Other' ? '' : reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      disabled={reportSubmitting || reportReasons.includes(reportReason)}
                    />
                  </div>

                  <div className="alert alert-warning small">
                    <strong>Note:</strong> False reports may result in account restrictions. 
                    Only report content that violates our community guidelines.
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleReportModalClose}
                    disabled={reportSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleReportSubmit}
                    disabled={!reportReason.trim() || reportSubmitting}
                  >
                    {reportSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Reporting...
                      </>
                    ) : (
                      <>
                        <FaFlag className="me-2" />
                        Submit Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;