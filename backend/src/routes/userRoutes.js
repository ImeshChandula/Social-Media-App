const express = require('express');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const { validateUser } = require("../middleware/validator");
const { validateUserData } = require("../middleware/validateData");

const router = express.Router();

// Routes
// http://localhost:5000/api/users

//@route   GET api/users/myProfile
//@desc    Get current user profile
//@access  Private 
router.get("/myProfile", authenticateUser, userController.getCurrentUser);

//@route   GET api/users/getUserByUsername/:username
//@desc    Get user by username
//@access  Private 
router.get("/getUserByUsername/:username", authenticateUser, userController.getUserByUsername);

//@route   PATCH api/users/updateProfile
//@desc    Update user profile data
//@access  Private
router.patch('/updateProfile/:id', validateUserData, authenticateUser, userController.updateUserProfile);

//@route   PATCH api/users/updateProfilePic
//@desc    Update user profile Image
//@access  Private
router.patch("/updateProfilePic/:id", validateUser, authenticateUser, userController.updateUserProfileImage);

//@route   PATCH api/users/updateCoverPic
//@desc    Update user profile Cover Photo
//@access  Private
router.patch("/updateCoverPic/:id", validateUser, authenticateUser, userController.updateUserProfileCoverPhoto);

//@route   GET api/users/getAllUsers
//@desc    Get All user data
//@access  Private 
router.get('/getAllUsers', authenticateUser, authorizeRoles("super_admin"), userController.getAllUsers);

//@route   GET api/users/deleteUser/:id
//@desc    Delete user by ID
//@access  Private
router.delete('/deleteUser/:id', authenticateUser, authorizeRoles("super_admin"), userController.deleteUser)






module.exports = router;