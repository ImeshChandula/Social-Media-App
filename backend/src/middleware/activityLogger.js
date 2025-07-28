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

  // Detect device type
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    deviceType = 'mobile';
  } else if (/tablet|ipad/i.test(ua)) {
    deviceType = 'tablet';
  }

  // Detect browser
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
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         '0.0.0.0';
}

/**
 * Activity logging middleware factory
 * @param {string} activityType - Type of activity to log
 * @param {Function} metadataExtractor - Function to extract metadata from req, res
 * @returns {Function} Express middleware function
 */
function logActivity(activityType, metadataExtractor = null) {
  return async (req, res, next) => {
    // Store original res.json to intercept successful responses
    const originalJson = res.json;
    
    res.json = function(data) {
      // Only log activity if the response was successful
      if (res.statusCode >= 200 && res.statusCode < 400) {
        // Run async activity logging without blocking the response
        setImmediate(async () => {
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
                browserInfo
              });
            }
          } catch (error) {
            console.error('Error in activity logging middleware:', error);
            // Don't throw error to avoid breaking the main flow
          }
        });
      }
      
      // Call original res.json
      return originalJson.call(this, data);
    };
    
    next();
  };
}

/**
 * Login activity logger
 */
const logLogin = logActivity('login', (req) => ({
  loginMethod: req.body.loginMethod || 'email',
  rememberMe: req.body.rememberMe || false
}));

/**
 * Logout activity logger
 */
const logLogout = logActivity('logout');

/**
 * Post creation activity logger
 */
const logPostCreate = logActivity('post_create', (req, res, data) => ({
  postId: data.post?.id || req.body.id,
  postType: req.body.type || 'text',
  hasMedia: !!(req.body.images || req.body.videos),
  categoryId: req.body.categoryId
}));

/**
 * Post update activity logger
 */
const logPostUpdate = logActivity('post_update', (req) => ({
  postId: req.params.id,
  fieldsUpdated: Object.keys(req.body)
}));

/**
 * Post delete activity logger
 */
const logPostDelete = logActivity('post_delete', (req) => ({
  postId: req.params.id
}));

/**
 * Comment creation activity logger
 */
const logCommentCreate = logActivity('comment_create', (req, res, data) => ({
  commentId: data.comment?.id,
  postId: req.body.postId,
  parentCommentId: req.body.parentCommentId || null
}));

/**
 * Like activity logger
 */
const logLike = logActivity('like', (req) => ({
  targetId: req.params.id || req.body.postId || req.body.commentId,
  targetType: req.body.type || (req.params.postId ? 'post' : 'comment')
}));

/**
 * Unlike activity logger
 */
const logUnlike = logActivity('unlike', (req) => ({
  targetId: req.params.id || req.body.postId || req.body.commentId,
  targetType: req.body.type || (req.params.postId ? 'post' : 'comment')
}));

/**
 * Friend request activity logger
 */
const logFriendRequest = logActivity('friend_request_send', (req) => ({
  targetUserId: req.params.id || req.body.userId
}));

/**
 * Friend request accept activity logger
 */
const logFriendAccept = logActivity('friend_request_accept', (req) => ({
  targetUserId: req.params.id || req.body.userId
}));

/**
 * Friend request decline activity logger
 */
const logFriendDecline = logActivity('friend_request_decline', (req) => ({
  targetUserId: req.params.id || req.body.userId
}));

/**
 * Profile update activity logger
 */
const logProfileUpdate = logActivity('profile_update', (req) => ({
  fieldsUpdated: Object.keys(req.body).filter(key => !['password'].includes(key))
}));

/**
 * Profile picture update activity logger
 */
const logProfilePictureUpdate = logActivity('profile_picture_update');

/**
 * Cover photo update activity logger
 */
const logCoverPhotoUpdate = logActivity('cover_photo_update');

/**
 * Password change activity logger
 */
const logPasswordChange = logActivity('password_change');

/**
 * Search activity logger
 */
const logSearch = logActivity('search', (req) => ({
  query: req.query.q,
  limit: req.query.limit,
  resultCount: req.searchResultCount || 0
}));

/**
 * Story creation activity logger
 */
const logStoryCreate = logActivity('story_create', (req, res, data) => ({
  storyId: data.story?.id,
  storyType: req.body.type || 'image'
}));

/**
 * Marketplace item creation activity logger
 */
const logMarketplaceCreate = logActivity('marketplace_item_create', (req, res, data) => ({
  itemId: data.item?.id,
  category: req.body.category,
  price: req.body.price
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
  logMarketplaceCreate
};