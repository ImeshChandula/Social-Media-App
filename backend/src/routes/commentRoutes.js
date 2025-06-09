const express = require('express');
const { authenticateUser, checkAccountStatus } = require('../middleware/authMiddleware');
const { validateComment } = require("../middleware/validator");
const commentController = require('../controllers/commentController');


const router = express.Router();

// http://localhost:5000/api/comments

// @route   POST api/comments/addComment/:id
// @desc    Comment on a post by post id
// @desc    Either text or media as req.body;
// @access  Private
router.post('/addComment/:id', validateComment, authenticateUser, checkAccountStatus, commentController.addComment);

// @route   POST api/comments/reply/:id
// @desc    Reply to a comment by comment id
// @access  Private
router.post('/reply/:id', validateComment, authenticateUser, checkAccountStatus, commentController.addReply);

// @route   GET api/comments/getComments/:id
// @desc    Get all comments for a specific post by post id
// @access  Private
router.get('/getComments/:id', authenticateUser, checkAccountStatus, commentController.getCommentsByPostId);

// @route   PATCH api/comments/update/:id
// @desc    Update a comment by comment id
// @access  Private
router.patch('/update/:id', validateComment, authenticateUser, checkAccountStatus, commentController.updateComment);

// @route   DELETE api/comments/delete/:id
// @desc    Delete a comment by comment id
// @access  Private
router.delete('/delete/:id', authenticateUser, checkAccountStatus, commentController.deleteComment);


module.exports=router;