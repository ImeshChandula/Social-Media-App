const express = require('express');
const feedController = require('../controllers/feedController');
const { authenticateUser, checkAccountStatus } = require('../middleware/authMiddleware');


const router = express.Router();
// http://localhost:5000/api/feed


router.get('/', authenticateUser, feedController.getAllPostsInFeed);
router.get('/trending', authenticateUser, feedController.getTrendingPosts);
router.post('/refresh', authenticateUser, feedController.refreshFeed);

// @route   GET /api/feed/stories
// @desc    Get stories feed including both user and page stories
// @access  Private
router.get('/stories', authenticateUser, checkAccountStatus, feedController.getStoriesFeedWithPages);

module.exports = router;