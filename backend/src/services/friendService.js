const { connectFirebase } = require('../config/firebase');
const User = require('../models/User');

const {db} = connectFirebase();
const userCollection = db.collection('users');


const FriendService = {
    // Send a Friend Request
    async sendFriendRequest(senderId, recipientId) {
        try {
            // Get both users
            const senderDoc = await userCollection.doc(senderId).get();
            const recipientDoc = await userCollection.doc(recipientId).get();
            
            if (!senderDoc.exists || !recipientDoc.exists) {
                return { success: false, message: 'User not found' };
            }
            
            const sender = senderDoc.data();
            const recipient = recipientDoc.data();
            
            // Check if this is a request to self
            if (senderId === recipientId) {
                return { success: false, message: 'You cannot send a friend request to yourself' };
            }
            
            // Check if users are already friends
            if (recipient.friends && recipient.friends.includes(senderId)) {
                return { success: false, message: 'You are already friends with this user' };
            }
            
            // Check if request already sent
            if (recipient.friendRequests && recipient.friendRequests.includes(senderId)) {
                return { success: false, message: 'Friend request already sent' };
            }
            
            // Add sender to recipient's friendRequests array
            const updatedFriendRequests = [...(recipient.friendRequests || []), senderId];
            
            await userCollection.doc(recipientId).update({
                friendRequests: updatedFriendRequests,
                updatedAt: new Date().toISOString()
            });
            
            return { 
                success: true, 
                message: `Friend request sent to ${recipient.username}` 
            };
        } catch (error) {
            console.error('Error sending friend request:', error);
            throw error;
        }
    },


    // Accept a Friend Request
    async acceptFriendRequest(userId, requesterId) {
        try {
            // Get both users
            const userDoc = await userCollection.doc(userId).get();
            const requesterDoc = await userCollection.doc(requesterId).get();
            
            if (!userDoc.exists || !requesterDoc.exists) {
                return { success: false, message: 'User not found' };
            }
            
            const userData = userDoc.data();
            const requesterData = requesterDoc.data();
            
            // Check if request exists
            if (!userData.friendRequests || !userData.friendRequests.includes(requesterId)) {
                return { success: false, message: 'No friend request from this user' };
            }
            
            // Update both users' friends lists and remove the request
            const batch = db.batch();
            
            // Update user's data (accepting user)
            const updatedUserFriendRequests = userData.friendRequests.filter(id => id !== requesterId);
            const updatedUserFriends = [...(userData.friends || []), requesterId];
            
            batch.update(userCollection.doc(userId), {
                friendRequests: updatedUserFriendRequests,
                friends: updatedUserFriends,
                updatedAt: new Date().toISOString()
            });
            
            // Update requester's data (sender)
            const updatedRequesterFriends = [...(requesterData.friends || []), userId];
            
            batch.update(userCollection.doc(requesterId), {
                friends: updatedRequesterFriends,
                updatedAt: new Date().toISOString()
            });
            
            // Commit the batch
            await batch.commit();
            
            return { 
                success: true, 
                message: `You are now friends with ${requesterData.username}` 
            };
        } catch (error) {
            console.error('Error accepting friend request:', error);
            throw error;
        }
    },


    // Reject a Friend Request
    async rejectFriendRequest(userId, requesterId) {
        try {
            // Get user data
            const userDoc = await userCollection.doc(userId).get();
            
            if (!userDoc.exists) {
                return { success: false, message: 'User not found' };
            }
            
            const userData = userDoc.data();
            
            // Check if request exists
            if (!userData.friendRequests || !userData.friendRequests.includes(requesterId)) {
                return { success: false, message: 'No friend request from this user' };
            }
            
            // Remove request
            const updatedFriendRequests = userData.friendRequests.filter(id => id !== requesterId);
            
            await userCollection.doc(userId).update({
                friendRequests: updatedFriendRequests,
                updatedAt: new Date().toISOString()
            });
            
            return { 
                success: true, 
                message: 'Friend request rejected' 
            };
        } catch (error) {
            console.error('Error rejecting friend request:', error);
            throw error;
        }
    },


    // Get Pending Friend Requests
    async getPendingFriendRequests(userId) {
        try {
            const userDoc = await userCollection.doc(userId).get();
            
            if (!userDoc.exists) {
                return { success: false, message: 'User not found' };
            }
            
            const userData = userDoc.data();
            const requestIds = userData.friendRequests || [];
            
            if (requestIds.length === 0) {
                return { success: true, requests: [] };
            }
            
            // Get all requesters' data
            const requesters = [];
            
            for (const requesterId of requestIds) {
                const requesterDoc = await userCollection.doc(requesterId).get();
                if (requesterDoc.exists) {
                    const requesterData = requesterDoc.data();
                    requesters.push({
                        id: requesterDoc.id,
                        username: requesterData.username,
                        profilePicture: requesterData.profilePicture,
                        firstName: requesterData.firstName,
                        lastName: requesterData.lastName,
                        friendsCount: requesterData.friendsCount,
                    });
                }
            }
            
            return { 
                success: true, 
                requests: requesters 
            };
        } catch (error) {
            console.error('Error getting friend requests:', error);
            throw error;
        }
    },


    // Remove a Friend
    async removeFriend(userId, friendId) {
        try {
            // Get both users
            const userDoc = await userCollection.doc(userId).get();
            const friendDoc = await userCollection.doc(friendId).get();
            
            if (!userDoc.exists || !friendDoc.exists) {
                return { success: false, message: 'User not found' };
            }
            
            const userData = userDoc.data();
            const friendData = friendDoc.data();
            
            // Check if they are friends
            if (!userData.friends || !userData.friends.includes(friendId)) {
                return { success: false, message: 'You are not friends with this user' };
            }
            
            // Update both users' friends lists using batch
            const batch = db.batch();
            
            // Remove friendId from user's friends array
            const updatedUserFriends = userData.friends.filter(id => id !== friendId);
            
            batch.update(userCollection.doc(userId), {
                friends: updatedUserFriends,
                updatedAt: new Date().toISOString()
            });
            
            // Remove userId from friend's friends array
            const updatedFriendFriends = friendData.friends ? friendData.friends.filter(id => id !== userId) : [];
            
            batch.update(userCollection.doc(friendId), {
                friends: updatedFriendFriends,
                updatedAt: new Date().toISOString()
            });
            
            // Commit the batch
            await batch.commit();
            
            return { 
                success: true, 
                message: `Removed ${friendData.username} from your friends` 
            };
        } catch (error) {
            console.error('Error removing friend:', error);
            throw error;
        }
    },


    // Get Friend List
    async getFriendsList(userId) {
        try {
            const userDoc = await userCollection.doc(userId).get();
            
            if (!userDoc.exists) {
                return { success: false, message: 'User not found' };
            }
            
            const userData = userDoc.data();
            const friendIds = userData.friends || [];
            
            if (friendIds.length === 0) {
                return { success: true, friends: [] };
            }
            
            // Get all friends' data
            const friends = [];
            
            for (const friendId of friendIds) {
                const friendDoc = await userCollection.doc(friendId).get();
                if (friendDoc.exists) {
                    const friendData = friendDoc.data();
                    friends.push({
                        id: friendDoc.id,
                        username: friendData.username,
                        profilePicture: friendData.profilePicture,
                        firstName: friendData.firstName,
                        lastName: friendData.lastName,
                        friendsCount: friendData.friendsCount || 0,
                    });
                }
            }
            
            return { 
                success: true, 
                friends: friends 
            };
        } catch (error) {
            console.error('Error getting friends list:', error);
            throw error;
        }
    },


     // Get Suggested Friends
    async getSuggestedFriends(currentUserId) {
        try {
            // Get current user
            const currentUserDoc = await userCollection.doc(currentUserId).get();
            
            if (!currentUserDoc.exists) {
                return {
                    success: false,
                    message: 'Current user not found'
                };
            }

            const currentUser = currentUserDoc.data();

            // Get all users from the database
            const allUsersSnapshot = await userCollection.get();
            const allUsers = [];

            allUsersSnapshot.forEach(doc => {
                allUsers.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Filter out suggested friends
            const suggestedFriends = allUsers.filter(user => {
                // Don't suggest the current user
                if (user.id === currentUserId) {
                    return false;
                }

                // Don't suggest users who are already friends
                if (currentUser.friends && currentUser.friends.includes(user.id)) {
                    return false;
                }

                // Don't suggest users who already have pending friend requests
                if (currentUser.friendRequests && currentUser.friendRequests.includes(user.id)) {
                    return false;
                }

                // Only suggest active users
                if (user.accountStatus === 'inactive' || user.accountStatus === 'banned') {
                    return false;
                }

                return true;
            });

            // Remove sensitive information and add friend request status
            const sanitizedSuggestedFriends = suggestedFriends.map(user => {
                // Check if current user has sent a friend request to this user
                const friendRequestSent = user.friendRequests && user.friendRequests.includes(currentUserId);
                
                return {
                    id: user.id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profilePicture: user.profilePicture,
                    friendsCount: user.friends ? user.friends.length : 0,
                    friendRequestSent: friendRequestSent // This helps frontend disable the button
                };
            });

            return {
                success: true,
                message: 'Suggested friends retrieved successfully',
                suggestedFriends: sanitizedSuggestedFriends
            };

        } catch (error) {
            console.error('Error getting suggested friends:', error);
            return {
                success: false,
                message: 'Internal server error'
            };
        }
    },


    // check other users friend status
    async getOtherUserFriendStatus(otherUserId, currentUserId) {
        try {
            const currentUserDoc = await userCollection.doc(currentUserId).get();
            const otherUserDoc = await userCollection.doc(otherUserId).get();
            
            if (!currentUserDoc.exists || !otherUserDoc.exists) {
                return {
                    success: false,
                    message: 'Current user not found'
                };
            }

            const currentUser = currentUserDoc.data();
            const otherUser = otherUserDoc.data();

            // check if user already friends
            if (currentUser.friends && currentUser.friends.includes(otherUserId)) {
                return "friend";
            }
            
            // check if user already send friend request
            if (otherUser.friendRequests && otherUser.friendRequests.includes(currentUserId)) {
                return "pending";
            }

            // check if user already has friend request from other user
            if (currentUser.friendRequests && currentUser.friendRequests.includes(otherUserId)) {
                return "requested";
            }

            return "none";
        } catch (error) {
            console.error('Error getting other users friend status:', error);
            return {
                success: false,
                message: 'Internal server error'
            };
        }
    },

    
    // Cancel a Friend Request
    async cancelFriendRequest(senderId, recipientId) {
        try {
            // Get recipient data
            const recipientDoc = await userCollection.doc(recipientId).get();
            
            if (!recipientDoc.exists) {
                return { success: false, message: 'User not found' };
            }
            
            const recipientData = recipientDoc.data();
            
            // Check if request exists
            if (!recipientData.friendRequests || !recipientData.friendRequests.includes(senderId)) {
                return { success: false, message: 'No friend request found to cancel' };
            }
            
            // Remove sender from recipient's friendRequests array
            const updatedFriendRequests = recipientData.friendRequests.filter(id => id !== senderId);
            
            await userCollection.doc(recipientId).update({
                friendRequests: updatedFriendRequests,
                updatedAt: new Date().toISOString()
            });
            
            return { 
                success: true, 
                message: 'Friend request cancelled successfully' 
            };
        } catch (error) {
            console.error('Error cancelling friend request:', error);
            throw error;
        }
    },
    
};

module.exports = FriendService;