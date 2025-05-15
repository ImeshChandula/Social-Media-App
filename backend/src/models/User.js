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


}

module.exports = User;