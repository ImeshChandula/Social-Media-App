const ActivityService = require('../services/activityService');

/**
 * Extract device and browser information from user agent
 * @param {string} userAgent - User agent string
 * @returns {Object} Device and browser info
 */
function parseUserAgent(userAgent) {
    if (!userAgent) return { deviceType: 'unknown', browserInfo: 'unknown' };

    const ua = userAgent.toLowerCase();
    let deviceType = 'desktop';
    let browserInfo = 'unknown';

    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
        deviceType = 'mobile';
    } else if (/tablet|ipad/i.test(ua)) {
        deviceType = 'tablet';
    }

    if (ua.includes('chrome')) {
        browserInfo = 'Chrome';
    } else if (ua.includes('firefox')) {
        browserInfo = 'Firefox';
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
        browserInfo = 'Safari';
    } else if (ua.includes('edge')) {
        browserInfo = 'Edge';
    } else if (ua.includes('opera')) {
        browserInfo = 'Opera';
    }

    return { deviceType, browserInfo };
}

/**
 * Extract client IP address from request
 * @param {Object} req - Express request object
 * @returns {string} IP address
 */
function getClientIP(req) {
    return (
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
        '0.0.0.0'
    );
}

/**
 * Activity logging middleware factory
 */
function logActivity(activityType, metadataExtractor = null) {
    return async(req, res, next) => {
        const originalJson = res.json;

        res.json = function(data) {
            if (res.statusCode >= 200 && res.statusCode < 400) {
                setImmediate(async() => {
                    try {
                        if (req.user && req.user.id) {
                            const userAgent = req.headers['user-agent'] || '';
                            const { deviceType, browserInfo } = parseUserAgent(userAgent);
                            const ipAddress = getClientIP(req);

                            let metadata = {};
                            if (metadataExtractor && typeof metadataExtractor === 'function') {
                                metadata = metadataExtractor(req, res, data);
                            }

                            await ActivityService.logActivity(req.user.id, activityType, {
                                metadata,
                                ipAddress,
                                userAgent,
                                deviceType,
                                browserInfo,
                            });
                        }
                    } catch (error) {
                        console.error('Error in activity logging middleware:', error);
                    }
                });
            }
            return originalJson.call(this, data);
        };

        next();
    };
}

/**
 * Loggers
 */
const logLogin = logActivity('login', (req) => ({
    loginMethod: req.body.loginMethod || 'email',
    rememberMe: req.body.rememberMe || false,
}));

const logLogout = logActivity('logout');

const logPostCreate = logActivity('post_create', (req, res, data) => ({
    postId: (data.post && data.post.id) || req.body.id,
    postType: req.body.type || 'text',
    hasMedia: !!(req.body.images || req.body.videos),
    categoryId: req.body.categoryId,
}));

const logPostUpdate = logActivity('post_update', (req) => ({
    postId: req.params.id,
    fieldsUpdated: Object.keys(req.body),
}));

const logPostDelete = logActivity('post_delete', (req) => ({
    postId: req.params.id,
}));

const logCommentCreate = logActivity('comment_create', (req, res, data) => ({
    commentId: data.comment ? data.comment.id : null,
    postId: req.body.postId,
    parentCommentId: req.body.parentCommentId || null,
}));

const logLike = logActivity('like', (req) => ({
    targetId: req.params.id || req.body.postId || req.body.commentId,
    targetType: req.body.type || (req.params.postId ? 'post' : 'comment'),
}));

const logUnlike = logActivity('unlike', (req) => ({
    targetId: req.params.id || req.body.postId || req.body.commentId,
    targetType: req.body.type || (req.params.postId ? 'post' : 'comment'),
}));

const logFriendRequest = logActivity('friend_request_send', (req) => ({
    targetUserId: req.params.id || req.body.userId,
}));

const logFriendAccept = logActivity('friend_request_accept', (req) => ({
    targetUserId: req.params.id || req.body.userId,
}));

const logFriendDecline = logActivity('friend_request_decline', (req) => ({
    targetUserId: req.params.id || req.body.userId,
}));

const logProfileUpdate = logActivity('profile_update', (req) => ({
    fieldsUpdated: Object.keys(req.body).filter((key) => !['password'].includes(key)),
}));

const logProfilePictureUpdate = logActivity('profile_picture_update');

const logCoverPhotoUpdate = logActivity('cover_photo_update');

const logPasswordChange = logActivity('password_change');

const logSearch = logActivity('search', (req) => ({
    query: req.query.q,
    limit: req.query.limit,
    resultCount: req.searchResultCount || 0,
}));

const logStoryCreate = logActivity('story_create', (req, res, data) => ({
    storyId: data.story ? data.story.id : null,
    storyType: req.body.type || 'image',
}));

const logMarketplaceCreate = logActivity('marketplace_item_create', (req, res, data) => ({
    itemId: data.item ? data.item.id : null,
    category: req.body.category,
    price: req.body.price,
}));

const logPageCreate = logActivity('page_create', (req, res, data) => ({
    pageId: data.page ? data.page.id : null,
    pageName: req.body.pageName,
    category: req.body.category,
}));

const logPageUpdate = logActivity('page_update', (req) => ({
    pageId: req.params.id,
    fieldsUpdated: Object.keys(req.body),
}));

const logPageDelete = logActivity('page_delete', (req) => ({
    pageId: req.params.id,
}));

const logPagePostCreate = logActivity('page_post_create', (req, res, data) => ({
    pageId: req.params.pageId,
    postId: data.post ? data.post.id : null,
    postType: req.body.type,
}));

const logPageReviewCreate = logActivity('page_review_create', (req, res, data) => ({
    pageId: req.params.pageId,
    reviewId: data.review ? data.review.id : null,
    rating: req.body.rating,
}));

const logPageFollow = logActivity('page_follow', (req) => ({
    pageId: req.params.id,
}));

const logPageUnfollow = logActivity('page_unfollow', (req) => ({
    pageId: req.params.id,
}));

module.exports = {
    logActivity,
    logLogin,
    logLogout,
    logPostCreate,
    logPostUpdate,
    logPostDelete,
    logCommentCreate,
    logLike,
    logUnlike,
    logFriendRequest,
    logFriendAccept,
    logFriendDecline,
    logProfileUpdate,
    logProfilePictureUpdate,
    logCoverPhotoUpdate,
    logPasswordChange,
    logSearch,
    logStoryCreate,
    logMarketplaceCreate,
    logPageCreate,
    logPageUpdate,
    logPageDelete,
    logPagePostCreate,
    logPageReviewCreate,
    logPageFollow,
    logPageUnfollow,
};