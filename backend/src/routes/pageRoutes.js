const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const pageReviewController = require('../controllers/pageReviewController');
const { authenticateUser, authorizeRoles, checkAccountStatus } = require('../middleware/authMiddleware');
const { validatePage, validatePageQuery, validateAdminReview, validatePageBan, validatePageProfile, validateAddAdmin, validateAddModerator, validateUpdateModeratorPermissions } = require('../middleware/pageValidator');
const { validatePost, validateStory } = require('../middleware/validator'); // Add these validators
const { validateCreateReview, validateUpdateReview, validateReply } = require('../middleware/pageReviewValidator');

// Page management routes (existing)

// @route :   POST /api/pages
// @desc :   Create a new page
// @access:  Private (only authenticated users can create pages)
router.post('/', authenticateUser, checkAccountStatus, validatePage, pageController.createPage);

// @route  PUT /api/pages/:id
// @desc   Update an existing page  
// @access Private (only authenticated users can update their own pages)
router.put('/:id', authenticateUser, checkAccountStatus, validatePage, pageController.updatePage);

// @route  PUT /api/pages/:id/publish
// @desc   Publish a page
// @access Private (only authenticated users can publish their own pages)
router.put('/:id/publish', authenticateUser, checkAccountStatus, pageController.publishPage);

// @route  PUT /api/pages/:id/profile
// @desc   Update page profile (profile picture, cover photo, description only)
// @access Private (only authenticated users can update their own page profile)
router.put('/:id/profile', authenticateUser, checkAccountStatus, validatePageProfile, pageController.updatePageProfile);

// @route  GET /api/pages/my-pages
// @desc   Get all pages created by the current user
// @access Private (only authenticated users can view their own pages)
router.get('/my-pages', authenticateUser, checkAccountStatus, pageController.getCurrentUserPages);

// @route  GET /api/pages/categories
// @desc   Get all page categories
// @access Public (anyone can view page categories)
router.get('/categories', pageController.getPageCategories);


// ============ ROLE MANAGEMENT ROUTES ============

// @route  GET /api/pages/:pageId/roles
// @desc   Get all roles (admins and moderators) for a page
// @access Private (only admins and moderators can view)
router.get('/:pageId/roles', authenticateUser, checkAccountStatus, pageController.getPageRoles);

// @route  POST /api/pages/:pageId/admins
// @desc   Add an admin to a page
// @access Private (only Main Admin and Admins can add admins)
router.post('/:pageId/admins', authenticateUser, checkAccountStatus, validateAddAdmin, pageController.addAdmin);

// @route  DELETE /api/pages/:pageId/admins/:userId
// @desc   Remove an admin from a page
// @access Private (only Main Admin can remove admins)
router.delete('/:pageId/admins/:userId', authenticateUser, checkAccountStatus, pageController.removeAdmin);

// @route  POST /api/pages/:pageId/moderators
// @desc   Add a moderator to a page with specific permissions
// @access Private (only Main Admin and Admins can add moderators)
router.post('/:pageId/moderators', authenticateUser, checkAccountStatus, validateAddModerator, pageController.addModerator);

// @route  DELETE /api/pages/:pageId/moderators/:userId
// @desc   Remove a moderator from a page
// @access Private (only Main Admin and Admins can remove moderators)
router.delete('/:pageId/moderators/:userId', authenticateUser, checkAccountStatus, pageController.removeModerator);

// @route  PUT /api/pages/:pageId/moderators/:userId/permissions
// @desc   Update a moderator's permissions
// @access Private (only Main Admin and Admins can update permissions)
router.put('/:pageId/moderators/:userId/permissions', authenticateUser, checkAccountStatus, validateUpdateModeratorPermissions, pageController.updateModeratorPermissions);


// ============ PAGE REVIEW ROUTES ============

// @route  POST /api/pages/:pageId/reviews
// @desc   Create a review for a page
// @access Private (authenticated users can review published pages)
router.post('/:pageId/reviews', authenticateUser, checkAccountStatus, validateCreateReview, pageReviewController.createPageReview);

// @route  GET /api/pages/:pageId/reviews
// @desc   Get all reviews for a page
// @access Public (anyone can view reviews)
router.get('/:pageId/reviews', pageReviewController.getPageReviews);

// @route  GET /api/pages/:pageId/reviews/:reviewId
// @desc   Get a specific review
// @access Public (anyone can view a specific review)
router.get('/:pageId/reviews/:reviewId', pageReviewController.getReviewById);

// @route  PUT /api/pages/:pageId/reviews/:reviewId
// @desc   Update a review
// @access Private (only review owner can update)
router.put('/:pageId/reviews/:reviewId', authenticateUser, checkAccountStatus, validateUpdateReview, pageReviewController.updatePageReview);

// @route  DELETE /api/pages/:pageId/reviews/:reviewId
// @desc   Delete a review
// @access Private (review owner or page admins can delete)
router.delete('/:pageId/reviews/:reviewId', authenticateUser, checkAccountStatus, pageReviewController.deletePageReview);

// @route  POST /api/pages/:pageId/reviews/:reviewId/reply
// @desc   Reply to a review
// @access Private (page admins/moderators with permission can reply)
router.post('/:pageId/reviews/:reviewId/reply', authenticateUser, checkAccountStatus, validateReply, pageReviewController.replyToReview);

// @route  PUT /api/pages/:pageId/reviews/:reviewId/reply/:replyId
// @desc   Update a reply
// @access Private (only reply owner can update)
router.put('/:pageId/reviews/:reviewId/reply/:replyId', authenticateUser, checkAccountStatus, validateReply, pageReviewController.updateReviewReply);

// @route  DELETE /api/pages/:pageId/reviews/:reviewId/reply/:replyId
// @desc   Delete a reply
// @access Private (reply owner or page admins can delete)
router.delete('/:pageId/reviews/:reviewId/reply/:replyId', authenticateUser, checkAccountStatus, pageReviewController.deleteReviewReply);


// NEW PAGE CONTENT ROUTES

// @route  POST /api/pages/:pageId/posts
// @desc   Create a post for a specific page
// @access Private (only page owners can create posts for their pages)
router.post('/:pageId/posts', authenticateUser, checkAccountStatus, validatePost, pageController.createPagePost);

// @route  GET /api/pages/:pageId/posts
// @desc   Get all posts for a specific page
// @access Public (anyone can view posts from published pages)
router.get('/:pageId/posts', pageController.getPagePosts);

// @route  POST /api/pages/:pageId/stories
// @desc   Create a story for a specific page
// @access Private (only page owners can create stories for their pages)
router.post('/:pageId/stories', authenticateUser, checkAccountStatus, validateStory, pageController.createPageStory);

// @route  GET /api/pages/:pageId/stories
// @desc   Get all active stories for a specific page
// @access Public (anyone can view stories from published pages)
router.get('/:pageId/stories', pageController.getPageStories);

// Admin routes (existing)

// @route  GET /api/pages/admin/all
// @desc   Get all pages for admin management with owner details
// @access Private (only super admins can view all pages for management)
router.get('/admin/all', authenticateUser, checkAccountStatus, authorizeRoles("super_admin"), pageController.getAllPagesForAdmin);

// @route  GET /api/pages/admin/pending
// @desc   Get all pending pages for admin review
// @access Private (only admins can view pending pages)
router.get('/admin/pending', authenticateUser, checkAccountStatus, authorizeRoles("super_admin"), pageController.getPendingPages);

// @route  GET /api/pages/admin/:id
// @desc   Get detailed page information for admin management
// @access Private (only super admins can view page details for management)
router.get('/admin/:id', authenticateUser, checkAccountStatus, authorizeRoles("super_admin"), pageController.getPageForAdmin);

// @route  PUT /api/pages/admin/:id/approve
// @desc   Approve a page contact details
// @access Private (only admins can approve pages)
router.put('/admin/:id/approve', authenticateUser, checkAccountStatus, authorizeRoles("super_admin"), validateAdminReview, pageController.approvePageContactDetails);

// @route  PUT /api/pages/admin/:id/reject
// @desc   Reject a page contact details
// @access Private (only admins can reject pages)
router.put('/admin/:id/reject', authenticateUser, checkAccountStatus, authorizeRoles("super_admin"), validateAdminReview, pageController.rejectPageContactDetails);

// @route  PUT /api/pages/admin/:id/ban
// @desc   Ban or unban a page
// @access Private (only super admins can ban/unban pages)
router.put('/admin/:id/ban', authenticateUser, checkAccountStatus, authorizeRoles("super_admin"), validatePageBan, pageController.togglePageBan);

// @route  DELETE /api/pages/admin/:id
// @desc   Delete a page by admin
// @access Private (only super admins can delete any page)
router.delete('/admin/:id', authenticateUser, checkAccountStatus, authorizeRoles("super_admin"), pageController.deletePage);

// General routes - These come after admin routes (existing)

// @route  GET /api/pages
// @desc   Get all pages with optional filters
// @access Public (anyone can view pages)
router.get('/', validatePageQuery, pageController.getAllPages);

// @route  GET /api/pages/:id
// @desc   Get a specific page by ID
// @access Public (anyone can view a page)
router.get('/:id', pageController.getPageById);

// @route  DELETE /api/pages/:id
// @desc   Delete a page by ID
// @access Private (only the owner can delete their own page)
router.delete('/:id', authenticateUser, checkAccountStatus, pageController.deletePage);

// Follow/Unfollow routes (existing)

// @route  POST /api/pages/:id/follow
// @desc   Follow a page
// @access Private (only authenticated users can follow pages)
router.post('/:id/follow', authenticateUser, checkAccountStatus, pageController.followPage);

// @route  POST /api/pages/:id/unfollow
// @desc   Unfollow a page
// @access Private (only authenticated users can unfollow pages)
router.post('/:id/unfollow', authenticateUser, checkAccountStatus, pageController.unfollowPage);

// @route  GET /api/pages/:id/whatsapp-contact
// @desc   Get WhatsApp contact URL for a specific page
// @access Public (anyone can view the WhatsApp contact URL of a published page)
router.get('/:id/whatsapp-contact', pageController.getPageWhatsAppContact);

module.exports = router;