const ROLES = require("../enums/roles");

// User table
class User {
  constructor(id, userData) {
    this.id = id;

    this.username = userData.username;
    this.email = userData.email;
    this.password = userData.password;
    this.firstName = userData.firstName;
    this.lastName = userData.lastName;
    this._isPasswordModified = false;

    this.profilePicture = userData.profilePicture;
    this.coverPhoto = userData.coverPhoto;
    this.bio = userData.bio || '';
    this.location = userData.location || '';
    this.birthday = userData.birthday || null;

    this.friends = userData.friends || [];
    this.friendRequests = userData.friendRequests || [];

    this.isActive = userData.isActive || true;
    this.lastLogin = userData.lastLogin || new Date().toISOString();

    this.role = userData.role || ROLES.USER;
    this.accountStatus = userData.accountStatus || "active";
    this.notificationCount = userData.notificationCount || '';
    
    // Timestamps
    this.createdAt = userData.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }


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