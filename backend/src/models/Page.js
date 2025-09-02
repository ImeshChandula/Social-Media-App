class Page {
    constructor(id, data) {
        this.id = id;
        this.pageName = data.pageName;
        this.username = data.username || '';
        this.description = data.description;
        this.category = data.category;
        this.coverPhoto = data.coverPhoto || '';
        this.profilePicture = data.profilePicture || '';
        this.owner = data.owner;

        this.admins = data.admins || [];
        this.followers = data.followers || [];
        //this.followersCount = data.followersCount || 0;

        // Contact details (required for business pages)
        this.phone = data.phone || '';
        this.email = data.email || '';
        this.address = data.address || '';

        // Posts
        this.posts = data.posts || [];
        //this.postsCount = data.postsCount || 0;

        // Status and verification
        this.isVerified = data.isVerified || false;
        this.isPublished = data.isPublished !== undefined ? data.isPublished : true;
        this.approvalStatus = data.approvalStatus || 'pending'; // pending, approved, rejected
        this.submittedForApproval = data.submittedForApproval || false;
        this.submittedAt = data.submittedAt || null;
        this.publishedAt = data.publishedAt || null;

        // Admin review fields
        this.reviewNote = data.reviewNote || '';
        this.reviewedBy = data.reviewedBy || null;
        this.reviewedAt = data.reviewedAt || null;


        // Ban status fields
        this.isBanned = data.isBanned || false;
        this.banReason = data.banReason || null;
        this.bannedBy = data.bannedBy || null;
        this.bannedAt = data.bannedAt || null;
        this.unbannedBy = data.unbannedBy || null;
        this.unbannedAt = data.unbannedAt || null;
        
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    // Getter for followers count
    get followersCount() {
        return this.followers ? this.followers.length : 0;
    }

    // Getter for posts count
    get postsCount() {
        return this.posts ? this.posts.length : 0;
    }

    // Helper method to get display status
    get displayStatus() {
        if (this.isBanned) return 'banned';
        if (!this.isPublished && this.approvalStatus === 'approved') return 'approved';
        if (!this.isPublished && this.approvalStatus === 'pending') return 'pending';
        if (!this.isPublished && this.approvalStatus === 'rejected') return 'rejected';
        if (this.isPublished && this.approvalStatus === 'approved') return 'published';
        return 'draft';
    }
}

module.exports = Page;