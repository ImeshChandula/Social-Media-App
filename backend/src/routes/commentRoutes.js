const express = require('express');
const { authenticateUser } = require('../middleware/authMiddleware');
const { validateComment } = require("../middleware/validator");
const commentController = require('../controllers/commentController');


const router = express.Router();

// @route   POST api/comments/addComment
// @desc    Comment on a post: media(if have)
//          { postId, text, media } = req.body;
// @access  Private
router.post('/addComment', validateComment, authenticateUser, commentController.addComment);

// @route   POST api/comments/reply
// @desc    Reply to a comment: 
//          { commentId, text } = req.body;
// @access  Private
router.post('/reply', authenticateUser, commentController.addReply);

// @route   GET api/comments/getComments/:postId
// @desc    Get all comments for a specific post
// @access  Private
router.get('/getComments/:postId', authenticateUser, commentController.getCommentsByPostId);

// @route   PATCH api/comments/update/:commentId
// @desc    Update a comment
// @access  Private
router.patch('/update/:commentId', validateComment, authenticateUser, commentController.updateComment);

// @route   DELETE api/comments/delete/:commentId
// @desc    Delete a comment
// @access  Private
router.delete('/delete/:commentId', authenticateUser, commentController.deleteComment);


module.exports=router;