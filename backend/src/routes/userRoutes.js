const express = require('express');
const { authenticateUser } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');


const router = express.Router();

// Routes
// http://localhost:5000/api/users


// @route   GET api/users/me
// @desc    Get user data
// @access  Private
router.get('/me', authenticateUser, userController.getCurrentUser);

// @route   PATCH api/users/updateProfile
// @desc    Update user profile
// @access  Private
router.patch('/updateProfile', authenticateUser, userController.updateUserProfile);



module.exports = router;