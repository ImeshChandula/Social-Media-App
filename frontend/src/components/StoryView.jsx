// import { useCallback, useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { axiosInstance } from "../lib/axios";
// import Stories from "../components/Stories";
// import toast from "react-hot-toast";

// /**
//  * Full-screen story viewer for route /stories/:id
//  */
// const StoryView = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [story, setStory] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const fetchStory = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError("");
//       const { data } = await axiosInstance.get(`/stories/${id}`);
//       const { story: s, user } = data;

//       setStory({
//         ...s,
//         _id: s._id || s.id,
//         user: {
//           id: user.id,
//           username: user.username,
//           profilePicture: user.profilePicture,
//           firstName: user.firstName ?? "",
//           lastName: user.lastName ?? "",
//         },
//       });

//       axiosInstance.put(`/stories/${id}/view`).catch(() => {});
//     } catch (err) {
//       const msg = err?.response?.data?.message || "Failed to load story";
//       setError(msg);
//       toast.error(msg);
//     } finally {
//       setLoading(false);
//     }
//   }, [id]);

//   useEffect(() => {
//     fetchStory();
//   }, [fetchStory]);

//   if (loading) {
//     return (
//       <div className="d-flex vh-100 justify-content-center align-items-center text-white">
//         <div className="spinner-border me-2" role="status" />
//         Loading…
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="vh-100 d-flex flex-column justify-content-center align-items-center">
//         <p className="alert alert-danger">{error}</p>
//         <button className="btn btn-secondary mt-2" onClick={() => navigate(-1)}>
//           Go back
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="container py-4" style={{ maxWidth: 600 }}>
//       <button className="btn btn-link text-white mb-3" onClick={() => navigate(-1)}>
//         <i className="bi bi-arrow-left" /> Back
//       </button>

//       <Stories
//         post={story}
//         isUserPost={story.user?.id === story.userId}
//         onDelete={() => navigate(-1)}
//         onStoriesUpdate={setStory}
//         isPreview={false}
//       />
//     </div>
//   );
// };

// export default StoryView;


//new-----------------------------------------------------------------------------------------------------------------

import React, { useState, useEffect, useRef } from 'react';
import { axiosInstance } from '../lib/axios';
// import '../styles/StoryView.css'; // Assuming you have a CSS file for styles

const StoryView = ({ userStories, onClose, onDelete, onUpdate, isUserPost = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef(null);
  const progressIntervalRef = useRef(null);
  
  const STORY_DURATION = 5000; // 5 seconds per story
  const PROGRESS_INTERVAL = 50; // Update progress every 50ms

  const currentStory = userStories.stories[currentIndex];

  // Helper function to get user info with fallback
  const getUserInfo = () => {
    // First check if user info is in the userStories object
    if (userStories.user && userStories.user.username && userStories.user.username !== 'Unknown User') {
      return userStories.user;
    }
    
    // Fallback to current story's user info
    if (currentStory && currentStory.user && currentStory.user.username && currentStory.user.username !== 'Unknown User') {
      return currentStory.user;
    }
    
    // Last resort: check if any story has valid user info
    const storyWithUser = userStories.stories.find(story => 
      story.user && story.user.username && story.user.username !== 'Unknown User'
    );
    
    if (storyWithUser) {
      return storyWithUser.user;
    }
    
    // Default fallback
    return {
      id: 'unknown',
      username: 'Unknown User',
      firstName: '',
      lastName: '',
      profilePicture: 'https://via.placeholder.com/40'
    };
  };

  const userInfo = getUserInfo();

  useEffect(() => {
    if (!isPaused && currentStory) {
      startStoryTimer();
    }
    
    return () => {
      clearStoryTimer();
    };
  }, [currentIndex, isPaused]);

  const startStoryTimer = () => {
    clearStoryTimer();
    setProgress(0);
    
    // Progress bar animation
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + (100 / (STORY_DURATION / PROGRESS_INTERVAL));
      });
    }, PROGRESS_INTERVAL);
  };

  const clearStoryTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const nextStory = () => {
    if (currentIndex < userStories.stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleDelete = async (storyId) => {
    if (!isUserPost) return;
    
    try {
      setIsLoading(true);
      await axiosInstance.delete(`/stories/${storyId}`);
      onDelete(storyId);
      
      // If this was the last story, close viewer
      if (userStories.stories.length === 1) {
        onClose();
      } else if (currentIndex === userStories.stories.length - 1) {
        // If we're deleting the last story, go to previous
        setCurrentIndex(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error deleting story:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    switch (e.key) {
      case 'ArrowLeft':
        prevStory();
        break;
      case 'ArrowRight':
        nextStory();
        break;
      case 'Escape':
        onClose();
        break;
      case ' ':
        e.preventDefault();
        handlePause();
        break;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'now';
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  // Helper function to get display name
  const getDisplayName = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || 'Unknown User';
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentIndex]);

  if (!currentStory) return null;

  return (
    <div className="story-viewer-overlay" onClick={onClose}>
      <div className="story-viewer-container" onClick={e => e.stopPropagation()}>
        {/* Progress bars */}
        <div className="story-progress-container">
          {userStories.stories.map((_, index) => (
            <div key={index} className="story-progress-bar">
              <div 
                className="story-progress-fill"
                style={{
                  width: index < currentIndex ? '100%' : 
                         index === currentIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="story-header">
          <div className="story-user-info">
            <img
              src={userInfo.profilePicture || 'https://via.placeholder.com/40'}
              alt={userInfo.username || 'User'}
              className="story-user-avatar"
            />
            <div className="story-user-details">
              <span className="story-username">
                {getDisplayName(userInfo)}
              </span>
              <span className="story-time">{formatTime(currentStory.createdAt)}</span>
            </div>
          </div>
          
          <div className="story-actions">
            <button className="story-action-btn" onClick={handlePause}>
              {isPaused ? '▶️' : '⏸️'}
            </button>
            {isUserPost && (
              <button 
                className="story-action-btn story-delete-btn" 
                onClick={() => handleDelete(currentStory._id)}
                disabled={isLoading}
              >
                🗑️
              </button>
            )}
            <button className="story-action-btn story-close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* Story Content */}
        <div className="story-content">
          {/* Click areas for navigation */}
          <div className="story-nav-left" onClick={prevStory} />
          <div className="story-nav-right" onClick={nextStory} />
          
          {currentStory.media ? (
            <img
              src={currentStory.media}
              alt="Story content"
              className="story-media"
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          ) : (
            <div className="story-text-content">
              <p>{currentStory.content}</p>
            </div>
          )}
          
          {currentStory.caption && (
            <div className="story-caption">
              <p>{currentStory.caption}</p>
            </div>
          )}
        </div>

        {/* Story indicators */}
        <div className="story-indicators">
          <span className="story-counter">
            {currentIndex + 1} / {userStories.stories.length}
          </span>
          {currentStory.viewCount > 0 && (
            <span className="story-views">
              👁️ {currentStory.viewCount}
            </span>
          )}
        </div>
      </div>

      <style jsx>{`
        .story-viewer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        .story-viewer-container {
          width: 375px;
          height: 667px;
          background: #000;
          border-radius: 12px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .story-progress-container {
          position: absolute;
          top: 12px;
          left: 12px;
          right: 12px;
          display: flex;
          gap: 4px;
          z-index: 10;
        }

        .story-progress-bar {
          flex: 1;
          height: 3px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          overflow: hidden;
        }

        .story-progress-fill {
          height: 100%;
          background: white;
          transition: width 0.05s linear;
        }

        .story-header {
          position: absolute;
          top: 32px;
          left: 12px;
          right: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 10;
        }

        .story-user-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .story-user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .story-user-details {
          display: flex;
          flex-direction: column;
        }

        .story-username {
          color: white;
          font-size: 14px;
          font-weight: 600;
          margin: 0;
        }

        .story-time {
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
          margin: 0;
        }

        .story-actions {
          display: flex;
          gap: 8px;
        }

        .story-action-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 16px;
          padding: 8px;
          border-radius: 50%;
          transition: background 0.2s;
        }

        .story-action-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .story-delete-btn {
          color: #ff4444;
        }

        .story-close-btn {
          font-size: 20px;
          font-weight: bold;
        }

        .story-content {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .story-nav-left {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 50%;
          z-index: 5;
          cursor: pointer;
        }

        .story-nav-right {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 50%;
          z-index: 5;
          cursor: pointer;
        }

        .story-media {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .story-text-content {
          padding: 40px 20px;
          text-align: center;
          color: white;
        }

        .story-text-content p {
          font-size: 24px;
          line-height: 1.4;
          margin: 0;
          word-wrap: break-word;
        }

        .story-caption {
          position: absolute;
          bottom: 60px;
          left: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.5);
          padding: 12px;
          border-radius: 8px;
          color: white;
        }

        .story-caption p {
          margin: 0;
          font-size: 14px;
          line-height: 1.4;
        }

        .story-indicators {
          position: absolute;
          bottom: 20px;
          left: 20px;
          right: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 10;
        }

        .story-counter,
        .story-views {
          color: rgba(255, 255, 255, 0.8);
          font-size: 12px;
          background: rgba(0, 0, 0, 0.5);
          padding: 4px 8px;
          border-radius: 12px;
        }

        @media (max-width: 768px) {
          .story-viewer-container { 
            width: 100vw;
            height: 100vh;
            border-radius: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default StoryView;