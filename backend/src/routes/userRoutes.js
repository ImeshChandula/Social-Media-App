const express = require('express');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');


const router = express.Router();

// Routes
// http://localhost:5000/api/users

// @route   POST api/auth/register
// @desc    Register user
// @access  Public




module.exports = router;