const UserService = require('../services/userService');
const notificationUtils = require('../utils/notificationUtils');


// @desc    Send a friend request to another user
// @route   POST /api/friends/friend-request/send/:id
const sendFriendRequest = async (req, res) => {
  try {
    const recipientId  = req.params.id;
    const senderId = req.user.id; // From auth middleware
    
    const result = await UserService.sendFriendRequest(senderId, recipientId);
    
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    // Send notification
    const sender = await UserService.findById(senderId);
    const senderName = sender.firstName + ' ' + sender.lastName;
    await notificationUtils.sendFriendRequestNotification(
        recipientId,
        senderId,
        senderName
    );
    
    res.status(200).json({ message: result.message });
  } catch (error) {
    console.error('Error in sendFriendRequest controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Accept a friend request
// @route   POST /api/friends/friend-request/accept/:id
const acceptFriendRequest = async (req, res) => {
  try {
    const requesterId = req.params.id;
    const userId = req.user.id; // From auth middleware
    
    const result = await UserService.acceptFriendRequest(userId, requesterId);
    
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    // Send notification to original sender
    const userData = await UserService.findById(userId);
    const username = await userData.firstName + ' ' + userData.lastName;
    await notificationUtils.sendAcceptRequestNotification(
        requesterId, // Get this from your friend request document
        userId,
        username
    );
    
    res.status(200).json({ message: result.message });
  } catch (error) {
    console.error('Error in acceptFriendRequest controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject a friend request
// @route   POST /api/friends/friend-request/reject/:id
const rejectFriendRequest = async (req, res) => {
  try {
    const requesterId = req.params.id;
    const userId = req.user.id; // From auth middleware
    
    const result = await UserService.rejectFriendRequest(userId, requesterId);
    
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    
    res.status(200).json({ message: result.message });
  } catch (error) {
    console.error('Error in rejectFriendRequest controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all pending friend requests
// @route   GET /api/friends/friend-requests/getAll
const getPendingFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    
    const result = await UserService.getPendingFriendRequests(userId);
    
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    
    res.status(200).json({ requests: result.requests });
  } catch (error) {
    console.error('Error in getPendingFriendRequests controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove a friend
// @route   DELETE /api/friends/removeFriend/:id
const removeFriend = async (req, res) => {
  try {
    const friendId = req.params.id;
    const userId = req.user.id; // From auth middleware
    
    const result = await UserService.removeFriend(userId, friendId);
    
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    
    res.status(200).json({ message: result.message });
  } catch (error) {
    console.error('Error in removeFriend controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all friends
// @route   GET /api/friends/allFriends
const getFriendsList = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    
    const result = await UserService.getFriendsList(userId);
    
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    
    res.status(200).json({ friends: result.friends });
  } catch (error) {
    console.error('Error in getFriendsList controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getPendingFriendRequests,
  removeFriend,
  getFriendsList
};