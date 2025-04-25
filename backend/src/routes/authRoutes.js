const express = require('express');
const { authenticateUser } = require('../middleware/authMiddleware');
const userController  = require('../controllers/userController');


const router = express.Router();


// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', userController.registerUser);

module.exports = router;