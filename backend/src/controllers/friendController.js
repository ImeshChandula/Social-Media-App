const UserService = require('../services/userService');
const FriendService = require('../services/friendService');
const notificationUtils = require('../utils/notificationUtils');


// @desc    Send a friend request to another user
// @route   POST /api/friends/friend-request/send/:id
const sendFriendRequest = async (req, res) => {
  try {
    const recipientId  = req.params.id;
    const senderId = req.user.id; // From auth middleware

    const recipient = await UserService.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: "Recipient not found" });
    }
    
    const result = await FriendService.sendFriendRequest(senderId, recipient.id);
    
    if (!result) {
      return res.status(400).json({ success: false, message: result.message });
    }

    // Send notification
    const sender = await UserService.findById(senderId);
    const senderName = sender.firstName + ' ' + sender.lastName;
    await notificationUtils.sendFriendRequestNotification(
        recipientId,
        senderId,
        senderName
    );
    
    res.status(200).json({ success: true, message: "Friend request sent successfully" });
  } catch (error) {
    console.error('Error in sendFriendRequest controller:', error);
    res.status(500).json({ error: error.message, message: "Server error" });
  }
};

// @desc    Accept a friend request
// @route   POST /api/friends/friend-request/accept/:id
const acceptFriendRequest = async (req, res) => {
  try {
    const requesterId = req.params.id;
    const userId = req.user.id; 
    
    const result = await FriendService.acceptFriendRequest(userId, requesterId);
    
    if (!result) {
      return res.status(400).json({ success: false, message: result.message });
    }

    // Send notification to original sender
    const userData = await UserService.findById(userId);
    const username = userData.firstName + ' ' + userData.lastName;
    await notificationUtils.sendAcceptRequestNotification(
        requesterId, // Get this from your friend request document
        userId,
        username
    );
    
    res.status(200).json({ success: true, message: "Accept Friend request successfully" });
  } catch (error) {
    console.error('Error in acceptFriendRequest controller:', error);
    res.status(500).json({ error: error.message, message: 'Server error' });
  }
};

// @desc    Reject a friend request
// @route   POST /api/friends/friend-request/reject/:id
const rejectFriendRequest = async (req, res) => {
  try {
    const requesterId = req.params.id;
    const userId = req.user.id; // From auth middleware
    
    const result = await FriendService.rejectFriendRequest(userId, requesterId);
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }
    
    res.status(200).json({ success: true, message: result.message });
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
    
    const result = await FriendService.getPendingFriendRequests(userId);
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }
    
    res.status(200).json({ success: true, data: result.requests });
  } catch (error) {
    console.error('Error in getPendingFriendRequests controller:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Remove a friend
// @route   DELETE /api/friends/removeFriend/:id
const removeFriend = async (req, res) => {
  try {
    const friendId = req.params.id;
    const userId = req.user.id; 
    
    const result = await FriendService.removeFriend(userId, friendId);
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }
    
    res.status(200).json({ success: true, message: result.message });
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
    
    const result = await FriendService.getFriendsList(userId);
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }
    
    res.status(200).json({ success: true, data: result.friends });
  } catch (error) {
    console.error('Error in getFriendsList controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Get all suggest friends
// @route   GET /api/friends/allSuggestFriends
const getAllSuggestFriends = async (req, res) => {
  try {
        const currentUserId = req.user.id;
        
        const result = await FriendService.getSuggestedFriends(currentUserId);
    
        if (!result.success) {
          return res.status(400).json({ success: false, message: result.message });
        }

        return res.status(200).json({
            success: true,
            message: 'Suggested friends retrieved successfully',
            data: {
                suggestedFriends: result.suggestedFriends,
                count: result.suggestedFriends.length
            }
        });

    } catch (error) {
        console.error('Error getting suggested friends:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


// @desc    Cancel a friend request
// @route   DELETE /api/friends/friend-request/cancel/:id
const cancelFriendRequest = async (req, res) => {
  try {
    const recipientId = req.params.id;
    const senderId = req.user.id; // From auth middleware
    
    const result = await FriendService.cancelFriendRequest(senderId, recipientId);
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }
    
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error('Error in cancelFriendRequest controller:', error);
    res.status(500).json({ error: error.message, message: "Server error" });
  }
};


// @desc    check friend status
const checkOtherUserFriendStatus = async (req, res) => {
	try {
    const otherUserId = req.params.id;

    if (otherUserId === req.user.id) {
      return res.status(400).json({ success: false, message: "Other user ID Invalid"});
    }

    const otherUser = await UserService.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ success: false, message: "User not found"});
    }

    const result = await FriendService.getOtherUserFriendStatus(otherUser.id, req.user.id);
    if (!result) {
      return res.status(400).json({ success: false, message: "Error getting other users friend status"});
    }

    const resultData = { 
      otherUserId: otherUser.id,
      otherUserName: `${otherUser.firstName} ${otherUser.lastName}`,
      friendStatus: result 
    };

    return res.status(200).json({ 
      success: true, 
      message: "getting other users friend status successful", 
      data: resultData
    });
  } catch (error) {
    console.log("Error: " + error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};



module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getPendingFriendRequests,
  removeFriend,
  getFriendsList,
  getAllSuggestFriends,
  cancelFriendRequest,
  checkOtherUserFriendStatus
};