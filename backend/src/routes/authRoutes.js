const express = require('express');
const { authenticateUser } = require('../middleware/authMiddleware');
const { validateUser } = require("../middleware/validator");
const authController  = require('../controllers/authController');
const passwordController  = require('../controllers/passwordController');


const router = express.Router();

// Routes
// http://localhost:5000/api/auth


router.post("/register", validateUser, authController.registerUser);
router.post('/login', authController.loginUser);
router.post("/logout", authenticateUser, authController.logout);


//@desc    Get current user (checkAuth)
router.get("/checkCurrent", authenticateUser,  authController.checkCurrent);

//@desc    Get otp to reset password
router.post("/sendResetOtp", passwordController.requestOtp);

//@desc    Reset password
router.post("/resetPassword", passwordController.resetPassword);



module.exports = router;