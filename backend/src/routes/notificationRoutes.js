const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticateUser, checkAccountStatus } = require('../middleware/authMiddleware');

const router = express.Router();
// http://localhost:5000/api/notifications

// Get notifications for the authenticated user
router.get('/me', authenticateUser, notificationController.getNotifications);

// Mark a notification as read (notification id)
router.put('/read/:id', authenticateUser, checkAccountStatus, notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', authenticateUser, checkAccountStatus, notificationController.markAllAsRead);

// Register device for push notifications
router.post('/register-device', authenticateUser, checkAccountStatus, notificationController.registerDevice);

// Get notification count
router.get('/count', authenticateUser, notificationController.getNotificationCount);

module.exports = router;