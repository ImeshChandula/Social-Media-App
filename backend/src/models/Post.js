
class Post {
    constructor(id, postData) {
        // Add safety check for postData
        if (!postData || typeof postData !== 'object') {
            console.warn(`Post constructor called with invalid data for ID ${id}:`, postData);
            postData = {}; // Fallback to empty object
        }

        this.id = id;
        this.author = postData.author;
        this.authorType = postData.authorType || 'user'; // 'user' or 'page'
        this.createdBy = postData.createdBy || null; // Track actual user who created the post (for page posts)
        this.content = postData.content || '';
        this.media = postData.media || [];
        this.mediaType = postData.mediaType || '';
        this.category = postData.category || null; // Category field for videos
        this.tags = postData.tags || [];
        this.privacy = postData.privacy || 'public';
        this.location = postData.location || null;

        this.likes = postData.likes || [];
        this.comments = postData.comments || [];
        this.shares = postData.shares || [];

        this.isEdited = postData.isEdited || false;
        this.editHistory = postData.editHistory || [];

        // Report related fields
        this.isReported = postData.isReported || false;
        this.reportCount = postData.reportCount || 0;
        this.isHidden = postData.isHidden || false; // Hidden from normal feed when reported
        this.reports = postData.reports || []; // Array of report IDs

        this.createdAt = postData.createdAt || new Date().toISOString();
        this.updatedAt = postData.updatedAt || new Date().toISOString();
    }

    // get comment count
    get commentCount() {
        return this.comments.length;
    }

    // get like count
    get likeCount() {
        return this.likes.length;
    }

    // get share count
    get shareCount() {
        return this.shares.length;
    }

    // Check if this is a page post
    get isPagePost() {
        return this.authorType === 'page';
    }

    // Check if this is a user post
    get isUserPost() {
        return this.authorType === 'user';
    }
}

module.exports = Post;