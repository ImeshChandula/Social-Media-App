import React, { useState, useEffect } from "react";
import moment from 'moment';
import StoriesPopup from './StoriesPopup';
import { axiosInstance } from '../lib/axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Stories = ({ post, isUserPost = false, onDelete, onStoriesUpdate, isPreview = false }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(post?.caption || '');
  const [error, setError] = useState('');
  const [user, setUser] = useState(post?.user || null);
  const navigate = useNavigate();

  // Fetch user details if incomplete
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!post?.userId || (post?.user && post.user.username && post.user.profilePicture)) {
        return; // Skip if userId is missing or user data is complete
      }

      try {
        const endpoint = isUserPost ? '/users/myProfile' : `/users/getUserById/${post.userId}`;
        const response = await axiosInstance.get(endpoint);
        const userData = isUserPost ? response.data.user : response.data.user;
        console.log('Fetched user details:', userData);

        setUser({
          id: userData?.id || post.userId,
          username: userData?.username || 'Unknown User',
          firstName: userData?.firstName || '',
          lastName: userData?.lastName || '',
          profilePicture: userData?.profilePicture || 'https://via.placeholder.com/40',
        });
      } catch (err) {
        console.error('Failed to fetch user details:', err.response || err);
        setUser({
          id: post.userId || 'unknown',
          username: 'Unknown User',
          profilePicture: 'https://via.placeholder.com/40',
        });
        toast.error('Failed to load user details');
      }
    };

    fetchUserDetails();
  }, [post?.userId, post?.user, isUserPost]);

  const handleDelete = async () => {
    try {
      if (!post?._id) {
        throw new Error('Invalid story ID');
      }
      await axiosInstance.delete(`/stories/delete/${post._id}`);
      onDelete?.(post._id);
      setShowPopup(false);
      toast.success('Story deleted successfully');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete story';
      setError(errorMessage);
      console.error('Failed to delete story:', err.response || err);
      toast.error(errorMessage);
    }
  };

  const handleUpdate = async () => {
    try {
      setError('');
      if (!post?._id) {
        throw new Error('Invalid story ID');
      }
      const payload = { caption: caption.trim() || undefined };
      const res = await axiosInstance.patch(`/stories/update/${post._id}`, payload);
      onStoriesUpdate?.(res.data.story);
      setIsEditing(false);
      toast.success('Story updated successfully');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update story';
      setError(errorMessage);
      console.error('Failed to update story:', err.response || err);
      toast.error(errorMessage);
    }
  };

  const renderMedia = () => {
    if (!post) {
      return <div style={{ height: '160px', background: '#333', borderRadius: '8px' }} />;
    }

    if (isPreview) {
      // Compact preview for story bar
      if (post.type === 'image' && post.media) {
        return (
          <img
            src={post.media}
            alt={post.caption || 'Story preview'}
            className="img-fluid rounded"
            style={{ width: '100%', height: '160px', objectFit: 'cover' }}
            onError={(e) => (e.target.src = 'https://via.placeholder.com/120')}
          />
        );
      } else if (post.type === 'video' && post.media) {
        return (
          <video
            className="w-100 rounded"
            style={{ height: '160px', objectFit: 'cover' }}
            muted
            poster={post.media}
          >
            <source src={post.media} type="video/mp4" />
          </video>
        );
      } else if (post.type === 'text' && post.content) {
        return (
          <div
            className="p-2 rounded text-center d-flex align-items-center justify-content-center"
            style={{
              height: '160px',
              background: 'linear-gradient(45deg, #405de6, #5851db, #833ab4, #c13584)',
              overflow: 'hidden',
            }}
          >
            <p className="text-white mb-0" style={{ fontSize: '0.9rem', fontWeight: '500' }}>
              {post.content.length > 30 ? `${post.content.slice(0, 30)}...` : post.content}
            </p>
          </div>
        );
      }
      return <div style={{ height: '160px', background: '#333', borderRadius: '8px' }} />;
    }

    // Full story rendering
    if (post.type === 'image' && post.media) {
      return (
        <img
          src={post.media}
          alt={post.caption || 'Story media'}
          className="img-fluid rounded"
          style={{ maxHeight: '400px', objectFit: 'cover', width: '100%' }}
          onError={(e) => (e.target.src = 'https://via.placeholder.com/400')}
        />
      );
    } else if (post.type === 'video' && post.media) {
      return (
        <video
          controls
          className="w-100 rounded"
          style={{ maxHeight: '400px' }}
        >
          <source src={post.media} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else if (post.type === 'text' && post.content) {
      return (
        <div
          className="bg-gradient p-3 rounded text-center d-flex align-items-center justify-content-center"
          style={{ minHeight: '200px', background: 'linear-gradient(45deg, #405de6, #5851db, #833ab4, #c13584)' }}
        >
          <p className="text-white mb-0" style={{ fontSize: '1.2rem', fontWeight: '500' }}>
            {post.content}
          </p>
        </div>
      );
    }
    return (
      <div className="text-center text-white p-3">
        No media available
      </div>
    );
  };

  if (!post) {
    return (
      <div className="text-center text-white p-3">
        Invalid story data
      </div>
    );
  }

  return (
    <>
      {isPreview ? (
        <div
          className="position-relative text-white"
          style={{ width: '120px', cursor: 'pointer' }}
          onClick={() => {
            if (post._id) {
              console.log('Navigating to story:', post._id);
              navigate(`/stories/${post._id}`);
            } else {
              console.error('Invalid story ID for navigation');
              toast.error('Cannot view story: Invalid ID');
            }
          }}
        >
          <div
            className="rounded overflow-hidden"
            style={{
              border: `2px solid ${post.viewCount > 0 ? '#6c757d' : '#3897f0'}`,
              padding: '2px',
            }}
          >
            {renderMedia()}
          </div>
          <div
            className="position-absolute top-0 start-0 p-1"
            style={{ width: '100%' }}
          >
            <img
              src={user?.profilePicture || 'https://via.placeholder.com/40'}
              alt="profile"
              className="rounded-circle"
              style={{
                width: '32px',
                height: '32px',
                objectFit: 'cover',
                border: '2px solid #fff',
              }}
              onError={(e) => (e.target.src = 'https://via.placeholder.com/40')}
            />
          </div>
          <div
            className="text-center mt-1"
            style={{ fontSize: '0.8rem', fontWeight: '500' }}
          >
            {user?.username || user?.firstName || user?.lastName || 'Unknown'}
          </div>
        </div>
      ) : (
        <div className="card bg-dark text-white mb-4 position-relative border-0 shadow-sm" style={{ borderRadius: '10px' }}>
          {error && (
            <div className="alert alert-danger alert-dismissible fade show m-3" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError('')} />
            </div>
          )}
          <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center">
                <img
                  src={user?.profilePicture || 'https://via.placeholder.com/40'}
                  alt="profile"
                  className="rounded-circle me-2"
                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                  onError={(e) => (e.target.src = 'https://via.placeholder.com/40')}
                />
                <div>
                  <h6 className="mb-0" style={{ fontWeight: '600' }}>
                    {user?.username || user?.firstName || user?.lastName || 'Unknown User'}
                  </h6>
                  <small className="text-muted">
                    {moment(post.createdAt).fromNow()} • {post.privacy === 'friends' ? '👥 Friends' : '🌎 Public'}
                  </small>
                </div>
              </div>
              {isUserPost && (
                <div className="position-relative">
                  <button
                    className="btn btn-sm text-light"
                    onClick={() => setShowPopup((prev) => !prev)}
                  >
                    ⋮
                  </button>
                  {showPopup && (
                    <StoriesPopup
                      onDelete={handleDelete}
                      onEdit={() => {
                        setIsEditing(true);
                        setShowPopup(false);
                      }}
                    />
                  )}
                </div>
              )}
            </div>

            {renderMedia()}

            <div className="mt-3">
              {isEditing ? (
                <div>
                  <textarea
                    className="form-control mb-2"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Enter caption"
                    rows={2}
                  />
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-success"
                      onClick={handleUpdate}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        setIsEditing(false);
                        setCaption(post.caption || '');
                        setError('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="mt-2 mb-1">{post.caption || 'No caption'}</p>
                  {post.viewCount > 0 && (
                    <small className="text-muted">
                      Viewed by {post.viewCount || 0} {post.viewCount === 1 ? 'person' : 'people'}
                    </small>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Stories;