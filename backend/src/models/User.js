const ROLES = require("../enums/roles");

// User table
class User {
  constructor(id, userData) {
    this.id = id;

    this.username = userData.username;
    this.email = userData.email;
    this.phone = userData.phone;
    this.password = userData.password;
    this.firstName = userData.firstName;
    this.lastName = userData.lastName;
    this._isPasswordModified = false;

    this.profilePicture = userData.profilePicture;
    this.coverPhoto = userData.coverPhoto;
    this.bio = userData.bio || '';
    this.location = userData.location || '';
    this.birthday = userData.birthday || null;
    this.jobCategory = userData.jobCategory || "None";

    this.friends = userData.friends || [];
    this.friendRequests = userData.friendRequests || [];

    this.favorites = userData.favorites || []; //new field for favorite posts

    this.resetOtp = userData.resetOtp || '';
    this.resetOtpExpiredAt = userData.resetOtpExpiredAt || new Date().toISOString();

    this.isActive = userData.isActive;
    this.isPublic = userData.isPublic; // Profile visibility
    this.lastLogin = userData.lastLogin || new Date().toISOString();

    this.role = userData.role || ROLES.USER;
    this.accountStatus = userData.accountStatus || "active";
    this.notificationCount = userData.notificationCount || '';
    
    // Timestamps
    this.createdAt = userData.createdAt || new Date().toISOString();
    this.updatedAt = userData.createdAt || new Date().toISOString();
  }


  // get friends count
  get friendsCount() {
    return this.friends.length;
  };

  // get friends count
  get friendRequestCount() {
    return this.friendRequests.length;
  };

  // get favorites count
  get favoritesCount() {
    return this.favorites.length;
  }

}

module.exports = User;