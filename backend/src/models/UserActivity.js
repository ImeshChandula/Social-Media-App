class UserActivity {
    constructor(id, activityData) {
        this.id = id;
        this.userId = activityData.userId;
        this.activityType = activityData.activityType; // 'login', 'logout', 'post_create', ..., 'page_create', 'page_update', etc.
        this.description = activityData.description; // Human readable description
        this.metadata = activityData.metadata || {}; // Additional data like postId, pageId, targetUserId, etc.
        this.ipAddress = activityData.ipAddress || '';
        this.userAgent = activityData.userAgent || '';
        this.location = activityData.location || '';
        this.deviceType = activityData.deviceType || 'unknown'; // 'mobile', 'desktop', 'tablet'
        this.browserInfo = activityData.browserInfo || '';

        // Timestamps
        this.createdAt = activityData.createdAt || new Date().toISOString();
        this.updatedAt = activityData.updatedAt || new Date().toISOString();
    }

    // Static method to create activity descriptions
    static generateDescription(activityType, metadata = {}) {
        switch (activityType) {
            case 'login':
                return 'User logged in';
            case 'logout':
                return 'User logged out';
            case 'post_create':
                return 'Created a new post';
            case 'post_update':
                return 'Updated a post';
            case 'post_delete':
                return 'Deleted a post';
            case 'comment_create':
                return 'Added a comment';
            case 'comment_update':
                return 'Updated a comment';
            case 'comment_delete':
                return 'Deleted a comment';
            case 'like':
                return metadata.targetType === 'post' ? 'Liked a post' : 'Liked a comment';
            case 'unlike':
                return metadata.targetType === 'post' ? 'Unliked a post' : 'Unliked a comment';
            case 'friend_request_send':
                return 'Sent a friend request';
            case 'friend_request_accept':
                return 'Accepted a friend request';
            case 'friend_request_decline':
                return 'Declined a friend request';
            case 'friend_remove':
                return 'Removed a friend';
            case 'profile_update':
                return 'Updated profile information';
            case 'profile_picture_update':
                return 'Updated profile picture';
            case 'cover_photo_update':
                return 'Updated cover photo';
            case 'password_change':
                return 'Changed password';
            case 'story_create':
                return 'Created a new story';
            case 'story_view':
                return 'Viewed a story';
            case 'notification_read':
                return 'Read notifications';
            case 'search':
                return `Searched for "${metadata.query}"`;
            case 'marketplace_item_create':
                return 'Listed an item in marketplace';
            case 'marketplace_item_update':
                return 'Updated marketplace item';
            case 'marketplace_item_delete':
                return 'Removed marketplace item';
                // New page-related types
            case 'page_create':
                return 'Created a new page';
            case 'page_update':
                return 'Updated page details';
            case 'page_delete':
                return 'Deleted a page';
            case 'page_post_create':
                return 'Created a post on a page';
            case 'page_post_update':
                return 'Updated a post on a page';
            case 'page_post_delete':
                return 'Deleted a post on a page';
            case 'page_review_create':
                return 'Created a review on a page';
            case 'page_review_update':
                return 'Updated a review on a page';
            case 'page_review_delete':
                return 'Deleted a review on a page';
            case 'page_follow':
                return 'Followed a page';
            case 'page_unfollow':
                return 'Unfollowed a page';
            case 'page_admin_add':
                return 'Added an admin to a page';
            case 'page_moderator_add':
                return 'Added a moderator to a page';
            default:
                return 'Performed an action';
        }
    }

    // Method to get activity category for filtering
    getCategory() {
        const categories = {
            'login': 'authentication',
            'logout': 'authentication',
            'password_change': 'authentication',
            'post_create': 'content',
            'post_update': 'content',
            'post_delete': 'content',
            'comment_create': 'content',
            'comment_update': 'content',
            'comment_delete': 'content',
            'story_create': 'content',
            'story_view': 'content',
            'like': 'interaction',
            'unlike': 'interaction',
            'friend_request_send': 'social',
            'friend_request_accept': 'social',
            'friend_request_decline': 'social',
            'friend_remove': 'social',
            'profile_update': 'profile',
            'profile_picture_update': 'profile',
            'cover_photo_update': 'profile',
            'search': 'activity',
            'notification_read': 'activity',
            'marketplace_item_create': 'marketplace',
            'marketplace_item_update': 'marketplace',
            'marketplace_item_delete': 'marketplace',
            // New page-related categories
            'page_create': 'page',
            'page_update': 'page',
            'page_delete': 'page',
            'page_post_create': 'page_content',
            'page_post_update': 'page_content',
            'page_post_delete': 'page_content',
            'page_review_create': 'page_interaction',
            'page_review_update': 'page_interaction',
            'page_review_delete': 'page_interaction',
            'page_follow': 'page_interaction',
            'page_unfollow': 'page_interaction',
            'page_admin_add': 'page_management',
            'page_moderator_add': 'page_management'
        };

        return categories[this.activityType] || 'other';
    }
}

module.exports = UserActivity;