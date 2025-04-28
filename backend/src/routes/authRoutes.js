const express = require('express');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');
const userController  = require('../controllers/userController');


const router = express.Router();

// http://localhost:5000/

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', userController.registerUser);

// @route   POST api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', userController.loginUser);

// @route   GET api/auth/getCurrentUser
// @desc    Get user data
// @access  Private
router.get('/getCurrentUser', authenticateUser, userController.getCurrentUser);


// @route   GET api/auth/getAllUsers
// @desc    Get user data
// @access  Private
router.get('/getAllUsers', authenticateUser, authorizeRoles("super_admin"), userController.getAllUsers);

module.exports = router;