const express = require('express');
const { authenticateUser, authorizeRoles, checkAccountStatus } = require('../middleware/authMiddleware');
const activityController = require('../controllers/activityController');
const ROLES = require('../enums/roles');

const router = express.Router();

// Routes
// Base URL: /api/activities

/**
 * @route   GET /api/activities/my-history
 * @desc    Get current user's activity history
 * @access  Private
 * @params  page, limit, category, activityType, startDate, endDate, sortOrder
 */
router.get('/my-history',authenticateUser,checkAccountStatus,activityController.getMyActivityHistory);

/**
 * @route   GET /api/activities/my-stats
 * @desc    Get current user's activity statistics
 * @access  Private
 * @params  period (today, week, month, year)
 */
router.get('/my-stats',authenticateUser,checkAccountStatus,activityController.getMyActivityStats);

/**
 * @route   GET /api/activities/export
 * @desc    Export user's activity data (GDPR compliance)
 * @access  Private
 * @params  format (json, csv)
 */
router.get('/export',authenticateUser,checkAccountStatus,activityController.exportUserActivities);

/**
 * @route   GET /api/activities/types
 * @desc    Get available activity types and categories
 * @access  Private
 */
router.get('/types',authenticateUser,checkAccountStatus,activityController.getActivityTypes);

/**
 * @route   GET /api/activities/:activityId
 * @desc    Get specific activity by ID
 * @access  Private (own activity) / Super Admin (any activity)
 */
router.get('/:activityId',authenticateUser,checkAccountStatus,activityController.getActivityById);

// Super Admin only routes

/**
 * @route   GET /api/activities/admin/all-history
 * @desc    Get all users' activity history (Super Admin only)
 * @access  Private - Super Admin only
 * @params  page, limit, userId, category, activityType, startDate, endDate, sortOrder
 */
router.get('/admin/all-history',authenticateUser,checkAccountStatus,authorizeRoles(ROLES.SUPER_ADMIN),activityController.getAllActivityHistory);

/**
 * @route   GET /api/activities/admin/user/:userId
 * @desc    Get specific user's activity history (Super Admin only)
 * @access  Private - Super Admin only
 * @params  page, limit, category, activityType, startDate, endDate, sortOrder
 */
router.get('/admin/user/:userId',authenticateUser,checkAccountStatus,authorizeRoles(ROLES.SUPER_ADMIN),activityController.getUserActivityHistory);

/**
 * @route   GET /api/activities/admin/user/:userId/stats
 * @desc    Get specific user's activity statistics (Super Admin only)
 * @access  Private - Super Admin only
 * @params  period (today, week, month, year)
 */
router.get('/admin/user/:userId/stats',authenticateUser,checkAccountStatus,authorizeRoles(ROLES.SUPER_ADMIN),activityController.getUserActivityStats);

/**
 * @route   DELETE /api/activities/admin/cleanup
 * @desc    Delete old activities (maintenance) (Super Admin only)
 * @access  Private - Super Admin only
 * @body    daysOld (number of days)
 */
router.delete('/admin/cleanup', authenticateUser, checkAccountStatus, authorizeRoles(ROLES.SUPER_ADMIN),activityController.cleanupOldActivities);

module.exports = router;