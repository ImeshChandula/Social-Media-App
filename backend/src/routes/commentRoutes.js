const express = require('express');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');
const commentController = require('../controllers/commentController');


const router = express.Router();

// @route   POST api/comments/addComment/:postId
// @desc    Comment on a post
// @access  Private
router.post('/addComment/:postId', authenticateUser, commentController.addComment);

// @route   GET api/comments/:postId
// @desc    Get comments for a post
// @access  Private
router.get('/getComments/:postId', authenticateUser, commentController.getComments);

// @route   PUT api/comments/:id
// @desc    Update a comment
// @access  Private
router.patch('/:id', authenticateUser, commentController.updateComment);

// @route   DELETE api/comments/:id
// @desc    Delete a comment
// @access  Private (user or admin/moderator)
router.delete('/:id', authenticateUser, commentController.deleteComment);

// @route   POST api/comments/reply/:commentId
// @desc    Reply to a comment
// @access  Private
router.post('/reply/:commentId', authenticateUser, commentController.addReply);

module.exports=router;