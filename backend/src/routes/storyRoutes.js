const express = require('express');
const { authenticateUser } = require('../middleware/authMiddleware');
const { validateStory } = require("../middleware/validator");
const storyController  = require('../controllers/storyController');

const router = express.Router();

// Routes
// http://localhost:5000/api/stories

// @route   POST api/stories/createStory
// @desc    Create a story
// @access  Private
router.post('/createStory', validateStory, authenticateUser, storyController.createStory);

// // @route   GET /api/stories/me
// // @desc    Get all stories by the logged-in user (latest at top)
// // @access  Private
// router.get('/me', authenticateUser, storyController.getCurrentUserStories);

// @route   GET api/stories/feed
// @desc    Get stories for user's feed
// @access  Private(authenticateUser)
router.get('/feed', authenticateUser, storyController.getStoriesFeed);

// @route   GET /api/stories/:id
// @desc    Get a story by ID
// @access  Private
router.get('/:id', authenticateUser, storyController.getStoryById);

// @route   PUT /api/stories/:id/view
// @desc    Mark a story as viewed
// @access  Private
router.put('/:id/view', authenticateUser, storyController.viewStory);

// @route   PATCH /api/stories/update/:id
// @desc    Update Story By Story Id
// @access  Private
router.patch("/update/:id", validateStory, authenticateUser, storyController.updateStoryByStoryId);

// @route   DELETE /api/stories/delete/:id
// @desc    Delete Story By Story Id
// @access  Private
router.delete("/delete/:id", authenticateUser, storyController.deleteStoryByStoryId);

// // Make sure you have this at the end:
module.exports = router;
