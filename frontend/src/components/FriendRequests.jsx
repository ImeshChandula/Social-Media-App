import React, { useState, useEffect } from 'react';
import { axiosInstance } from "../lib/axios";
import toast from 'react-hot-toast';
import "../styles/FriendRequests.css";
import { useNavigate } from 'react-router-dom';
import useThemeStore from '../store/themeStore';

const FriendRequests = () => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState(null);
  const { isDarkMode } = useThemeStore();

  const navigate = useNavigate()

  const fetchFriendRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/friends/friend-requests/getAll');

      if (response.data.success) {
        setFriendRequests(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to fetch friend requests');
        setFriendRequests([]);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch friend requests';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching friend requests:', err);
      setFriendRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const acceptFriendRequest = async (userId) => {
    try {
      setActionLoading(prev => ({ ...prev, [`accept_${userId}`]: true }));

      const response = await axiosInstance.post(`/friends/friend-request/accept/${userId}`);

      if (response.data.success) {
        // Remove the accepted request from the list
        setFriendRequests(prev => prev.filter(request => request.id !== userId));
        toast.success('Friend request accepted!');
      } else {
        toast.error(response.data.message || 'Failed to accept friend request');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to accept friend request';
      toast.error(errorMessage);
      console.error('Error accepting friend request:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [`accept_${userId}`]: false }));
    }
  };

  const rejectFriendRequest = async (userId) => {
    try {
      setActionLoading(prev => ({ ...prev, [`reject_${userId}`]: true }));

      const response = await axiosInstance.post(`/friends/friend-request/reject/${userId}`);

      if (response.data.success) {
        // Remove the rejected request from the list
        setFriendRequests(prev => prev.filter(request => request.id !== userId));
        toast.success('Friend request rejected');
      } else {
        toast.error(response.data.message || 'Failed to reject friend request');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to reject friend request';
      toast.error(errorMessage);
      console.error('Error rejecting friend request:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [`reject_${userId}`]: false }));
    }
  };

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  if (loading) {
    return (
      <div className="friend-requests-container">
        <div style={{ textAlign: 'center' }}>
          <div className="spinner"></div>
          <p className={`text-center ${isDarkMode ? "text-white" : "text-black"}`}>Loading friend requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="friend-requests-container">
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button onClick={fetchFriendRequests} className="retry-btn">
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
    <div className="friend-requests-container">
      <div className="header">
        <h2>Friend Requests</h2>
        <p className={`subtitle ${isDarkMode ? "" : "subtitle-light"}`}>
          {friendRequests.length > 0
            ? `You have ${friendRequests.length} pending request${friendRequests.length > 1 ? 's' : ''}`
            : 'No pending requests'
          }
        </p>
      </div>

      {!friendRequests || friendRequests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📬</div>
          <h3>No Friend Requests</h3>
          <p>When someone sends you a friend request, it will appear here.</p>
        </div>
      ) : (
        <div className="requests-list">
          {friendRequests.map((request) => (
            <div key={request.id} className="request-card">
              <div className="request-avatar">
                {request.profilePicture ? (
                  <img
                    src={request.profilePicture}
                    alt={request.username}
                    onClick={() => handleNavigateToProfile(request.id)}
                    style={{ cursor: 'pointer' }}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {request.firstName?.[0]?.toUpperCase() || request.username?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>

              <div className="request-info">
                <h3
                  className="request-name"
                  onClick={() => handleNavigateToProfile(request.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {request.firstName && request.lastName
                    ? `${request.firstName} ${request.lastName}`
                    : request.username
                  }
                </h3>
                <p
                  className="request-username"
                  onClick={() => handleNavigateToProfile(request.id)}
                  style={{ cursor: 'pointer' }}
                >
                  @{request.username}
                </p>
                <p className="request-stats">
                  <span className="friends-count">{request.friendsCount || 0} friends</span>
                </p>
              </div>

              <div className="request-actions">
                <button
                  onClick={() => acceptFriendRequest(request.id)}
                  disabled={actionLoading[`accept_${request.id}`] || actionLoading[`reject_${request.id}`]}
                  className="accept-btn"
                >
                  {actionLoading[`accept_${request.id}`] ? (
                    <>
                      <div className="btn-spinner"></div>
                      Accepting...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">✓</span>
                      Accept
                    </>
                  )}
                </button>

                <button
                  onClick={() => rejectFriendRequest(request.id)}
                  disabled={actionLoading[`accept_${request.id}`] || actionLoading[`reject_${request.id}`]}
                  className="reject-btn"
                >
                  {actionLoading[`reject_${request.id}`] ? (
                    <>
                      <div className="btn-spinner"></div>
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">✕</span>
                      Reject
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FriendRequests