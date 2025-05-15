const express = require('express');
const { authenticateUser } = require('../middleware/authMiddleware');
const friendController = require('../controllers/friendController');

const router = express.Router();

// Routes
// http://localhost:5000/api/friends

// @desc    Send a friend request to another user
// @route   POST /api/friends/friend-request/send/:username
// @access  Private
router.post("/friend-request/send/:username", authenticateUser, friendController.sendFriendRequest);

// @desc    Accept a friend request
// @route   POST /api/friends/friend-request/accept/:id
// @access  Private
router.post("/friend-request/accept/:id", authenticateUser, friendController.acceptFriendRequest);

// @desc    Reject a friend request
// @route   POST /api/friends/friend-request/reject/:id
// @access  Private
router.post("/friend-request/reject/:id", authenticateUser, friendController.rejectFriendRequest);

// @desc    Get all pending friend requests
// @route   GET /api/friends/friend-requests/getAll
// @access  Private
router.get("/friend-requests/getAll", authenticateUser, friendController.getPendingFriendRequests);

// @desc    Get all friends
// @route   GET /api/friends/allFriends
// @access  Private
router.get('/allFriends', authenticateUser, friendController.getFriendsList);

// @desc    Remove a friend
// @route   DELETE /api/friends/removeFriend/:id
// @access  Private
router.delete('/removeFriend/:id', authenticateUser, friendController.removeFriend);


module.exports = router;