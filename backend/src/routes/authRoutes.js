const express = require('express');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');
const userController  = require('../controllers/userController');


const router = express.Router();

// Routes
// http://localhost:5000/api/auth

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', userController.registerUser);

// @route   POST api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', userController.loginUser);

// @route   GET api/auth/me
// @desc    Get user data
// @access  Private
router.get('/me', authenticateUser, userController.getCurrentUser);

// @route   GET api/auth/getAllUsers
// @desc    Get All user data
// @access  Private 
router.get('/getAllUsers', authenticateUser, authorizeRoles("super_admin"), userController.getAllUsers);

// @route   GET api/auth/deleteUser
// @desc    Delete user by ID
// @access  Private
router.delete('/deleteUser/:id', authenticateUser, authorizeRoles("super_admin"), userController.deleteUser)





module.exports = router;