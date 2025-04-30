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

// @route   POST api/posts/getAllPostsByUser
// @desc    Get all posts by logged user (latest at top)
// @access  Private
router.get('/getAllPostsByUser', authenticateUser, postController.getAllPostsByUser);



module.exports = router;