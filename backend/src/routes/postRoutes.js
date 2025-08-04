const express = require('express');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');
const { validatePost } = require("../middleware/validator");
const postController  = require('../controllers/postController');
const { logPostCreate, logPostUpdate, logPostDelete } = require('../middleware/activityLogger'); // Import activity logging middleware

const router = express.Router();

// Routes
// http://localhost:5000/api/posts

// @route   POST api/posts/createPost
// @desc    Create a post
// @access  Private
router.post('/createPost', validatePost, authenticateUser, logPostCreate, postController.createPost); // added activity logging 

// @route   GET /api/posts/getPostById/:id
// @desc    Get posts by post id
// @access  Private
router.get('/getPostById/:id', authenticateUser, postController.getPostByPostId); 

// @route   GET /api/posts/me
// @desc    Get all posts by the logged-in user (latest at top)
// @access  Private
router.get('/me', authenticateUser, postController.getAllPostsByUserId);

// @route   GET api/posts/getAllPostsByUserId/:id
// @desc    Get all posts by user ID (latest at top)
// @access  Private
router.get('/getAllPostsByUserId/:id', authenticateUser, postController.getAllPostsByUserId);

// @route   GET /api/posts/allPosts
// @desc    Get posts for admin dashboard
// @access  Private
router.get('/allPosts', authenticateUser, authorizeRoles("admin", "super_admin"), postController.getAllPosts);

// @route   GET /api/posts/feed/videos
// @desc    Get video posts for user's feed
// @access  Private
router.get('/feed/videos', authenticateUser, postController.getAllVideoPosts);

// @route   GET /api/posts/feed/photos
// @desc    Get video posts for user's feed
// @access  Private
router.get('/feed/photos', authenticateUser, postController.getAllPhotoPosts);

// @route   PATCH /api/posts/update/:id
// @desc    Update Post By Post Id
// @access  Private
router.patch("/update/:id", validatePost, logPostUpdate, authenticateUser, postController.updatePostByPostId); // added activity logging

// @route   DELETE /api/posts/delete/:id
// @desc    Delete Post By Post Id
// @access  Private
router.delete("/delete/:id", authenticateUser, logPostDelete, postController.deletePostByPostId); // added activity logging

// @route   POST /api/posts/favorites/add/:postId
// @desc    Add post to favorites
// @access  Private
router.post('/favorites/add/:postId', authenticateUser, postController.addToFavorites);

// @route   DELETE /api/posts/favorites/remove/:postId
// @desc    Remove post from favorites  
// @access  Private
router.delete('/favorites/remove/:postId', authenticateUser, postController.removeFromFavorites);

// @route   GET /api/posts/favorites
// @desc    Get favorite posts of the user  
// @access  Private
router.get('/favorites', authenticateUser, postController.getFavoritePosts);

// @route   GET /api/posts/video-categories
// @desc    Get valid video categories
// @access  Private
router.get('/video-categories', authenticateUser, postController.getVideoCategories);

module.exports = router;