
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCommentAlt,
  FaChevronRight,
  FaHeart,
  FaPlay,
  FaFlag,
  FaTimes,
  FaChevronLeft
} from "react-icons/fa";
import LikesPopup from "./LikesPopup";
import PostDropdown from "./PostDropdown";
import PostLikeButton from "./PostLikeButton";
import PostComment from "./PostComment";
import EditPagePost from "./EditPagePost";
import { axiosInstance } from "../lib/axios";
import useAuthStore from "../store/authStore";
import ShareButton from "./ShareButton";
import toast from "react-hot-toast";
import "../styles/FavoriteAnimation.css";

const PostCard = ({
  post,
  isUserPost = false,
  isPagePost = false,
  pageId = null,
  canEditPost = false,
  canDeletePost = false,
  onLikeUpdate,
  onDeletePost,
  onUpdatePost,
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

  // Lightbox state for viewing all images
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);

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
  const [burstHearts, setBurstHearts] = useState([]);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  // Determine if this is a page post
  const isPostFromPage = post.authorType === 'page' || post.author?.isPage;

  // Get display name for author
  const getAuthorDisplayName = () => {
    if (isPostFromPage) {
      return post.author?.pageName || post.author?.username || "Unknown Page";
    }
    return post.author?.username || "Unknown";
  };

  // Get author profile picture with fallback
  const getAuthorProfilePicture = () => {
    return post.author?.profilePicture || "/default-avatar.png";
  };

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
    
    // If it's a page post, navigate to page
    if (isPostFromPage) {
      const pageId = post.author?.id || post.author?._id;
      if (pageId) {
        navigate(`/pages/${pageId}`);
      }
      return;
    }
    
    // Otherwise navigate to user profile
    const authorId = post.author?.id || post.author?._id;
    const currentUserId = authUser?._id || authUser?.id;
    if (!authorId) return;
    navigate(authorId === currentUserId ? "/profile" : `/profile/${authorId}`);
  };

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

  const handleEditPost = (post) => {
    setShowEditModal(true);
  };

  const handlePostUpdated = (updatedPost) => {
    if (onUpdatePost) {
      onUpdatePost(updatedPost);
    }
    setShowEditModal(false);
    toast.success("Post updated successfully");
  };

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

    setReportSubmitting(true);

    try {
      const response = await axiosInstance.post(`/posts/report/${postId}`, {
        reason: reportReason.trim()
      });

      if (response.data.success) {
        toast.success("Post reported successfully");
        setShowReportModal(false);
        setReportReason("");
        
        if (onReportPost) {
          onReportPost(postId, reportReason);
        }
      } else {
        toast.error(response.data.message || "Failed to report post");
      }
    } catch (error) {
      console.error("Report submission error:", error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 400) {
        toast.error("You have already reported this post");
      } else {
        toast.error("Failed to report post. Please try again.");
      }
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleReportModalClose = () => {
    if (reportSubmitting) return;
    setShowReportModal(false);
    setReportReason("");
  };

  const handleReportReasonChange = (e) => {
    setReportReason(e.target.value);
  };

  const handleFavoriteClick = async () => {
    if (isFavoriteLoading) return;

    const newState = !isFavorited;
    setIsFavoriteLoading(true);
    setIsFavorited(newState); // Optimistic UI update

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
      const response = await axiosInstance[newState ? 'post' : 'delete'](
        `/posts/favorites/${newState ? 'add' : 'remove'}/${postId}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update favorite status");
      }

      setIsFavorited(newState);
      toast.success(newState ? "Added to favorites" : "Removed from favorites");
    } catch (error) {
      console.error("Favorite toggle failed", error);
      setIsFavorited(!newState); // Rollback on error
      const errorMessage = error.response?.data?.message || error.message || "Failed to update favorite status";
      if (error.response?.status === 400 && errorMessage.includes("already in favorites")) {
        toast.error("Post is already in favorites");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsFavoriteLoading(false);
    }
  };

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

  // Open lightbox at specific index
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setShowLightbox(true);
  };

  // Navigate in lightbox
  const handleLightboxPrev = () => {
    setLightboxIndex((prev) => (prev === 0 ? mediaArray.length - 1 : prev - 1));
  };

  const handleLightboxNext = () => {
    setLightboxIndex((prev) => (prev === mediaArray.length - 1 ? 0 : prev + 1));
  };

  const handleLightboxKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowLightbox(false);
    } else if (e.key === 'ArrowLeft') {
      handleLightboxPrev();
    } else if (e.key === 'ArrowRight') {
      handleLightboxNext();
    }
  };

  useEffect(() => {
    if (showLightbox) {
      window.addEventListener('keydown', handleLightboxKeyDown);
      return () => window.removeEventListener('keydown', handleLightboxKeyDown);
    }
  }, [showLightbox]);

  // Render media grid (for images only)
  const renderMediaGrid = () => {
    const images = mediaArray.filter(url => {
      const isVideo = /\.(mp4|webm|ogg)$/i.test(url) || post.mediaType === 'video';
      return !isVideo;
    });

    if (images.length === 0) return null;

    // Show max 4 images in grid
    const displayImages = images.slice(0, 4);
    const remainingCount = images.length - 4;

    const getGridClass = () => {
      if (images.length === 1) return 'single-image';
      if (images.length === 2) return 'two-images';
      if (images.length === 3) return 'three-images';
      return 'four-plus-images';
    };

    return (
      <div className={`media-grid ${getGridClass()}`}>
        {displayImages.map((url, idx) => (
          <div
            key={idx}
            className="media-grid-item"
            onClick={() => openLightbox(idx)}
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            <img
              src={url}
              alt={`Image ${idx + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: idx === 0 && images.length === 1 ? '0.75rem' : '0.25rem'
              }}
            />
            {/* Show +X overlay on 4th image if there are more images */}
            {idx === 3 && remainingCount > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  borderRadius: '0.25rem'
                }}
              >
                +{remainingCount}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render single video
  const renderVideo = () => {
    const videos = mediaArray.filter(url => {
      const isVideo = /\.(mp4|webm|ogg)$/i.test(url) || post.mediaType === 'video';
      return isVideo;
    });

    if (videos.length === 0) return null;

    return (
      <div className="position-relative">
        <video
          src={videos[currentMediaIndex] || videos[0]}
          controls
          className="w-100"
          style={{
            height: "clamp(200px, 30vw, 400px)",
            objectFit: "contain",
            borderRadius: "0.75rem",
          }}
        />
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
        {videos.length > 1 && (
          <div className="position-absolute bottom-0 start-0 end-0 p-2 text-center">
            <small className="bg-dark text-white px-2 py-1 rounded">
              Video {currentMediaIndex + 1} of {videos.length}
            </small>
            <div className="d-flex justify-content-center gap-2 mt-2">
              <button
                className="btn btn-sm btn-dark"
                onClick={() => setCurrentMediaIndex(Math.max(0, currentMediaIndex - 1))}
                disabled={currentMediaIndex === 0}
              >
                <FaChevronLeft />
              </button>
              <button
                className="btn btn-sm btn-dark"
                onClick={() => setCurrentMediaIndex(Math.min(videos.length - 1, currentMediaIndex + 1))}
                disabled={currentMediaIndex === videos.length - 1}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container px-0">
      <div className="card bg-white mb-4 shadow-sm rounded-4 mx-auto">
        <div className="card-header bg-white d-flex justify-content-between p-3 rounded-top-4">
          <div
            className="d-flex align-items-center gap-3"
            onClick={handleNavigateToProfile}
            style={{ cursor: disableNavigation ? "default" : "pointer" }}
          >
            <img
              src={getAuthorProfilePicture()}
              alt="Profile"
              className="rounded-circle"
              style={{ width: 50, height: 50, objectFit: "cover" }}
              onError={(e) => {
                e.target.src = "/default-avatar.png";
              }}
            />
            <div className="flex-grow-1 text-start">
              <h6 className="mb-0 fw-bold">
                {getAuthorDisplayName()}
                {isPostFromPage && (
                  <span className="badge bg-info text-white ms-2" style={{ fontSize: '0.7rem' }}>
                    Page
                  </span>
                )}
              </h6>
              <div className="d-flex align-items-center gap-2">
                <small className="text-muted">
                  {post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
                </small>
                {post.mediaType === 'video' && post.category && (
                  <span 
                    className={`badge ${getCategoryBadgeClass(post.category)} badge-sm cursor-pointer`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategoryClick(post.category);
                    }}
                    title={`View more ${post.category} videos`}
                    style={{ fontSize: '0.7rem' }}
                  >
                    {post.category}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-2">
            {/* Show report button for posts that are NOT user's and NOT page posts with edit rights */}
            {!isUserPost && !(isPagePost && (canEditPost || canDeletePost)) && (
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
            
            {/* Show dropdown for user posts or page posts with permissions */}
            {(isUserPost || (isPagePost && (canEditPost || canDeletePost))) && (
              <PostDropdown 
                post={post}
                postId={postId}
                onDelete={handleDeletePost}
                onEdit={handleEditPost}
                isPagePost={isPagePost}
                pageId={pageId}
                canEdit={isPagePost ? canEditPost : true}
                canDelete={isPagePost ? canDeletePost : true}
              />
            )}
          </div>
        </div>

        <div className="card-body p-4">
          {post.content && <p className="mb-3">{post.content}</p>}
          
          {post.location && (
            <div className="mb-3">
              <small className="text-muted">
                📍 {post.location}
              </small>
            </div>
          )}
          
          {/* Render media based on type */}
          {mediaArray.length > 0 && (
            <div className="text-center">
              {post.mediaType === 'video' ? renderVideo() : renderMediaGrid()}
            </div>
          )}
          
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

        <div className="card-footer px-4 bg-white d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
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

            <div className="favorite-container" onClick={handleFavoriteClick}>
              <FaHeart
                className={`favorite-icon ${isFavorited ? "favorited" : ""}`}
                title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                style={{ opacity: isFavoriteLoading ? 0.5 : 1 }}
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

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-light"
              onClick={() => setShowComments((prev) => !prev)}
            >
              <FaCommentAlt /> comments
            </button>
            <ShareButton postId={postId} />
          </div>
        </div>

        {showComments && <PostComment postId={postId} />}
        
        <LikesPopup
          show={showLikesPopup}
          onClose={() => setShowLikesPopup(false)}
          likes={likes}
          loading={loadingLikes}
        />

        {/* Edit Modal for Page Posts */}
        {showEditModal && isPagePost && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content border-0 shadow">
                <div className="modal-header border-bottom">
                  <h5 className="modal-title fw-bold text-dark">Edit Post</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowEditModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <EditPagePost
                    pageId={pageId}
                    post={post}
                    onPostUpdated={handlePostUpdated}
                    onCancel={() => setShowEditModal(false)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Modal */}
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

        {/* Lightbox Modal for viewing all images */}
        {showLightbox && mediaArray.length > 0 && (
          <div 
            className="modal show d-block" 
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.95)', 
              zIndex: 9999 
            }}
            onClick={() => setShowLightbox(false)}
          >
            <div className="modal-dialog modal-fullscreen">
              <div className="modal-content bg-transparent border-0">
                <div className="modal-header border-0 position-absolute top-0 end-0 z-3">
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowLightbox(false)}
                  ></button>
                </div>
                
                <div 
                  className="modal-body d-flex align-items-center justify-content-center position-relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Previous button */}
                  {mediaArray.length > 1 && (
                    <button
                      className="btn btn-light position-absolute start-0 ms-3"
                      style={{ zIndex: 10 }}
                      onClick={handleLightboxPrev}
                    >
                      <FaChevronLeft size={24} />
                    </button>
                  )}

                  {/* Current image */}
                  <img
                    src={mediaArray[lightboxIndex]}
                    alt={`Image ${lightboxIndex + 1}`}
                    style={{
                      maxWidth: '90%',
                      maxHeight: '90vh',
                      objectFit: 'contain'
                    }}
                  />

                  {/* Next button */}
                  {mediaArray.length > 1 && (
                    <button
                      className="btn btn-light position-absolute end-0 me-3"
                      style={{ zIndex: 10 }}
                      onClick={handleLightboxNext}
                    >
                      <FaChevronRight size={24} />
                    </button>
                  )}

                  {/* Image counter */}
                  <div 
                    className="position-absolute bottom-0 start-50 translate-middle-x mb-3 bg-dark bg-opacity-75 text-white px-3 py-2 rounded"
                    style={{ zIndex: 10 }}
                  >
                    {lightboxIndex + 1} / {mediaArray.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .media-grid {
          display: grid;
          gap: 4px;
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .single-image {
          grid-template-columns: 1fr;
        }

        .two-images {
          grid-template-columns: 1fr 1fr;
        }

        .three-images {
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
        }

        .three-images .media-grid-item:first-child {
          grid-row: 1 / 3;
        }

        .four-plus-images {
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
        }

        .media-grid-item {
          position: relative;
          overflow: hidden;
          min-height: 200px;
          max-height: 400px;
        }

        .single-image .media-grid-item {
          max-height: 600px;
        }

        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default PostCard;