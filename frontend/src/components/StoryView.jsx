import React, { useState, useEffect, useRef } from 'react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const StoryView = ({ userStories, onClose, onDelete, onUpdate, isUserPost = false, currentUserId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const intervalRef = useRef(null);
  const progressIntervalRef = useRef(null);
  
  const STORY_DURATION = 5000; // 5 seconds per story
  const PROGRESS_INTERVAL = 50; // Update progress every 50ms

  const currentStory = userStories.stories[currentIndex];

  // Helper function to check if current story belongs to the current user
  const isCurrentUserStory = () => {
    if (!currentStory || !currentUserId) return false;
    return currentStory.userId === currentUserId || currentStory.user?.id === currentUserId;
  };

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
    if (!isPaused && !isEditing && currentStory) {
      startStoryTimer();
    }
    
    return () => {
      clearStoryTimer();
    };
  }, [currentIndex, isPaused, isEditing]);

  // Initialize edit fields when editing starts
  useEffect(() => {
    if (isEditing && currentStory) {
      setEditContent(currentStory.content || '');
      setEditCaption(currentStory.caption || '');
    }
  }, [isEditing, currentStory]);

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
      setIsEditing(false);
      setShowOptions(false);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsEditing(false);
      setShowOptions(false);
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleDelete = async (storyId) => {
    if (!isCurrentUserStory()) {
      toast.error("You can only delete your own stories");
      return;
    }
    
    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to delete this story?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      await axiosInstance.delete(`/stories/delete/${storyId}`);
      onDelete(storyId);
      toast.success('Story deleted successfully');
      
      // Update local userStories to remove deleted story
      const updatedStories = userStories.stories.filter(story => story._id !== storyId);
      
      // If this was the last story, close viewer
      if (updatedStories.length === 0) {
        onClose();
        return;
      }
      
      // Update userStories object
      userStories.stories = updatedStories;
      
      // Adjust current index if necessary
      if (currentIndex >= updatedStories.length) {
        setCurrentIndex(updatedStories.length - 1);
      }
      
      setShowOptions(false);
    } catch (error) {
      console.error('Error deleting story:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete story';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!isCurrentUserStory()) {
      toast.error("You can only edit your own stories");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const updateData = {};
      
      // Get original values with proper fallbacks
      const originalContent = currentStory.content || '';
      const originalCaption = currentStory.caption || '';
      
      // Only include fields that have changed
      if (currentStory.type === 'text' && editContent.trim() !== originalContent.trim()) {
        updateData.content = editContent.trim();
      }
      
      // Always check caption for all story types
      if (editCaption.trim() !== originalCaption.trim()) {
        updateData.caption = editCaption.trim();
      }
      
      console.log('StoryView Update comparison:', {
        storyType: currentStory.type,
        originalContent: originalContent.trim(),
        editContent: editContent.trim(),
        originalCaption: originalCaption.trim(),
        editCaption: editCaption.trim(),
        updateData
      });
      
      // Check if there are any changes
      if (Object.keys(updateData).length === 0) {
        toast.info('No changes to save');
        setIsEditing(false);
        return;
      }
      
      console.log('Sending update request with:', updateData);
      
      const response = await axiosInstance.patch(`/stories/update/${currentStory._id}`, updateData);
      
      console.log('Update response:', response.data);
      
      // Update the story in local state
      const updatedStory = {
        ...currentStory,
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      // Update userStories
      userStories.stories[currentIndex] = updatedStory;
      
      // Call parent update handler
      onUpdate(updatedStory);
      
      setIsEditing(false);
      setShowOptions(false);
      toast.success('Story updated successfully');
    } catch (error) {
      console.error('Error updating story:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to update story';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset with proper fallbacks
    setEditContent(currentStory.content || '');
    setEditCaption(currentStory.caption || '');
    setShowOptions(false);
  };

  const handleKeyPress = (e) => {
    if (isEditing) return; // Don't handle navigation when editing
    
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
  }, [currentIndex, isEditing]);

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
            {isCurrentUserStory() && (
              <>
                <button 
                  className="story-action-btn" 
                  onClick={() => setShowOptions(!showOptions)}
                >
                  ⋯
                </button>
                {showOptions && (
                  <div className="story-options-menu">
                    <button 
                      className="story-option-btn"
                      onClick={() => {
                        setIsEditing(true);
                        setShowOptions(false);
                        setIsPaused(true);
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="story-option-btn story-delete-option"
                      onClick={() => handleDelete(currentStory._id)}
                      disabled={isLoading}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </>
            )}
            <button className="story-action-btn story-close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* Story Content */}
        <div className="story-content">
          {/* Click areas for navigation - only if not editing */}
          {!isEditing && (
            <>
              <div className="story-nav-left" onClick={prevStory} />
              <div className="story-nav-right" onClick={nextStory} />
            </>
          )}
          
          {isEditing ? (
            <div className="story-edit-form">
              <div className="edit-form-content">
                <h4 className="text-white mb-3">Edit Story</h4>
                
                {/* Content editor - only show for text stories */}
                {currentStory.type === 'text' && (
                  <div className="mb-3">
                    <label className="form-label text-white">Content:</label>
                    <textarea
                      className="form-control"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={4}
                      placeholder="What's on your mind?"
                      style={{ backgroundColor: '#495057', color: 'white', border: '1px solid #6c757d' }}
                    />
                  </div>
                )}
                
                {/* Caption editor - always show */}
                <div className="mb-3">
                  <label className="form-label text-white">Caption:</label>
                  <textarea
                    className="form-control"
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    rows={3}
                    placeholder="Add a caption..."
                    style={{ backgroundColor: '#495057', color: 'white', border: '1px solid #6c757d' }}
                  />
                </div>
                
                <div className="d-flex gap-2 justify-content-end">
                  <button 
                    className="btn btn-secondary"
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={handleUpdate}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Story indicators */}
        {!isEditing && (
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
        )}
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
          position: relative;
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

        .story-options-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: rgba(0, 0, 0, 0.9);
          border-radius: 8px;
          padding: 8px;
          margin-top: 4px;
          min-width: 120px;
        }

        .story-option-btn {
          display: block;
          width: 100%;
          background: none;
          border: none;
          color: white;
          padding: 8px 12px;
          text-align: left;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .story-option-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .story-delete-option {
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

        .story-edit-form {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .edit-form-content {
          background: rgba(255, 255, 255, 0.1);
          padding: 24px;
          border-radius: 12px;
          width: 100%;
          max-width: 320px;
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