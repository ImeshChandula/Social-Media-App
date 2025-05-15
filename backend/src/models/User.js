const { connectFirebase } = require('../config/firebase');
const bcrypt = require('bcrypt');
const ROLES = require("../enums/roles");

const db = connectFirebase();
const userCollection = db.collection('users');



class User {
  constructor(id, userData) {
    this.id = id;

    // Required fields trim: remove spaces
    this.username = userData.username;
    this.email = userData.email;
    this.password = userData.password;
    this.firstName = userData.firstName;
    this.lastName = userData.lastName;
    this._isPasswordModified = false;

    // Optional fields with defaults
    this.profilePicture = userData.profilePicture || 'default-profile.png';
    this.coverPhoto = userData.coverPhoto || 'default-cover.png';
    this.bio = userData.bio || '';
    this.location = userData.location || '';
    this.birthday = userData.birthday || null;

    this.friends = userData.friends || [];
    this.friendRequests = userData.friendRequests || [];

    this.isActive = userData.isActive !== undefined ? userData.isActive : true;
    this.lastLogin = userData.lastLogin || null;

    // Validate role
    this.role = Object.values(ROLES).includes(userData.role) ? userData.role : ROLES.USER;

    // Validate account status
    const allowedStatuses = ["active", "inactive", "banned"];
    this.accountStatus = allowedStatuses.includes(userData.accountStatus) ? userData.accountStatus : "active";

     // Timestamps
    this.createdAt = userData.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }







  // You're not using MongoDB anymore
  // you're using Firebase Firestore with a custom class-based User model!
  // It has custom methods like save(), findOne(), findById(), findByIdAndUpdate() find()

  /// Create a new user
    static async create(userData) {
        try {
            // Validate userData
            if (!userData || !userData.email || !userData.password) {
                throw new Error('Email and password are required');
            }

            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);

            const userRef = await userCollection.add({...userData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            return new User(userRef.id, userData);
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    };

  // Compare password
    static async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    };


  // Get all users
    static async findAll() {
        try {
            const usersRef = await userCollection.get();

            if (usersRef.empty) {
                return [];
            }

            return usersRef.docs.map(doc => new User(doc.id, doc.data()));
        } catch (error) {
            console.error('Error finding all users:', error);
            throw error;
        }
    };

  // Get a user by ID
    static async findById(id) {
        try {
            const userDoc = await userCollection.doc(id).get();
            if (!userDoc.exists) {
                return null;
            }
        
            const userData = userDoc.data();
            return new User(userDoc.id, userData);
        } catch (error) {
            console.error('Error finding user for that ID:', error);
            throw error;
        }
    };

// Get a user by username
  static async findByUsername(username) {
    try {
      const snapshot = await userCollection.where('username', '==', username).get();
    
      if (snapshot.empty) {
        return null;
      }

      const userDoc = snapshot.docs[0];
      return new User(userDoc.id, userDoc.data());
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  };


  // Get a user by email
    static async findByEmail(email) {
        try {
            const userRef = await userCollection.where('email', '==', email).get();
            
            if (userRef.empty){
                return null;
            }

            const userDoc = userRef.docs[0];
            return new User(userDoc.id, userDoc.data());
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    };

  // Update a user
    static async updateById(id, updateData) {
        try {
            const userDoc = await userCollection.doc(id).get();

            if (!userDoc.exists) {
                return false;
            }
            
            updateData.updatedAt = new Date().toISOString();
        
            await userCollection.doc(id).update(updateData);
        
            const updatedUser = await User.findById(id);
            return updatedUser;
        } catch (error) {
            throw error;
        }
    };

  // Delete a user
    static async deleteById(id) {
        try {
            const userDoc = await userCollection.doc(id).get();

            if (!userDoc.exists) {
                return false;
            }

            await userCollection.doc(id).delete();
            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    };


  // get friends count
  get friendsCount() {
    return this.friends.length;
  };

  // get friends count
  get friendRequestCount() {
    return this.friendRequests.length;
  };


  // Send a Friend Request
  static async sendFriendRequest(senderId, recipientUsername) {
    try {
      // Find the recipient by username (case insensitive)
      const lowercaseUsername = recipientUsername.toLowerCase();
      const snapshot = await userCollection.where('username', '==', lowercaseUsername).get();
      
      if (snapshot.empty) {
        return { success: false, message: 'User not found' };
      }

      const recipientDoc = snapshot.docs[0];
      const recipientId = recipientDoc.id;
      const recipient = recipientDoc.data();
      
      // Check if users are already friends
      if (recipient.friends && recipient.friends.includes(senderId)) {
        return { success: false, message: 'You are already friends with this user' };
      }
      
      // Check if request already sent
      if (recipient.friendRequests && recipient.friendRequests.includes(senderId)) {
        return { success: false, message: 'Friend request already sent' };
      }
      
      // Check if this is a request to self
      if (senderId === recipientId) {
        return { success: false, message: 'You cannot send a friend request to yourself' };
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
  };


  // Accept a Friend Request
  static async acceptFriendRequest(userId, requesterId) {
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
      
      // Update user's data
      const updatedUserFriendRequests = userData.friendRequests.filter(id => id !== requesterId);
      const updatedUserFriends = [...(userData.friends || []), requesterId];
      
      batch.update(userCollection.doc(userId), {
        friendRequests: updatedUserFriendRequests,
        friends: updatedUserFriends,
        updatedAt: new Date().toISOString()
      });
      
      // Update requester's data
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
  };


  // Reject a Friend Request
  static async rejectFriendRequest(userId, requesterId) {
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
  };


  // Get Pending Friend Requests
  static async getPendingFriendRequests(userId) {
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
            lastName: requesterData.lastName
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
  };


  // Remove a Friend
  static async removeFriend(userId, friendId) {
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
      
      // Update both users' friends lists
      const batch = db.batch();
      
      // Update user's data
      const updatedUserFriends = userData.friends.filter(id => id !== friendId);
      
      batch.update(userCollection.doc(userId), {
        friends: updatedUserFriends,
        updatedAt: new Date().toISOString()
      });
      
      // Update friend's data
      const updatedFriendFriends = friendData.friends.filter(id => id !== userId);
      
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
  };


  // Add this method to your User class
  static async getFriendsList(userId) {
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
            lastName: friendData.lastName
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
  };

}

module.exports = User;