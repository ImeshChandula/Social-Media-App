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

}