import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';

function NotificationForMobile() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchNotifications = async (reset = false) => {
    try {
      setLoading(true);
      const currentOffset = reset ? 0 : offset;
      const response = await axiosInstance.get('/notifications/me', {
        params: { limit: 10, offset: currentOffset }
      });

      if (response.data.success) {
        if (reset) {
          setNotifications(response.data.data);
          setOffset(10);
        } else {
          setNotifications(prev => [...prev, ...response.data.data]);
          setOffset(prev => prev + 10);
        }
        setHasMore(response.data.data.length === 10);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const response = await axiosInstance.get('/notifications/count');
      if (response.data.success) {
        if (response.data.data.count > notificationCount) {
          toast.success("You have new Notifications");
        }
        setNotificationCount(response.data.data.count);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await axiosInstance.put(`/notifications/read/${notificationId}`);
      if (response.data.success) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        setNotificationCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await axiosInstance.put('/notifications/read-all');
      if (response.data.success) {
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
        setNotificationCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications(true);
    fetchNotificationCount();
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    let notifTime;
    if (timestamp?._seconds) {
      notifTime = new Date(timestamp._seconds * 1000);
    } else if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
      notifTime = timestamp.toDate();
    } else {
      notifTime = new Date(timestamp);
    }

    if (isNaN(notifTime.getTime())) return 'Unknown time';

    const now = new Date();
    const diffMs = now - notifTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifTime.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like_post':
      case 'like_reply': return '❤️';
      case 'comment':
      case 'reply': return '💬';
      case 'friend_request': return '👤';
      case 'accept_request': return '✅';
      case 'post': return '📝';
      case 'story': return '📷';
      default: return '🔔';
    }
  };

  return (
    <div className="container-fluid mobile-notifications-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Notifications</h5>
        {notificationCount > 0 && (
          <button className="btn btn-sm btn-outline-primary" onClick={markAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="notifications-scroll-area">
        {loading && notifications.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3"></div>
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <div style={{ fontSize: '2rem' }}>🔔</div>
            <p>No notifications yet</p>
            <small>When you get notifications, they’ll show up here.</small>
          </div>
        ) : (
          <>
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`card mb-2 notification-card ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
              >
                <div className="card-body d-flex align-items-center">
                  <div className="position-relative me-3">
                    {notification.senderProfilePicture ? (
                      <img
                        src={notification.senderProfilePicture}
                        alt=""
                        className="rounded-circle"
                        width="40"
                        height="40"
                      />
                    ) : (
                      <div className="avatar-fallback rounded-circle d-flex align-items-center justify-content-center bg-secondary text-white" style={{ width: 40, height: 40 }}>
                        {notification.message?.split(' ')[0]?.charAt(0) || '?'}
                      </div>
                    )}
                    <span className="notif-icon">{getNotificationIcon(notification.type)}</span>
                  </div>

                  <div className="flex-grow-1">
                    <div className="fw-medium">{notification.message}</div>
                    <small className="text-muted">{formatTime(notification.timestamp)}</small>
                  </div>

                  {!notification.isRead && <span className="unread-indicator ms-2"></span>}
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="text-center mt-3">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default NotificationForMobile;
