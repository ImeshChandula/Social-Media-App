import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const PageStoriesManagement = ({ pageId, pageName, isOwner = false }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showStoryModal, setShowStoryModal] = useState(false);

  useEffect(() => {
    if (pageId) {
      fetchPageStories();
    }
  }, [pageId]);

  const fetchPageStories = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/pages/${pageId}/stories`);
      if (res?.data?.success) {
        setStories(res.data.stories || []);
      }
    } catch (err) {
      console.error('Error fetching stories:', err);
      toast.error("Failed to load stories");
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = (story) => {
    setSelectedStory(story);
    setShowStoryModal(true);
  };

  const handleDeleteStory = async (storyId) => {
    if (!window.confirm("Delete this story? This action cannot be undone.")) return;
    
    try {
      const res = await axiosInstance.delete(`/stories/delete/${storyId}`);
      if (res?.data?.success || res?.status === 200) {
        setStories(prev => prev.filter(story => story.id !== storyId));
        setShowStoryModal(false);
        toast.success("Story deleted successfully");
      }
    } catch (err) {
      console.error('Error deleting story:', err);
      toast.error("Failed to delete story");
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const storyDate = new Date(dateString);
    const diffInHours = Math.floor((now - storyDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - storyDate) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return storyDate.toLocaleDateString();
    }
  };

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffInHours = Math.floor((expiry - now) / (1000 * 60 * 60));
    
    if (diffInHours <= 0) return "Expired";
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((expiry - now) / (1000 * 60));
      return `${diffInMinutes}m left`;
    }
    return `${diffInHours}h left`;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading stories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      {stories.length === 0 ? (
        <div className="text-center py-5">
          <div className="card bg-dark border-secondary">
            <div className="card-body py-5">
              <i className="fas fa-plus-circle text-muted" style={{ fontSize: "4rem" }}></i>
              <h3 className="text-white mt-3 mb-2">No Stories Yet</h3>
              <p className="text-white-50 mb-4">
                {isOwner 
                  ? "Create your first story to start engaging with your audience!" 
                  : "This page hasn't shared any stories yet. Check back later!"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h4 className="text-white mb-0">
              <i className="fas fa-play-circle me-2 text-primary"></i>
              Page Stories ({stories.length})
            </h4>
          </div>

          <div className="row g-3">
            {stories.map((story) => (
              <div key={story.id || story._id} className="col-6 col-md-4 col-lg-3">
                <motion.div
                  className="story-card position-relative"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleStoryClick(story)}
                  style={{
                    cursor: "pointer",
                    height: "280px",
                    borderRadius: "16px",
                    overflow: "hidden",
                    background: story.media
                      ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${story.media})`
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    border: "2px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
                  }}
                >
                  {/* Story Content Overlay */}
                  <div className="position-absolute bottom-0 start-0 w-100 p-3">
                    {story.content && (
                      <div className="text-white mb-2" style={{
                        fontSize: "14px",
                        lineHeight: "1.3",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}>
                        {story.content}
                      </div>
                    )}
                    
                    {story.caption && (
                      <div className="text-white-50 mb-2" style={{
                        fontSize: "12px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}>
                        {story.caption}
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-white-50" style={{ fontSize: "12px" }}>
                        {formatTimeAgo(story.createdAt)}
                      </span>
                      <span className="badge bg-primary" style={{ fontSize: "10px" }}>
                        {getTimeRemaining(story.expiresAt)}
                      </span>
                    </div>
                  </div>

                  {/* Story Type Indicator */}
                  <div className="position-absolute top-0 end-0 p-2">
                    {story.type === 'image' && <i className="fas fa-image text-white"></i>}
                    {story.type === 'video' && <i className="fas fa-video text-white"></i>}
                    {story.type === 'text' && <i className="fas fa-font text-white"></i>}
                  </div>

                  {/* View Count */}
                  <div className="position-absolute top-0 start-0 p-2">
                    <span className="badge bg-dark bg-opacity-75 text-white" style={{ fontSize: "10px" }}>
                      <i className="fas fa-eye me-1"></i>
                      {story.viewCount || 0}
                    </span>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Story Modal */}
      <AnimatePresence>
        {showStoryModal && selectedStory && (
          <StoryModal
            story={selectedStory}
            onClose={() => {
              setShowStoryModal(false);
              setSelectedStory(null);
            }}
            onDelete={handleDeleteStory}
            isOwner={isOwner}
            pageName={pageName}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Story Modal Component
const StoryModal = ({ story, onClose, onDelete, isOwner, pageName }) => {
  const [viewingStory, setViewingStory] = useState(false);

  useEffect(() => {
    // Mark story as viewed when opened (if not owner)
    if (!isOwner && story.id) {
      markStoryAsViewed();
    }
  }, [story.id, isOwner]);

  const markStoryAsViewed = async () => {
    if (viewingStory) return;
    setViewingStory(true);
    
    try {
      await axiosInstance.put(`/stories/${story.id}/view`);
    } catch (err) {
      console.error('Error marking story as viewed:', err);
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const storyDate = new Date(dateString);
    const diffInHours = Math.floor((now - storyDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - storyDate) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return storyDate.toLocaleDateString();
    }
  };

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffInHours = Math.floor((expiry - now) / (1000 * 60 * 60));
    
    if (diffInHours <= 0) return "Expired";
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((expiry - now) / (1000 * 60));
      return `${diffInMinutes}m left`;
    }
    return `${diffInHours}h left`;
  };

  return (
    <motion.div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.95)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div 
        className="modal-dialog modal-dialog-centered h-100 m-0 d-flex align-items-center justify-content-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="position-relative" style={{ maxWidth: "400px", width: "100%" }}>
          {/* Story Container */}
          <motion.div
            className="story-container position-relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            style={{
              height: "600px",
              borderRadius: "20px",
              overflow: "hidden",
              background: story.media
                ? `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url(${story.media})`
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
            }}
          >
            {/* Close Button */}
            <button
              className="btn btn-dark btn-sm position-absolute"
              style={{ top: "15px", right: "15px", zIndex: 10 }}
              onClick={onClose}
            >
              <i className="fas fa-times"></i>
            </button>

            {/* Delete Button (Owner Only) */}
            {isOwner && (
              <button
                className="btn btn-danger btn-sm position-absolute"
                style={{ top: "15px", right: "60px", zIndex: 10 }}
                onClick={() => onDelete(story.id)}
              >
                <i className="fas fa-trash"></i>
              </button>
            )}

            {/* Story Header */}
            <div className="position-absolute top-0 start-0 w-100 p-3" style={{ zIndex: 5 }}>
              <div className="d-flex align-items-center text-white">
                <img
                  src={story.author?.profilePicture || "/default-page-avatar.png"}
                  alt={story.author?.name || pageName}
                  className="rounded-circle me-3"
                  style={{ width: "40px", height: "40px", objectFit: "cover" }}
                />
                <div>
                  <div className="fw-bold">{story.author?.name || pageName}</div>
                  <div className="small text-white-50">{formatTimeAgo(story.createdAt)}</div>
                </div>
                <div className="ms-auto">
                  <span className="badge bg-primary small">
                    {getTimeRemaining(story.expiresAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Story Content */}
            <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{ zIndex: 5 }}>
              {story.content && (
                <div className="text-white mb-3" style={{ fontSize: "18px", lineHeight: "1.4" }}>
                  {story.content}
                </div>
              )}
              
              {story.caption && (
                <div className="text-white-50 mb-3" style={{ fontSize: "16px" }}>
                  {story.caption}
                </div>
              )}

              {/* Story Stats */}
              <div className="d-flex justify-content-between align-items-center text-white-50">
                <div>
                  <i className="fas fa-eye me-2"></i>
                  {story.viewCount || 0} views
                </div>
                <div>
                  <span className="badge bg-dark bg-opacity-50">
                    <i className={`fas ${
                      story.type === 'image' ? 'fa-image' : 
                      story.type === 'video' ? 'fa-video' : 
                      'fa-font'
                    } me-1`}></i>
                    {story.type}
                  </span>
                </div>
              </div>
            </div>

            {/* Video Controls (if video) */}
            {story.type === 'video' && story.media && (
              <video
                controls
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{ objectFit: "cover", zIndex: 1 }}
                poster={story.media}
              >
                <source src={story.media} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PageStoriesManagement;