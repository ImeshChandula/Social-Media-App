const { connectFirebase } = require('../config/firebase');
const bcrypt = require('bcrypt');

const db = connectFirebase();
const usersCollection = db.collection('users');

const ROLES = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
};

class User {
  constructor(userData) {
    // Required fields trim: remove spaces
    this.username = userData.username?.trim();
    this.email = userData.email?.trim().toLowerCase();
    this.password = userData.password;
    this.firstName = userData.firstName?.trim();
    this.lastName = userData.lastName?.trim();
    

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

  // save user to database
  async save(){
    try {
      if (this.password && this._isPasswordModified) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
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
  }


  // convert to firestore compatible
  toFirestore() {
    const user = { ...this };
    delete user.id; // Remove id property as it's stored as document ID
    delete user._isPasswordModified; // Remove internal property
    return user;
  }


  // validate password
  async validatePassword(password) {
    return await bcrypt.compare(password, this.password);
  }



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
  }


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
  }

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
  }

}

module.exports = User;