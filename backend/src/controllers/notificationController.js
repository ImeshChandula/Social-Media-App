const notificationService = require('../services/notificationService');

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { limit = 20, offset = 0 } = req.query;
    
    const notifications = await notificationService.getNotificationsForUser(
      userId, 
      parseInt(limit), 
      parseInt(offset)
    );
    
    res.status(200).json({success: true, data: notifications});
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params.id;
    const userId = req.user.id;
    
    // Verify the notification belongs to the user
    const notificationRef = await db.collection('notifications').doc(notificationId).get();
    
    if (!notificationRef.exists) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    const notification = notificationRef.data();
    
    if (notification.recipientId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to mark this notification as read'
      });
    }
    
    await notificationService.markAsRead(notificationId);
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await notificationService.markAllAsRead(userId);
    
    res.status(200).json({
      success: true,
      message: `Marked ${result.count} notifications as read`
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

const registerDevice = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Device token is required'
      });
    }
    
    await db.collection('devices').doc(token).set({
      userId,
      token,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(201).json({
      success: true,
      message: 'Device registered successfully'
    });
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register device',
      error: error.message
    });
  }
};

module.exports = {getNotifications, markAsRead, markAllAsRead, registerDevice}