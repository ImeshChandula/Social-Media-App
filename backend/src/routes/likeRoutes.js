const express = require('express');
const { authenticateUser } = require('../middleware/authMiddleware');
const likeController  = require('../controllers/likeController');

const router = express.Router();

// http://localhost:5000/api/likes

//@path     POST    /api/likes/toPost/:id
//@desc     like post (like/unlike)
router.post('/toPost/:id', authenticateUser, likeController.likeToAPostByPostId);

//@path     POST    /api/likes/toComment/:id
//@desc     like comment (like/unlike)
router.post('/toComment/:id', authenticateUser, likeController.likeToACommentByCommentId);

//@path     GET    /api/likes/getAllLikedUsers/post/:id
//@desc     Get all users who liked a post by post id
router.get('/getAllLikedUsers/post/:id', authenticateUser, likeController.getAllLikedUsersInPost);

//@path     GET    /api/likes/getAllLikedUsers/comment/:id
//@desc     Get all users who liked a comment by comment id
router.get('/getAllLikedUsers/comment/:id', authenticateUser, likeController.getAllLikedUsersInComment);


module.exports = router;