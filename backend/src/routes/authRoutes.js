const express = require('express');
const { authenticateUser } = require('../middleware/authMiddleware');
const { validateUser } = require("../middleware/validator");
const authController  = require('../controllers/authController');


const router = express.Router();

// Routes
// http://localhost:5000/api/auth

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post("/register", validateUser, authController.registerUser);

// @route   POST api/auth/login
// @desc    Login user 
// @access  Public
router.post('/login', authController.loginUser);

//@route   POST api/auth/logout
//@desc    Logout user
//@access  Private
router.post("/logout", authenticateUser, authController.logout);

//@route   POST api/auth/checkCurrent
//@desc    Get current user profile(by token)
//@access  Private
router.get("/checkCurrent", authenticateUser,  authController.checkCurrent);





module.exports = router;