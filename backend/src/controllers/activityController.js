const ActivityService = require('../services/activityService');
const UserService = require('../services/userService');
const ROLES = require("../enums/roles");

/**
 * Get current user's activity history
 * @route GET /api/activities/my-history
 * @access Private
 */
const getMyActivityHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      category = null,
      activityType = null,
      startDate = null,
      endDate = null,
      sortOrder = 'desc'
    } = req.query;

    // Parse query parameters
    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100), // Max 100 items per page
      category,
      activityType,
      startDate,
      endDate,
      sortOrder
    };

    const result = await ActivityService.getUserActivities(userId, options);

    res.status(200).json({
      success: true,
      message: "Activity history retrieved successfully",
      data: result.activities,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error getting user activity history:', error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving activity history"
    });
  }
};

/**
 * Get activity statistics for current user
 * @route GET /api/activities/my-stats
 * @access Private
 */
const getMyActivityStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;

    const stats = await ActivityService.getActivityStats(userId, period);

    res.status(200).json({
      success: true,
      message: "Activity statistics retrieved successfully",
      data: stats,
      period
    });
  } catch (error) {
    console.error('Error getting activity stats:', error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving activity statistics"
    });
  }
};

/**
 * Get all users' activity history (Super Admin only)
 * @route GET /api/activities/all-history
 * @access Private - Super Admin only
 */
const getAllActivityHistory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      userId = null,
      category = null,
      activityType = null,
      startDate = null,
      endDate = null,
      sortOrder = 'desc'
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100),
      userId,
      category,
      activityType,
      startDate,
      endDate,
      sortOrder
    };

    const result = await ActivityService.getAllActivities(options);

    // Get user information for each activity to make it more readable
    const userIds = [...new Set(result.activities.map(activity => activity.userId))];
    const users = {};
    
    await Promise.all(userIds.map(async (id) => {
      try {
        const user = await UserService.findById(id);
        if (user) {
          users[id] = {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
          };
        }
      } catch (error) {
        console.error(`Error fetching user ${id}:`, error);
        users[id] = { id, username: 'Unknown User' };
      }
    }));

    // Enhance activities with user information
    const enhancedActivities = result.activities.map(activity => ({
      ...activity,
      user: users[activity.userId] || { id: activity.userId, username: 'Unknown User' }
    }));

    res.status(200).json({
      success: true,
      message: "All activity history retrieved successfully",
      data: enhancedActivities,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error getting all activity history:', error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving activity history"
    });
  }
};

/**
 * Get specific user's activity history (Super Admin only)
 * @route GET /api/activities/user/:userId
 * @access Private - Super Admin only
 */
const getUserActivityHistory = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const {
      page = 1,
      limit = 20,
      category = null,
      activityType = null,
      startDate = null,
      endDate = null,
      sortOrder = 'desc'
    } = req.query;

    // Verify target user exists
    const targetUser = await UserService.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100),
      category,
      activityType,
      startDate,
      endDate,
      sortOrder
    };

    const result = await ActivityService.getUserActivities(targetUserId, options);

    res.status(200).json({
      success: true,
      message: "User activity history retrieved successfully",
      data: result.activities,
      pagination: result.pagination,
      user: {
        id: targetUser.id,
        username: targetUser.username,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        email: targetUser.email,
        role: targetUser.role
      }
    });
  } catch (error) {
    console.error('Error getting user activity history:', error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving user activity history"
    });
  }
};

/**
 * Get activity statistics for specific user (Super Admin only)
 * @route GET /api/activities/user/:userId/stats
 * @access Private - Super Admin only
 */
const getUserActivityStats = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const { period = 'month' } = req.query;

    // Verify target user exists
    const targetUser = await UserService.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const stats = await ActivityService.getActivityStats(targetUserId, period);

    res.status(200).json({
      success: true,
      message: "User activity statistics retrieved successfully",
      data: stats,
      period,
      user: {
        id: targetUser.id,
        username: targetUser.username,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName
      }
    });
  } catch (error) {
    console.error('Error getting user activity stats:', error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving user activity statistics"
    });
  }
};

/**
 * Get activity by ID (Super Admin only or own activity)
 * @route GET /api/activities/:activityId
 * @access Private
 */
const getActivityById = async (req, res) => {
  try {
    const activityId = req.params.activityId;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    const activity = await ActivityService.getActivityById(activityId);
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found"
      });
    }

    // Check authorization - user can only see their own activities unless super admin
    if (currentUserRole !== ROLES.SUPER_ADMIN && activity.userId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this activity"
      });
    }

    res.status(200).json({
      success: true,
      message: "Activity retrieved successfully",
      data: activity
    });
  } catch (error) {
    console.error('Error getting activity by ID:', error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving activity"
    });
  }
};

/**
 * Delete old activities (Super Admin only - for maintenance)
 * @route DELETE /api/activities/cleanup
 * @access Private - Super Admin only
 */
const cleanupOldActivities = async (req, res) => {
  try {
    const { daysOld = 365 } = req.body;

    const deletedCount = await ActivityService.deleteOldActivities(parseInt(daysOld));

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deletedCount} old activities`,
      deletedCount
    });
  } catch (error) {
    console.error('Error cleaning up old activities:', error);
    res.status(500).json({
      success: false,
      message: "Server error while cleaning up activities"
    });
  }
};

/**
 * Get available activity types and categories
 * @route GET /api/activities/types
 * @access Private
 */
const getActivityTypes = async (req, res) => {
  try {
    const activityTypes = [
      'login',
      'logout',
      'post_create',
      'post_update',
      'post_delete',
      'comment_create',
      'comment_update',
      'comment_delete',
      'like',
      'unlike',
      'friend_request_send',
      'friend_request_accept',
      'friend_request_decline',
      'friend_remove',
      'profile_update',
      'profile_picture_update',
      'cover_photo_update',
      'password_change',
      'story_create',
      'story_view',
      'notification_read',
      'search',
      'marketplace_item_create',
      'marketplace_item_update',
      'marketplace_item_delete'
    ];

    const categories = [
      'authentication',
      'content',
      'interaction',
      'social',
      'profile',
      'activity',
      'marketplace',
      'other'
    ];

    res.status(200).json({
      success: true,
      message: "Activity types and categories retrieved successfully",
      data: {
        activityTypes,
        categories
      }
    });
  } catch (error) {
    console.error('Error getting activity types:', error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving activity types"
    });
  }
};

/**
 * Export user activity data (for GDPR compliance)
 * @route GET /api/activities/export
 * @access Private
 */
const exportUserActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const { format = 'json' } = req.query;

    // Get all user activities without pagination
    const result = await ActivityService.getUserActivities(userId, { 
      page: 1, 
      limit: 10000 // Large limit to get all activities
    });

    const userData = {
      userId,
      username: req.user.username,
      exportDate: new Date().toISOString(),
      totalActivities: result.activities.length,
      activities: result.activities
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(result.activities);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="activity-history-${userId}.csv"`);
      res.send(csv);
    } else {
      // Default JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="activity-history-${userId}.json"`);
      res.json(userData);
    }
  } catch (error) {
    console.error('Error exporting user activities:', error);
    res.status(500).json({
      success: false,
      message: "Server error while exporting activities"
    });
  }
};

/**
 * Helper function to convert activities to CSV format
 */
function convertToCSV(activities) {
  if (activities.length === 0) return 'No activities found';

  const headers = ['Date', 'Activity Type', 'Description', 'Category', 'IP Address', 'Device Type', 'Browser'];
  const csvRows = [headers.join(',')];

  activities.forEach(activity => {
    const row = [
      new Date(activity.createdAt).toLocaleString(),
      activity.activityType,
      `"${activity.description}"`,
      activity.getCategory(),
      activity.ipAddress || 'Unknown',
      activity.deviceType || 'Unknown',
      activity.browserInfo || 'Unknown'
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

module.exports = {
  getMyActivityHistory,
  getMyActivityStats,
  getAllActivityHistory,
  getUserActivityHistory,
  getUserActivityStats,
  getActivityById,
  cleanupOldActivities,
  getActivityTypes,
  exportUserActivities
};