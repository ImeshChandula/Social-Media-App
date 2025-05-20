const express = require('express');
const { authenticateUser } = require('../middleware/authMiddleware');
const likeController  = require('../controllers/likeController');

const router = express.Router();

// http://localhost:5000/api/likes

//@path     POST    /api/likes/toPost/:id
//@desc     like post (like/unlike)
router.post('/toPost/:id', authenticateUser, likeController.likeToAPostByPostId);

//@path     GET    /api/likes/getAllLikedUsers/:id
//@desc     Get all users who liked a post by post id
router.get('/getAllLikedUsers/:id', authenticateUser, likeController.getAllLikedUsers);


module.exports = router;