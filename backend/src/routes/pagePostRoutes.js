const express = require('express');
const router = express.Router();
const pagePostController = require('../controllers/pagePostController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { validatePost } = require('../middleware/validator');

// Page post routes

// @route  POST /api/pages/:pageId/posts
// @desc   Create a post on a page
// @access Private (only authenticated users can post on pages they own)
router.post('/:pageId/posts', authenticateUser, validatePost, pagePostController.createPagePost);

// @route  GET /api/pages/:pageId/posts
// @desc   Get all posts for a specific page
// @access Public (anyone can view posts on a page)
router.get('/:pageId/posts', pagePostController.getPagePosts);

module.exports = router;