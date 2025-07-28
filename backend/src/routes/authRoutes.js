const express = require('express');
const { authenticateUser } = require('../middleware/authMiddleware');
const { validateUser } = require("../middleware/validator");
const authController  = require('../controllers/authController');
const passwordController  = require('../controllers/passwordController');
const { logLogin, logLogout, logPasswordChange } = require('../middleware/activityLogger'); // Import activity logging middleware

const router = express.Router();

// Routes
// http://localhost:5000/api/auth


router.post("/register", validateUser, authController.registerUser);
router.post('/login', logLogin, authController.loginUser); // updated with activity logging
router.post("/logout", authenticateUser, logLogout, authController.logout); // updated with activity logging


//@desc    Get current user (checkAuth)
router.get("/checkCurrent", authenticateUser,  authController.checkCurrent);

//@desc    Get otp to reset password
router.post("/sendResetOtp", passwordController.requestOtp);

//@desc    Reset password
router.post("/resetPassword", logPasswordChange, passwordController.resetPassword); // updated with activity logging



module.exports = router;