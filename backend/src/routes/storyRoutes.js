const express = require('express');
const { authenticateUser, checkAccountStatus } = require('../middleware/authMiddleware');
const { validateStory } = require("../middleware/validator");
const storyController = require('../controllers/storyController');

const router = express.Router();

// Routes
// http://localhost:5000/api/stories

// @route   POST api/stories/createStory
// @desc    Create a story
// @access  Private
router.post('/createStory', validateStory, authenticateUser, checkAccountStatus, storyController.createStory);

// // @route   GET /api/stories/me
// // @desc    Get all stories by the logged-in user (latest at top)
// // @access  Private
//router.get('/me', authenticateUser, checkAccountStatus, storyController.getCurrentUserStories);

// @route   GET api/stories/feed
// @desc    Get stories for user's feed
// @access  Private(authenticateUser)
router.get('/feed', authenticateUser, checkAccountStatus, storyController.getStoriesFeed);

// @route   GET /api/stories/:id
// @desc    Get a story by ID
// @access  Private
router.get('/:id', authenticateUser, checkAccountStatus, storyController.getStoryById);

// @route   PUT /api/stories/:id/view
// @desc    Mark a story as viewed
// @access  Private
router.put('/:id/view', authenticateUser, checkAccountStatus, storyController.viewStory);

// @route   PATCH /api/stories/update/:id
// @desc    Update Story By Story Id
// @access  Private
router.patch("/update/:id", validateStory, authenticateUser, checkAccountStatus, storyController.updateStoryByStoryId);

// @route   DELETE /api/stories/delete/:id
// @desc    Delete Story By Story Id
// @access  Private
router.delete("/delete/:id", authenticateUser, checkAccountStatus, storyController.deleteStoryByStoryId);

// // Make sure you have this at the end:
module.exports = router;