const express = require('express');
const { authenticateUser, checkAccountStatus } = require('../middleware/authMiddleware');
const friendController = require('../controllers/friendController');
const { logFriendRequest, logFriendAccept, logFriendDecline, logActivity } = require('../middleware/activityLogger'); // Import activity logging middleware

const router = express.Router();

// Routes
// http://localhost:5000/api/friends

// @desc    Send a friend request to another user
// @route   POST /api/friends/friend-request/send/:id
// @access  Private
router.post("/friend-request/send/:id", authenticateUser, checkAccountStatus, logFriendRequest, friendController.sendFriendRequest); // added activity logging

// @desc    Cancel a friend request sent to another user
// @route   POST /api/friends/friend-request/cancel/:id
// @access  Private
router.delete("/friend-request/cancel/:id", authenticateUser, checkAccountStatus, logFriendDecline, friendController.cancelFriendRequest); // added activity logging

// @desc    Accept a friend request
// @route   POST /api/friends/friend-request/accept/:id
// @access  Private
router.post("/friend-request/accept/:id", authenticateUser, checkAccountStatus, logFriendAccept, friendController.acceptFriendRequest); // added activity logging

// @desc    Reject a friend request
// @route   POST /api/friends/friend-request/reject/:id
// @access  Private
router.post("/friend-request/reject/:id", authenticateUser, checkAccountStatus, friendController.rejectFriendRequest);

// @desc    Get all pending friend requests
// @route   GET /api/friends/friend-requests/getAll
// @access  Private
router.get("/friend-requests/getAll", authenticateUser, friendController.getPendingFriendRequests);

// @desc    Get all friends
// @route   GET /api/friends/allFriends
// @access  Private
router.get('/allFriends', authenticateUser, friendController.getFriendsList);

// @desc    Get all suggest friends
// @route   GET /api/friends/allSuggestFriends
// @access  Private
router.get('/allSuggestFriends', authenticateUser, friendController.getAllSuggestFriends);

// @desc    Remove a friend
// @route   DELETE /api/friends/removeFriend/:id
// @access  Private
router.delete('/removeFriend/:id', authenticateUser, checkAccountStatus, logActivity('friend_remove', (req) => ({ targetUserId: req.params.id })), friendController.removeFriend); // added activity logging

// @desc    check friend status
// @route   GET /api/friends/friend-status/:id
// @access  Private
router.get('/friend-status/:id', authenticateUser, friendController.checkOtherUserFriendStatus);



module.exports = router;