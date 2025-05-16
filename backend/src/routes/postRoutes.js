const express = require('express');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');
const postController  = require('../controllers/postController');

const router = express.Router();

// Routes
// http://localhost:5000/api/posts

// @route   POST api/posts/createPost
// @desc    Create a post
// @access  Private
router.post('/createPost', authenticateUser, postController.createPost);

// @route   GET /api/posts/me
// @desc    Get all posts by the logged-in user (latest at top)
// @access  Private
router.get('/me', authenticateUser, postController.getAllPostsByUserId);

// @route   GET api/posts/getAllPostsByUserId/:id
// @desc    Get all posts by user ID (latest at top)
// @access  Private
router.get('/getAllPostsByUserId/:id', authenticateUser, postController.getAllPostsByUserId);

// @route   GET /api/posts/feed
// @desc    Get posts for user's feed
// @access  Private
router.get('/feed', authenticateUser, postController.getAllPosts);

// @route   PATCH /api/posts/update/:id
// @desc    Update Post By Post Id
// @access  Private
router.patch("/update/:id", authenticateUser, postController.updatePostByPostId);


module.exports = router;