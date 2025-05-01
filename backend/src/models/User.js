const { connectFirebase } = require('../config/firebase');
const bcrypt = require('bcrypt');
const ROLES = require("../enums/roles");

const db = connectFirebase();
const usersCollection = db.collection('users');



class User {
  constructor(userData) {
    // Required fields trim: remove spaces
    this.username = userData.username;
    this.email = userData.email?.trim().toLowerCase();
    this.password = userData.password;
    this.firstName = userData.firstName?.trim();
    this.lastName = userData.lastName?.trim();
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
    this.accountStatus = allowedStatuses.includes(userData.accountStatus)
      ? userData.accountStatus
      : "active";

     // Timestamps
    this.createdAt = userData.createdAt || new Date();
    this.updatedAt = userData.updatedAt || new Date();
  }







  // You're not using MongoDB anymore
  // you're using Firebase Firestore with a custom class-based User model!
  // It has custom methods like save(), findOne(), findById(), findByIdAndUpdate() find()

  // save user to database
  async save(){
    try {
      if (this.password && (this._isPasswordModified || !this.id)) {
        console.log("Hashing password...");

        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        
        console.log("Password hashed:", this.password.substring(0, 20) + "...");
        this._isPasswordModified = false;
      }

      this.updatedAt = new Date();

      if (this.id) {
        // update existing user
        await usersCollection.doc(this.id).update(this.toFirestore());
        return this.id;
      } else {
        // create new user
        const docRef = await usersCollection.add(this.toFirestore());
        this.id = docRef.id;
        return this.id;
      }
    } catch (error) {
      throw error;
    }
  };

  // convert to firestore compatible
  toFirestore() {
    const user = { ...this };
    delete user.id; // Remove id property as it's stored as document ID
    delete user._isPasswordModified; // Remove internal property
    return user;
  };


  // validate password
  async validatePassword(password) {
    console.log("Input password:", password);
    console.log("Stored hash:", this.password.substring(0, 20) + "...");
    
    const result = await bcrypt.compare(password, this.password);
    console.log("bcrypt.compare result:", result);
    return result;
  };




  // static methods
  static async find(){
    try {
      const snapshot = await usersCollection.get();

      if (snapshot.empty) {
        return []; // No users found, return empty array
      }

      const users = [];

      snapshot.forEach(doc => {
        const userData = doc.data();
        userData.id = doc.id; // attach document id
        delete userData.password; // don't send password to frontend
        users.push(userData);
    });

    return users;
    } catch (error) {
      throw error;
    }
  };

  static async findById(id) {
    try {
      const doc = await usersCollection.doc(id).get();
      if(!doc.exists) {
        return null;
      }

      const userData = doc.data();
      const user = new User(userData);
      user.id = doc.id;
      
      return user;
    } catch (error) {
      throw error;
    }
  };


  static async findByUsername(username) {
    try {
      const snapshot = await usersCollection.where('username', '==', username).limit(1).get();
    
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const userData = doc.data();
      const user = new User(userData);

      user.id = doc.id;
        
      return user;
    } catch (error) {
      throw error;
    }
  };


  static async findOne(filter){
    try {
      let query = usersCollection;

      // build query from filter
      Object.keys(filter).forEach(key => {
        query = query.where(key, '==', filter[key]);
      });

      const snapshot = await query.limit(1).get();

      if (snapshot.empty){
        return null;
      }

      const doc = snapshot.docs[0];
      const userData = doc.data();

      const user = new User(userData);
      user.id = doc.id;

      return user;
    } catch (error) {
      throw error;
    }
  };

  static async findByIdAndUpdate(id, updateData, options = {}) {
    try {
      const user = await this.findById(id);
      if(!user) {
        return null;
      }

      // update fields
      Object.keys(updateData.$set || updateData).forEach(key => {
        user[key] = (updateData.$set || updateData)[key];
      });
      
      await user.save();
      
      // If options.new is true, return updated document
      if (options.new) return user;
      return user;
    } catch (error) {
      throw error;
    }
  };

  static async findByIdAndDelete(id) {
    try{
      const docRef = usersCollection.doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return null;
      }
      
      await docRef.delete();
      return { id };
    } catch (error) {
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