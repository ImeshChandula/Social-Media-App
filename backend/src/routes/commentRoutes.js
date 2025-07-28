const express = require('express');
const { authenticateUser } = require('../middleware/authMiddleware');
const { validateComment } = require("../middleware/validator");
const commentController = require('../controllers/commentController');
const { logCommentCreate, logActivity } = require('../middleware/activityLogger'); // Import activity logging middleware

const router = express.Router();

// http://localhost:5000/api/comments

// @route   POST api/comments/addComment/:id
// @desc    Comment on a post by post id
// @desc    Either text or media as req.body;
// @access  Private
router.post('/addComment/:id', validateComment, authenticateUser, logCommentCreate, commentController.addComment); // added activity logging

// @route   POST api/comments/reply/:id
// @desc    Reply to a comment by comment id
// @access  Private
router.post('/reply/:id', validateComment, authenticateUser, commentController.addReply);

// @route   GET api/comments/getComments/:id
// @desc    Get all comments for a specific post by post id
// @access  Private
router.get('/getComments/:id', authenticateUser, commentController.getCommentsByPostId);

// @route   PATCH api/comments/update/:id
// @desc    Update a comment by comment id
// @access  Private
router.patch('/update/:id', validateComment, authenticateUser, logActivity('comment_update', (req) => ({ commentId: req.params.id, postId: req.body.postId }) ), commentController.updateComment); // added activity logging

// @route   DELETE api/comments/delete/:id
// @desc    Delete a comment by comment id
// @access  Private
router.delete('/delete/:id', authenticateUser, logActivity('comment_delete', (req) => ({ commentId: req.params.id })), commentController.deleteComment); // added activity logging


module.exports=router;