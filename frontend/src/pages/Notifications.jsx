import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios'; 
import '../styles/Notifications.css';

function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const socketRef = useRef(null);
  const dropdownRef = useRef(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    // For Socket.IO, you might still need the token from cookie
    // If your backend socket middleware reads from cookies, you can remove the auth object
    socketRef.current = io(import.meta.env.VITE_APP_BACKEND_URL, {
      withCredentials: true // This will send cookies
    });

    // Listen for new notifications
    socketRef.current.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setNotificationCount(prev => prev + 1);
    });

    // Listen for notification count updates
    socketRef.current.on('notification_count_update', (data) => {
      if (data.increment) {
        setNotificationCount(prev => prev + data.increment);
      } else if (data.newCount !== undefined) {
        setNotificationCount(data.newCount);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []); 

  // Fetch notification count on component mount
  useEffect(() => {
    fetchNotificationCount();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch notifications
  const fetchNotifications = async (reset = false) => {
    try {
      setLoading(true);
      const currentOffset = reset ? 0 : offset;
      
      const response = await axiosInstance.get('/notifications/me', {
        params: {
          limit: 10,
          offset: currentOffset
        }
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

  // Fetch notification count
  const fetchNotificationCount = async () => {
    try {
      const response = await axiosInstance.get('/notifications/count');
      
      if (response.data.success) {
        if (response.data.data.count > notificationCount) {
          toast.success("You have new Notifications")
        }
        setNotificationCount(response.data.data.count);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  // Mark notification as read
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

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await axiosInstance.put('/notifications/read-all');

      if (response.data.success) {
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
        setNotificationCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Handle dropdown toggle
  const toggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications(true);
      // Remove fetchNotificationCount() from here since it's now called on mount
    }
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format notification time
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    let notifTime;
    
    // Handle Firestore timestamp
    if (timestamp?._seconds) {
      notifTime = new Date(timestamp._seconds * 1000);
    } 
    // Handle Firestore timestamp with toDate method
    else if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
      notifTime = timestamp.toDate();
    }
    // Handle regular timestamp string/number
    else {
      notifTime = new Date(timestamp);
    }
    
    // Check if date is valid
    if (isNaN(notifTime.getTime())) {
      return 'Unknown time';
    }
    
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

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like_post':
      case 'like_reply': 
        return '❤️';
      case 'comment':
      case 'reply': 
        return '💬';
      case 'friend_request': 
        return '👤';
      case 'accept_request': 
        return '✅';
      case 'post': 
        return '📝';
      case 'story': 
        return '📷';
      default: 
        return '🔔';
    }
  };

  // Load more notifications
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(false);
    }
  };

  return (
    <div className="notifications-container" ref={dropdownRef}>
      <button className="notifications-bell" onClick={toggleDropdown}>
        <svg className="bell-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 19V20H3V19L5 17V11C5 7.9 7 5.2 9.9 4.4C10.1 4.2 10 4 10 4C10 2.9 10.9 2 12 2S14 2.9 14 4C14 4 13.9 4.2 14.1 4.4C17 5.2 19 7.9 19 11V17L21 19ZM7 19H17V18L15 16V11C15 8.2 13.4 6 12 6S9 8.2 9 11V16L7 18V19Z"/>
        </svg>
        {notificationCount > 0 && (
          <span className="notification-badge">{notificationCount > 99 ? '99+' : notificationCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            {notificationCount > 0 && (
              <button className="mark-all-read" onClick={markAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>

          <div className="notifications-list">
            {loading && notifications.length === 0 ? (
              <div className="notifications-loading">
                <div className="notification-loading-spinner"></div>
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">
                <div className="no-notifications-icon">🔔</div>
                <p>No notifications yet</p>
                <span>When you get notifications, they'll show up here</span>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`mt-2 notification-item ${!notification.isRead ? 'unread' : ''}`}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                  >
                    <div className="notification-avatar">
                      {notification.senderProfilePicture ? (
                        <img src={notification.senderProfilePicture} alt="" />
                      ) : (
                        <div className="avatar-placeholder">
                          {/* Get first letter from sender's name from the message */}
                          {notification.message?.split(' ')[0]?.charAt(0) || '?'}
                        </div>
                      )}
                      <span className="notification-type-icon">
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>
                    
                    <div className="notification-content">
                      <div className="notification-text">
                        {/* Display the full message without adding "Someone" */}
                        <span>{notification.message}</span>
                      </div>
                      <div className="notification-time">
                        {formatTime(notification.timestamp)}
                      </div>
                    </div>
                    
                    {!notification.isRead && <div className="unread-dot"></div>}
                  </div>
                ))}
                
                {hasMore && (
                  <button 
                    className="load-more-btn" 
                    onClick={loadMore}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Load more'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationPage;