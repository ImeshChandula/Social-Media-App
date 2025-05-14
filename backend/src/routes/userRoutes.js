const express = require('express');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');


const router = express.Router();

// Routes
// http://localhost:5000/api/users


// @route   GET api/auth/getAllUsers
// @desc    Get All user data
// @access  Private 
router.get('/getAllUsers', authenticateUser, authorizeRoles("super_admin"), userController.getAllUsers);

// @route   GET api/auth/deleteUser
// @desc    Delete user by ID
// @access  Private
router.delete('/deleteUser/:id', authenticateUser, authorizeRoles("super_admin"), userController.deleteUser)


// @route   PATCH api/users/updateProfile
// @desc    Update user profile
// @access  Private
router.patch('/updateProfile', authenticateUser, userController.updateUserProfile);



module.exports = router;