const PageService = require('../services/pageService');
const UserService = require('../services/userService');
const PostService = require('../services/postService');
const { uploadImage } = require('../utils/uploadMedia');
const pageValidators = require('../middleware/pageValidator');

// Valid page categories
const VALID_PAGE_CATEGORIES = ['education', 'music', 'fashion', 'entertainment'];

//@desc     Create a new page
const createPage = async (req, res) => {
    try {
        const { pageName, description, category, phone, email, address, username } = req.body;
        const ownerId = req.user.id;

        // Validate required fields
        if (!pageName || !description || !category) {
            return res.status(400).json({
                success: false,
                message: 'Page name, description, and category are required'
            });
        }

        // Validate category
        if (!VALID_PAGE_CATEGORIES.includes(category.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category. Valid categories are: ' + VALID_PAGE_CATEGORIES.join(', ')
            });
        }

        // Check if username is provided and available
        if (username) {
            const isAvailable = await PageService.isUsernameAvailable(username);
            if (!isAvailable) {
                return res.status(400).json({
                    success: false,
                    message: 'Username is already taken'
                });
            }
        }

        // Create page data
        const pageData = {
            pageName: pageName.trim(),
            username: username ? username.toLowerCase().trim() : '',
            description: description.trim(),
            category: category.toLowerCase(),
            owner: ownerId,
            phone: phone || '',
            email: email || '',
            address: address || '',
            followers: [],
            posts: [],
            isPublished: false, // Will be published after complete setup
            approvalStatus: 'pending'
        };

        const newPage = await PageService.createPage(pageData);

        res.status(201).json({
            success: true,
            message: 'Page created successfully',
            page: newPage
        });

    } catch (error) {
        console.error('Error creating page:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

//@desc     Update page details
const updatePage = async (req, res) => {
    try {
        const pageId = req.params.id;
        const currentUserId = req.user.id;
        const {
            pageName,
            username,
            description,
            category,
            phone,
            email,
            address,
            profilePicture,
            coverPhoto
        } = req.body;

        // Find the page
        const page = await PageService.findById(pageId);
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        // Check if user is the owner
        if (page.owner !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this page'
            });
        }

        const updateData = {};

        // Basic info updates (no approval needed)
        if (pageName !== undefined) updateData.pageName = pageName.trim();
        if (description !== undefined) updateData.description = description.trim();
        if (category !== undefined) {
            if (!VALID_PAGE_CATEGORIES.includes(category.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category'
                });
            }
            updateData.category = category.toLowerCase();
        }

        // Username update
        if (username !== undefined) {
            const isAvailable = await PageService.isUsernameAvailable(username, pageId);
            if (!isAvailable) {
                return res.status(400).json({
                    success: false,
                    message: 'Username is already taken'
                });
            }
            updateData.username = username.toLowerCase().trim();
        }

        // Contact details updates (require approval)
        const contactUpdates = {};
        let needsApproval = false;

        if (phone !== undefined && phone !== page.phone) {
            contactUpdates.phone = phone;
            needsApproval = true;
        }
        if (email !== undefined && email !== page.email) {
            contactUpdates.email = email;
            needsApproval = true;
        }
        if (address !== undefined && address !== page.address) {
            contactUpdates.address = address;
            needsApproval = true;
        }

        // Handle media uploads
        if (profilePicture) {
            try {
                const imageUrl = await uploadImage(profilePicture);
                updateData.profilePicture = imageUrl;
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to upload profile picture'
                });
            }
        }

        if (coverPhoto) {
            try {
                const imageUrl = await uploadImage(coverPhoto);
                updateData.coverPhoto = imageUrl;
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to upload cover photo'
                });
            }
        }

        // If contact details are being updated, store them separately for approval
        if (needsApproval) {
            updateData.pendingContactUpdates = contactUpdates;
            updateData.approvalStatus = 'pending';
        }

        const updatedPage = await PageService.updateById(pageId, updateData);

        res.status(200).json({
            success: true,
            message: needsApproval 
                ? 'Page updated successfully. Contact details changes are pending admin approval.'
                : 'Page updated successfully',
            page: updatedPage,
            needsApproval
        });

    } catch (error) {
        console.error('Error updating page:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

//@desc     Complete page setup and publish
const publishPage = async (req, res) => {
    try {
        const pageId = req.params.id;
        const currentUserId = req.user.id;

        const page = await PageService.findById(pageId);
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        if (page.owner !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to publish this page'
            });
        }

        // Validate that all required fields are filled
        if (!page.pageName || !page.description || !page.category) {
            return res.status(400).json({
                success: false,
                message: 'Please complete all required fields before publishing'
            });
        }

        const updatedPage = await PageService.updateById(pageId, {
            isPublished: true
        });

        res.status(200).json({
            success: true,
            message: 'Page published successfully',
            page: updatedPage
        });

    } catch (error) {
        console.error('Error publishing page:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

//@desc     Get page by ID
const getPageById = async (req, res) => {
    try {
        const pageId = req.params.id;
        const currentUserId = req.user.id;

        const page = await PageService.findById(pageId);
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        // Check if user is following this page
        const isFollowing = page.followers.includes(currentUserId);
        const isOwner = page.owner === currentUserId;

        // Get page posts
        const posts = await PostService.findByUserId(pageId); // Assuming posts are linked to page as author

        // Get owner information
        const owner = await UserService.findById(page.owner);

        const pageResponse = {
            ...page,
            isFollowing,
            isOwner,
            followersCount: page.followersCount,
            postsCount: posts.length,
            owner: owner ? {
                id: owner.id,
                firstName: owner.firstName,
                lastName: owner.lastName,
                username: owner.username,
                profilePicture: owner.profilePicture
            } : null,
            posts: posts.slice(0, 10) // Return latest 10 posts
        };

        res.status(200).json({
            success: true,
            message: 'Page retrieved successfully',
            page: pageResponse
        });

    } catch (error) {
        console.error('Error getting page:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

//@desc     Get current user's pages
const getCurrentUserPages = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const pages = await PageService.findByOwner(userId);

        res.status(200).json({
            success: true,
            count: pages.length,
            message: 'User pages retrieved successfully',
            pages
        });

    } catch (error) {
        console.error('Error getting user pages:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

//@desc     Get all pages with filtering
const getAllPages = async (req, res) => {
    try {
        const { category, search, limit = 20, page = 1 } = req.query;

        let pages;

        if (search) {
            pages = await PageService.searchPages(search, parseInt(limit));
        } else {
            const filters = {};
            if (category && VALID_PAGE_CATEGORIES.includes(category.toLowerCase())) {
                filters.category = category.toLowerCase();
            }
            pages = await PageService.findAll(filters);
        }

        // Pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedPages = pages.slice(startIndex, endIndex);

        res.status(200).json({
            success: true,
            count: paginatedPages.length,
            total: pages.length,
            currentPage: parseInt(page),
            totalPages: Math.ceil(pages.length / parseInt(limit)),
            message: 'Pages retrieved successfully',
            pages: paginatedPages
        });

    } catch (error) {
        console.error('Error getting all pages:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

//@desc     Follow a page
const followPage = async (req, res) => {
    try {
        const pageId = req.params.id;
        const userId = req.user.id;

        const page = await PageService.findById(pageId);
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        if (page.owner === userId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot follow your own page'
            });
        }

        if (page.followers.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: 'You are already following this page'
            });
        }

        const updatedPage = await PageService.addFollower(pageId, userId);

        res.status(200).json({
            success: true,
            message: 'Page followed successfully',
            followersCount: updatedPage.followersCount,
            isFollowing: true
        });

    } catch (error) {
        console.error('Error following page:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

//@desc     Unfollow a page
const unfollowPage = async (req, res) => {
    try {
        const pageId = req.params.id;
        const userId = req.user.id;

        const page = await PageService.findById(pageId);
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        if (!page.followers.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: 'You are not following this page'
            });
        }

        const updatedPage = await PageService.removeFollower(pageId, userId);

        res.status(200).json({
            success: true,
            message: 'Page unfollowed successfully',
            followersCount: updatedPage.followersCount,
            isFollowing: false
        });

    } catch (error) {
        console.error('Error unfollowing page:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

//@desc     Delete page
const deletePage = async (req, res) => {
    try {
        const pageId = req.params.id;
        const currentUserId = req.user.id;

        const page = await PageService.findById(pageId);
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        // Only owner or super admin can delete
        if (page.owner !== currentUserId && req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this page'
            });
        }

        await PageService.deleteById(pageId);

        res.status(200).json({
            success: true,
            message: 'Page deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting page:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

//@desc     Get page categories
const getPageCategories = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            categories: VALID_PAGE_CATEGORIES,
            message: 'Page categories retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting page categories:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Admin functions

//@desc     Get pages pending approval (Admin only)
const getPendingPages = async (req, res) => {
    try {
        if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const pendingPages = await PageService.getPendingApproval();

        // Get owner information for each page
        const populatedPages = await Promise.all(
            pendingPages.map(async (page) => {
                const owner = await UserService.findById(page.owner);
                return {
                    ...page,
                    owner: owner ? {
                        id: owner.id,
                        firstName: owner.firstName,
                        lastName: owner.lastName,
                        username: owner.username,
                        email: owner.email
                    } : null
                };
            })
        );

        res.status(200).json({
            success: true,
            count: populatedPages.length,
            message: 'Pending pages retrieved successfully',
            pages: populatedPages
        });

    } catch (error) {
        console.error('Error getting pending pages:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

//@desc     Approve page contact details (Admin only)
const approvePageContactDetails = async (req, res) => {
    try {
        const pageId = req.params.id;
        const { reviewNote } = req.body;

        if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const page = await PageService.findById(pageId);
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        const updateData = {
            approvalStatus: 'approved',
            reviewNote: reviewNote || '',
            reviewedBy: req.user.id,
            reviewedAt: new Date().toISOString()
        };

        // Apply pending contact updates if they exist
        if (page.pendingContactUpdates) {
            Object.assign(updateData, page.pendingContactUpdates);
            updateData.pendingContactUpdates = null;
        }

        const updatedPage = await PageService.updateById(pageId, updateData);

        res.status(200).json({
            success: true,
            message: 'Page contact details approved successfully',
            page: updatedPage
        });

    } catch (error) {
        console.error('Error approving page:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

//@desc     Reject page contact details (Admin only)
const rejectPageContactDetails = async (req, res) => {
    try {
        const pageId = req.params.id;
        const { reviewNote } = req.body;

        if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const page = await PageService.findById(pageId);
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        const updateData = {
            approvalStatus: 'rejected',
            reviewNote: reviewNote || '',
            reviewedBy: req.user.id,
            reviewedAt: new Date().toISOString(),
            pendingContactUpdates: null // Clear pending updates
        };

        const updatedPage = await PageService.updateById(pageId, updateData);

        res.status(200).json({
            success: true,
            message: 'Page contact details rejected',
            page: updatedPage
        });

    } catch (error) {
        console.error('Error rejecting page:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};


//@desc     Get all pages for admin management (Super Admin only)
const getAllPagesForAdmin = async (req, res) => {
    try {
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Super admin privileges required.'
            });
        }

        // Get all pages without filtering
        const pages = await PageService.findAllPages();

        // Get owner information for each page
        const populatedPages = await Promise.all(
            pages.map(async (page) => {
                try {
                    const owner = await UserService.findById(page.owner);
                    return {
                        id: page.id,
                        pageName: page.pageName,
                        username: page.username,
                        category: page.category,
                        followersCount: page.followersCount,
                        profilePicture: page.profilePicture,
                        isPublished: page.isPublished,
                        approvalStatus: page.approvalStatus,
                        isBanned: page.isBanned || false,
                        createdAt: page.createdAt,
                        updatedAt: page.updatedAt,
                        owner: owner ? {
                            id: owner.id,
                            firstName: owner.firstName,
                            lastName: owner.lastName,
                            username: owner.username,
                            email: owner.email,
                            phone: owner.phone
                        } : null
                    };
                } catch (error) {
                    console.error(`Error getting owner info for page ${page.id}:`, error);
                    return {
                        id: page.id,
                        pageName: page.pageName,
                        username: page.username,
                        category: page.category,
                        followersCount: page.followersCount,
                        profilePicture: page.profilePicture,
                        isPublished: page.isPublished,
                        approvalStatus: page.approvalStatus,
                        isBanned: page.isBanned || false,
                        createdAt: page.createdAt,
                        updatedAt: page.updatedAt,
                        owner: null
                    };
                }
            })
        );

        // Sort by creation date (newest first)
        populatedPages.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        res.status(200).json({
            success: true,
            count: populatedPages.length,
            message: 'Pages retrieved successfully for admin management',
            pages: populatedPages
        });

    } catch (error) {
        console.error('Error getting pages for admin:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

//@desc     Ban/Unban a page (Super Admin only)
const togglePageBan = async (req, res) => {
    try {
        const pageId = req.params.id;
        const { banReason } = req.body;

        if (req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Super admin privileges required.'
            });
        }

        const page = await PageService.findById(pageId);
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        const currentBanStatus = page.isBanned || false;
        const updateData = {
            isBanned: !currentBanStatus,
            bannedBy: !currentBanStatus ? req.user.id : null,
            bannedAt: !currentBanStatus ? new Date().toISOString() : null,
            banReason: !currentBanStatus ? (banReason || 'No reason provided') : null,
            unbannedBy: currentBanStatus ? req.user.id : null,
            unbannedAt: currentBanStatus ? new Date().toISOString() : null
        };

        const updatedPage = await PageService.updateById(pageId, updateData);

        res.status(200).json({
            success: true,
            message: `Page ${!currentBanStatus ? 'banned' : 'unbanned'} successfully`,
            page: {
                id: updatedPage.id,
                pageName: updatedPage.pageName,
                isBanned: updatedPage.isBanned,
                banReason: updatedPage.banReason
            }
        });

    } catch (error) {
        console.error('Error toggling page ban:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

//@desc     Get page details for admin (Super Admin only)
const getPageForAdmin = async (req, res) => {
    try {
        const pageId = req.params.id;

        if (req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Super admin privileges required.'
            });
        }

        const page = await PageService.findById(pageId);
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        // Get owner information
        const owner = await UserService.findById(page.owner);

        // Get posts count (if you want to include this)
        let postsCount = 0;
        try {
            const posts = await PostService.findByUserId(pageId);
            postsCount = posts.length;
        } catch (error) {
            console.log('Could not get posts count:', error);
        }

        const pageDetails = {
            id: page.id,
            pageName: page.pageName,
            username: page.username,
            description: page.description,
            category: page.category,
            phone: page.phone,
            email: page.email,
            address: page.address,
            profilePicture: page.profilePicture,
            coverPhoto: page.coverPhoto,
            followersCount: page.followersCount,
            postsCount: postsCount,
            isPublished: page.isPublished,
            isVerified: page.isVerified,
            approvalStatus: page.approvalStatus,
            isBanned: page.isBanned || false,
            banReason: page.banReason || null,
            bannedAt: page.bannedAt || null,
            bannedBy: page.bannedBy || null,
            createdAt: page.createdAt,
            updatedAt: page.updatedAt,
            owner: owner ? {
                id: owner.id,
                firstName: owner.firstName,
                lastName: owner.lastName,
                username: owner.username,
                email: owner.email,
                phone: owner.phone,
                profilePicture: owner.profilePicture
            } : null
        };

        res.status(200).json({
            success: true,
            message: 'Page details retrieved successfully',
            page: pageDetails
        });

    } catch (error) {
        console.error('Error getting page for admin:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    createPage,
    updatePage,
    publishPage,
    getPageById,
    getCurrentUserPages,
    getAllPages,
    followPage,
    unfollowPage,
    deletePage,
    getPageCategories,
    getPendingPages,
    approvePageContactDetails,
    rejectPageContactDetails,
    getAllPagesForAdmin,
    togglePageBan,
    getPageForAdmin
};