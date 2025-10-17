class PageReview {
    constructor(id, data) {
        this.id = id;
        this.pageId = data.pageId;
        this.userId = data.userId;
        this.rating = data.rating; // 1-5 stars
        this.reviewType = data.reviewType; // 'text', 'image', 'video', 'image_text', 'video_text'
        this.content = data.content || '';
        this.media = data.media || []; // Array of image/video URLs
        this.mediaType = data.mediaType || null; // 'image' or 'video'
        this.replies = data.replies || []; // Array of reply objects
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    // Getter for replies count
    get repliesCount() {
        return this.replies ? this.replies.length : 0;
    }
}

module.exports = PageReview;