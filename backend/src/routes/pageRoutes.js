const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const { authenticateUser, authorizeRoles, checkAccountStatus } = require('../middleware/authMiddleware');
const { validatePage, validatePageQuery, validateAdminReview, validatePageBan, validatePageProfile } = require('../middleware/pageValidator');
const { validatePost, validateStory } = require('../middleware/validator'); // Add these validators

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