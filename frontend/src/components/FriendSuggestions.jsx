import React, { useState, useEffect } from 'react';
import { axiosInstance } from "../lib/axios";
import toast from 'react-hot-toast';
import "../styles/FriendSuggestions.css";
import { useNavigate } from 'react-router-dom';
import useThemeStore from '../store/themeStore';

const FriendSuggestions = () => {
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState(null);
  const { isDarkMode } = useThemeStore();

  const navigate = useNavigate()

  const fetchSuggestedFriends = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/friends/allSuggestFriends');

      if (response.data.success) {
        setSuggestedFriends(response.data.data.suggestedFriends || []);
      } else {
        setSuggestedFriends([]);
        toast.error(response.data.message || 'Failed to fetch suggested friends');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch suggested friends');
      toast.error(err.response?.data?.message || err.message);
      console.error('Error fetching suggested friends:', err);
      // Ensure we set an empty array on error
      setSuggestedFriends([]);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));

      const response = await axiosInstance.post(`/friends/friend-request/send/${userId}`);

      if (response.data.success) {
        // Update the friend request status locally
        setSuggestedFriends(prev =>
          prev.map(friend =>
            friend.id === userId
              ? { ...friend, friendRequestSent: true }
              : friend
          )
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to send friend request');
      console.error('Error sending friend request:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const cancelFriendRequest = async (userId) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));

      const response = await axiosInstance.delete(`/friends/friend-request/cancel/${userId}`);

      if (response.data.success) {
        // Update the friend request status locally
        setSuggestedFriends(prev =>
          prev.map(friend =>
            friend.id === userId
              ? { ...friend, friendRequestSent: false }
              : friend
          )
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to cancel friend request');
      console.error('Error cancelling friend request:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  useEffect(() => {
    fetchSuggestedFriends();
  }, []);

  const handleNavigateToProfile = (friendId) => {
    navigate(`/profile/${friendId}`);
  };

  if (loading) {
    return (
      <div className="suggested-friends-container">
        <div style={{ textAlign: 'center' }}>
          <div className="spinner"></div>
          <p className={`text-center ${isDarkMode ? "text-white" : "text-black"}`} >Loading suggested friends...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="suggested-friends-container">
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={fetchSuggestedFriends} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="suggested-friends-container">
      <div className="header">
        <h2>People You May Know</h2>
        <p className={`subtitle ${isDarkMode ? "" : "subtitle-light"}`}>Connect with friends and expand your network</p>
      </div>

      {/* Add additional safety check here */}
      {!suggestedFriends || suggestedFriends.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No Suggestions Available</h3>
          <p>Check back later for new friend suggestions!</p>
        </div>
      ) : (
        <div className="friends-grid">
          {suggestedFriends.map((friend) => (
            <div key={friend.id} className="friend-card">
              <div className="friend-avatar">
                {friend.profilePicture ? (
                  <img src={friend.profilePicture}
                    alt={friend.username}
                    onClick={() => handleNavigateToProfile(friend.id)}
                    style={{ cursor: 'pointer' }} />
                ) : (
                  <div className="avatar-placeholder">
                    {friend.firstName?.[0]?.toUpperCase() || friend.username?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>

              <div className="friend-info">
                <h3 className="friend-name"
                  onClick={() => handleNavigateToProfile(friend.id)}
                  style={{ cursor: 'pointer' }}>
                  {friend.firstName && friend.lastName
                    ? `${friend.firstName} ${friend.lastName}`
                    : friend.username
                  }
                </h3>
                <p className="friend-username"
                  onClick={() => handleNavigateToProfile(friend.id)}
                  style={{ cursor: 'pointer' }}>@{friend.username}</p>
                <p className="friend-stats">
                  <span className="friends-count">{friend.friendsCount} friends</span>
                </p>
              </div>

              <div className="friend-actions">
                {friend.friendRequestSent ? (
                  <button
                    onClick={() => cancelFriendRequest(friend.id)}
                    disabled={actionLoading[friend.id]}
                    className="cancel-btn"
                  >
                    {actionLoading[friend.id] ? (
                      <>
                        <div className="btn-spinner"></div>
                        Canceling...
                      </>
                    ) : (
                      'Cancel Request'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => sendFriendRequest(friend.id)}
                    disabled={actionLoading[friend.id]}
                    className="add-friend-btn"
                  >
                    {actionLoading[friend.id] ? (
                      <>
                        <div className="btn-spinner"></div>
                        Sending...
                      </>
                    ) : (
                      'Add Friend'
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FriendSuggestions