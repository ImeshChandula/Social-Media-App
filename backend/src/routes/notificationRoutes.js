const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();

// Get notifications for the authenticated user
router.get('/', authenticateUser, notificationController.getNotifications);

// Mark a notification as read (notification id)
router.put('/read/:id', authenticateUser, notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', authenticateUser, notificationController.markAllAsRead);

// Register device for push notifications
router.post('/register-device', notificationController.registerDevice);


module.exports = router;