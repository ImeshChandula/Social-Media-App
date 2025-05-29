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

//@route   GET api/users/getUserById/:id
//@desc    Get user by id
//@access  Private 
router.get('/getUserById/:id', authenticateUser, userController.getUserById);

//@route   GET /api/users/search?q=john&limit=10
//@desc    Search user by username
//@access  Private 
router.get("/search", authenticateUser, userController.searchUsersByUsername);

//@route   PATCH api/users/updateProfile
//@desc    Update user profile data
//@access  Private
router.patch('/updateProfile/:id', validateUserData, authenticateUser, userController.updateUserProfile);

//@route   PATCH api/users/updateProfilePic
//@desc    Update user profile Image
//@access  Private
router.patch("/updateProfilePic/:id", validateUserData, authenticateUser, userController.updateUserProfileImage);

//@route   PATCH api/users/updateCoverPic
//@desc    Update user profile Cover Photo
//@access  Private
router.patch("/updateCoverPic/:id", validateUserData, authenticateUser, userController.updateUserProfileCoverPhoto);

//@route   GET api/users/getAllUsers
//@desc    Get All user data
//@access  Private 
router.get('/getAllUsers', authenticateUser, authorizeRoles("super_admin"), userController.getAllUsers);

//@route   GET api/users/deleteUser/:id
//@desc    Delete user by ID
//@access  Private
router.delete('/deleteUser/:id', authenticateUser, authorizeRoles("super_admin"), userController.deleteUser)






module.exports = router;