class Page {
    constructor(id, data) {
        this.id = id;
        this.pageName = data.pageName;
        this.description = data.description;
        this.category = data.category;
        this.coverPhoto = data.coverPhoto || '';
        this.profilePicture = data.profilePicture || '';
        this.owner = data.owner;

        this.admins = data.admins || [];
        this.followers = data.followers || [];
        this.likes = data.likes || [];

        this.website = data.website || '';
        this.phone = data.phone || '';
        this.email = data.email || '';
        this.address = data.address || '';

        this.isVerified = data.isVerified || false;
        this.isPublished = data.isPublished !== undefined ? data.isPublished : true;
        
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }
}

module.exports = Page;