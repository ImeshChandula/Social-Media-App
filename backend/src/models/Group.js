class Group {
  constructor(id, data) {
    this.id = id;
    this.groupName = data.groupName;
    this.description = data.description;
    this.privacy = data.privacy || 'Public';
    this.coverPhoto = data.coverPhoto || '';
    this.profilePicture = data.profilePicture || '';
    this.creator = data.creator;

    this.admins = data.admins || [];
    this.moderators = data.moderators || [];
    this.members = data.members || [];
    this.pendingRequests = data.pendingRequests || [];
    this.rules = data.rules || [];
    this.tags = data.tags || [];
    this.location = data.location || '';

    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.memberCount = data.memberCount || 0;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
}

module.exports = Group;