const express = require('express');
const { authenticateUser } = require('../middleware/authMiddleware');
const { validateUser } = require("../middleware/validator");
const authController  = require('../controllers/authController');
const passwordController  = require('../controllers/passwordController');


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
//@desc    Get current user (checkAuth)
//@access  Private
router.get("/checkCurrent", authenticateUser,  authController.checkCurrent);

//@route   POST api/auth/sendResetOtp
//@desc    Get otp to reset password
//         pass {email} = req.body
//@access  Public
router.post("/sendResetOtp", passwordController.requestOtp);

//@route   POST api/auth/resetPassword
//@desc    Reset password
//         pass {email, otp, newPassword} = req.body
//@access  Public
router.post("/resetPassword", passwordController.resetPassword);



module.exports = router;