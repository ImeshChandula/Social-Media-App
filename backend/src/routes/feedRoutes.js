const express = require('express');
const feedController = require('../controllers/feedController');
const { authenticateUser } = require('../middleware/authMiddleware');


const router = express.Router();
// http://localhost:5000/api/feed


router.get('/', authenticateUser, feedController.getAllPostsInFeed);
router.get('/trending', authenticateUser, feedController.getTrendingPosts);
router.post('/refresh', authenticateUser, feedController.refreshFeed);

module.exports = router;