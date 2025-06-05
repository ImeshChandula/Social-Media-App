import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from "../lib/axios";
import toast from 'react-hot-toast';
import "../styles/FriendsList.css";

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate()

  const fetchFriendsList = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/friends/allFriends');

      if (response.data.success) {
        setFriends(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to fetch friends list');
        setFriends([]);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch friends list';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching friends list:', err);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = (friend) => {
    setFriendToRemove(friend);
    setShowConfirmModal(true);
  };

  const confirmRemoveFriend = async () => {
    if (!friendToRemove) return;

    try {
      setActionLoading(prev => ({ ...prev, [friendToRemove.id]: true }));

      const response = await axiosInstance.delete(`/friends/removeFriend/${friendToRemove.id}`);

      if (response.data.success) {
        // Remove the friend from the list
        setFriends(prev => prev.filter(friend => friend.id !== friendToRemove.id));
        toast.success(`Removed ${friendToRemove.firstName || friendToRemove.username} from friends`);
      } else {
        toast.error(response.data.message || 'Failed to remove friend');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to remove friend';
      toast.error(errorMessage);
      console.error('Error removing friend:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [friendToRemove.id]: false }));
      setShowConfirmModal(false);
      setFriendToRemove(null);
    }
  };

  const cancelRemoveFriend = () => {
    setShowConfirmModal(false);
    setFriendToRemove(null);
  };

  // Filter friends based on search query
  const filteredFriends = friends.filter(friend => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${friend.firstName || ''} ${friend.lastName || ''}`.toLowerCase();
    const username = friend.username?.toLowerCase() || '';

    return fullName.includes(searchLower) || username.includes(searchLower);
  });

  useEffect(() => {
    fetchFriendsList();
  }, []);

  if (loading) {
    return (
      <div className="friends-list-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your friends...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="friends-list-container">
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button onClick={fetchFriendsList} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleNavigateToProfile = (friendId) => {
    navigate(`/profile/${friendId}`);
  };

  return (
    <div className="friends-list-container">
      <div className="header">
        <h2>My Friends</h2>
        <p className="subtitle">
          {friends.length > 0
            ? `You have ${friends.length} friend${friends.length > 1 ? 's' : ''}`
            : 'No friends yet'
          }
        </p>
      </div>

      {friends.length > 0 && (
        <div className="search-section">
          <div className="search-box">
            <div className="search-icon">🔍</div>
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="clear-search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {!friends || friends.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No Friends Yet</h3>
          <p>Start connecting with people to see them here!</p>
        </div>
      ) : filteredFriends.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No Friends Found</h3>
          <p>No friends match your search "{searchQuery}"</p>
        </div>
      ) : (
        <div className="friends-grid">
          {filteredFriends.map((friend) => (
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
                <div className="online-status"></div>
              </div>

              <div className="friend-info">
                <h3 className="friend-name"
                  onClick={() => handleNavigateToProfile(friend.id)}
                  style={{ cursor: 'pointer' }} >
                  {friend.firstName && friend.lastName
                    ? `${friend.firstName} ${friend.lastName}`
                    : friend.username
                  }
                </h3>
                <p className="friend-username"
                  onClick={() => handleNavigateToProfile(friend.id)}
                  style={{ cursor: 'pointer' }} >@{friend.username}</p>
                <p className="friend-stats">
                  <span className="friends-count">{friend.friendsCount || 0} friends</span>
                </p>
              </div>

              <div className="friend-actions">
                <button
                  onClick={() => handleRemoveFriend(friend)}
                  disabled={actionLoading[friend.id]}
                  className="remove-btn"
                >
                  {actionLoading[friend.id] ? (
                    <>
                      <div className="btn-spinner"></div>
                      Removing...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">🗑️</span>
                      Remove Friend
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Remove Friend</h3>
            </div>
            <div className="modal-body">
              <div className="modal-friend-info">
                <div className="modal-avatar">
                  {friendToRemove?.profilePicture ? (
                    <img src={friendToRemove.profilePicture} alt={friendToRemove.username} />
                  ) : (
                    <div className="avatar-placeholder">
                      {friendToRemove?.firstName?.[0]?.toUpperCase() || friendToRemove?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="modal-friend-name">
                    {friendToRemove?.firstName && friendToRemove?.lastName
                      ? `${friendToRemove.firstName} ${friendToRemove.lastName}`
                      : friendToRemove?.username
                    }
                  </p>
                  <p className="modal-friend-username">@{friendToRemove?.username}</p>
                </div>
              </div>
              <p className="modal-message">
                Are you sure you want to remove this person from your friends?
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-actions">
              <button
                onClick={cancelRemoveFriend}
                className="cancel-btn"
                disabled={actionLoading[friendToRemove?.id]}
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveFriend}
                className="confirm-remove-btn"
                disabled={actionLoading[friendToRemove?.id]}
              >
                {actionLoading[friendToRemove?.id] ? (
                  <>
                    <div className="btn-spinner"></div>
                    Removing...
                  </>
                ) : (
                  'Remove Friend'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Friends