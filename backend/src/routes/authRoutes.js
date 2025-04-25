const express = require('express');
const { authenticateUser } = require('../middleware/authMiddleware');
const userController  = require('../controllers/userController');


const router = express.Router();


// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', userController.registerUser);

// @route   POST api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', userController.loginUser);

// @route   GET api/auth
// @desc    Get user data
// @access  Private
router.get('/getCurrentUser', authenticateUser, userController.getCurrentUser);


module.exports = router;