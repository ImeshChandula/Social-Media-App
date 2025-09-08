const PageService = require('../services/pageService');
const UserService = require('../services/userService');
const PostService = require('../services/postService');
const { uploadImage } = require('../utils/uploadMedia');
const { handleMediaUpload } = require('../utils/handleMediaUpload');
const pageValidators = require('../middleware/pageValidator');
const Story = require('../models/Story');
const { generateWhatsAppURL, generatePageContactMessage } = require('../utils/whatsappHelper');

// Valid page categories
const VALID_PAGE_CATEGORIES = ['education', 'music', 'fashion', 'entertainment'];

// Valid video categories for posts
const VALID_VIDEO_CATEGORIES = ['Music', 'Sports', 'Education', 'Entertainment', 'News'];


// createPage function
const createPage = async (req, res) => {
    try {
        console.log('=== CREATE PAGE REQUEST ===');
        console.log('Request body keys:', Object.keys(req.body));
        console.log('Request body:', {
            ...req.body,
            profilePicture: req.body.profilePicture ? 'Base64 data present (length: ' + req.body.profilePicture.length + ')' : 'MISSING'
        });
        
        const { pageName, description, category, phone, email, address, username, profilePicture } = req.body;
        const ownerId = req.user.id;

        // Validate ALL required fields with detailed logging
        const missingFields = [];
        if (!pageName) missingFields.push('pageName');
        if (!description) missingFields.push('description');
        if (!category) missingFields.push('category');
        if (!phone) missingFields.push('phone');
        if (!email) missingFields.push('email');
        if (!address) missingFields.push('address');
        if (!profilePicture) missingFields.push('profilePicture');

        if (missingFields.length > 0) {
            console.log('Missing required fields:', missingFields);
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}. All fields are required: Page name, description, category, phone, email, address, and profile image`
            });
        }

        // Validate category
        if (!VALID_PAGE_CATEGORIES.includes(category.toLowerCase())) {
            console.log('Invalid category:', category);
            return res.status(400).json({
                success: false,
                message: 'Invalid category. Valid categories are: ' + VALID_PAGE_CATEGORIES.join(', ')
            });
        }

        // Check if username is provided and available
        if (username) {
            const isAvailable = await PageService.isUsernameAvailable(username);
            if (!isAvailable) {
                console.log('Username not available:', username);
                return res.status(400).json({
                    success: false,
                    message: 'Username is already taken'
                });
            }
        }

        // Handle profile picture upload
        let profilePictureUrl = '';
        if (profilePicture) {
            try {
                console.log('Uploading profile picture...');
                profilePictureUrl = await uploadImage(profilePicture);
                console.log('Profile picture uploaded successfully:', profilePictureUrl);
            } catch (error) {
                console.error('Profile picture upload failed:', error);
                return res.status(400).json({
                    success: false,
                    message: 'Failed to upload profile picture: ' + error.message
                });
            }
        }

        // Create page data - page starts as draft and pending approval
        const pageData = {
            pageName: pageName.trim(),
            username: username ? username.toLowerCase().trim() : '',
            description: description.trim(),
            category: category.toLowerCase(),
            owner: ownerId,
            phone: phone.trim(),
            email: email.trim(),
            address: address.trim(),
            profilePicture: profilePictureUrl,
            followers: [],
            posts: [],
            isPublished: false, // Not published until admin approval and user publishes
            approvalStatus: 'pending', // Pending admin approval
            submittedForApproval: true,
            submittedAt: new Date().toISOString()
        };

        console.log('Creating page with data:', {
            ...pageData,
            profilePicture: pageData.profilePicture ? 'URL present' : 'MISSING'
        });

        const newPage = await PageService.createPage(pageData);
        console.log('Page created successfully:', newPage.id);

        res.status(201).json({
            success: true,
            message: 'Page submitted for admin approval successfully',
            page: newPage
        });

    } catch (error) {
        console.error('Error creating page:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
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

// Update the publishPage function to check approval status
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

        // Check if page is approved by admin
        if (page.approvalStatus !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Page must be approved by admin before publishing'
            });
        }

        // Validate that all required fields are filled
        if (!page.pageName || !page.description || !page.category || !page.phone || !page.email || !page.address || !page.profilePicture) {
            return res.status(400).json({
                success: false,
                message: 'Please complete all required fields before publishing'
            });
        }

        const updatedPage = await PageService.updateById(pageId, {
            isPublished: true,
            publishedAt: new Date().toISOString()
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

//@desc     Get page by ID (Enhanced for web view)
const getPageById = async (req, res) => {
    try {
        const pageId = req.params.id;
        const currentUserId = req.user?.id; // Use optional chaining to handle undefined req.user

        console.log('🔍 Getting page by ID:', pageId);
        console.log('👤 Current User ID:', currentUserId);

        const page = await PageService.findById(pageId);
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        console.log('📄 Found page:', page.pageName);
        console.log('🏠 Page owner:', page.owner);

        // Only show published pages to non-owners
        if (!page.isPublished && page.owner !== currentUserId) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        // Check if user is following this page (only if user is authenticated)
        const isFollowing = currentUserId ? page.followers.includes(currentUserId) : false;
        
        //Properly calculate ownership
        const isOwner = currentUserId && page.owner === currentUserId;
        
        console.log('✅ Is Owner Check:', {
            currentUserId,
            pageOwner: page.owner,
            isOwner,
            comparison: currentUserId === page.owner
        });

        // Get page posts
        let posts = [];
        let postsCount = 0;
        try {
            posts = await PostService.findByUserId(pageId); // Assuming posts are linked to page as author
            postsCount = posts.length;
        } catch (error) {
            console.log('Could not fetch page posts:', error);
        }

        // Get owner information
        const owner = await UserService.findById(page.owner);

        const pageResponse = {
            id: page.id,
            pageName: page.pageName,
            username: page.username,
            description: page.description,
            category: page.category,
            profilePicture: page.profilePicture,
            coverPhoto: page.coverPhoto,
            phone: page.phone,
            email: page.email,
            address: page.address,
            isFollowing,
            isOwner, // This is the critical field
            followersCount: page.followersCount || page.followers?.length || 0,
            postsCount: postsCount,
            isPublished: page.isPublished,
            isVerified: page.isVerified || false,
            approvalStatus: page.approvalStatus,
            createdAt: page.createdAt,
            owner: owner ? {
                id: owner.id,
                firstName: owner.firstName,
                lastName: owner.lastName,
                username: owner.username,
                profilePicture: owner.profilePicture
            } : null,
            recentPosts: posts.slice(0, 10) // Return latest 10 posts
        };

        console.log('📤 Sending response with isOwner:', pageResponse.isOwner);

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

//@desc     Update page profile (profile picture, cover photo, description)
const updatePageProfile = async (req, res) => {
    try {
        const pageId = req.params.id;
        const currentUserId = req.user.id;
        const { description, profilePicture, coverPhoto } = req.body;

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
                message: 'You are not authorized to update this page profile'
            });
        }

        const updateData = {};

        // Update description
        if (description !== undefined) {
            if (!description.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Description cannot be empty'
                });
            }
            updateData.description = description.trim();
        }

        // Handle profile picture upload
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

        // Handle cover photo upload
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

        const updatedPage = await PageService.updateById(pageId, updateData);

        res.status(200).json({
            success: true,
            message: 'Page profile updated successfully',
            page: updatedPage
        });

    } catch (error) {
        console.error('Error updating page profile:', error);
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

// Create post for page
const createPagePost = async (req, res) => {
    try {
        const { pageId } = req.params;
        const { content, media, mediaType, tags, privacy, location, category } = req.body;
        const currentUserId = req.user.id;

        console.log('📄 Creating post for page:', pageId);
        console.log('👤 Current user:', currentUserId);

        // Find the page and verify ownership
        const page = await PageService.findById(pageId);
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        // Check if user is the owner of the page
        if (page.owner !== currentUserId) {
            console.log('❌ Ownership check failed:', {
                pageOwner: page.owner,
                currentUser: currentUserId
            });
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to create posts for this page'
            });
        }

        // Check if page is published and approved
        if (!page.isPublished || page.approvalStatus !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Page must be published and approved before creating posts'
            });
        }

        // Validate required content
        if (!content && !media) {
            return res.status(400).json({ 
                success: false,
                message: "Either content or media is required." 
            });
        }

        if (!mediaType) {
            return res.status(400).json({ 
                success: false,
                message: "Media type is required." 
            });
        }

        // Validate category for video posts
        if (mediaType === 'video') {
            if (!category) {
                return res.status(400).json({ 
                    success: false,
                    error: "Category is required for video posts.",
                    validCategories: VALID_VIDEO_CATEGORIES
                });
            }
            
            if (!VALID_VIDEO_CATEGORIES.includes(category)) {
                return res.status(400).json({ 
                    success: false,
                    error: "Invalid category for video post.",
                    receivedCategory: category,
                    validCategories: VALID_VIDEO_CATEGORIES,
                    message: `"${category}" is not allowed. Please select from: ${VALID_VIDEO_CATEGORIES.join(', ')}`
                });
            }
        }
        
        const postData = {
            tags,
            mediaType,
            privacy: privacy || 'public', // Pages typically use public posts
            location,
            authorType: 'page' // Mark as page post
        };

        // Add category only for video posts
        if (mediaType === 'video' && category) {
            postData.category = category;
        }

        if (content !== undefined) postData.content = content;

        console.log('🚀 Creating post with data:', postData);

        const newPost = await PostService.create(postData);
        if (!newPost) {
            return res.status(400).json({ 
                success: false, 
                message: "Failed to create post"
            });
        }

        const updateData = { author: pageId }; // Use pageId as author
        
        // Handle media upload if provided
        if (media) {
            console.log('📸 Processing media upload...');
            const result = await handleMediaUpload(media, mediaType);
            if (!result.success) {
                console.log('❌ Media upload failed:', result);
                return res.status(result.code).json({
                    success: false,
                    error: result.error,
                    message: result.message,
                    ...(result.suggestion && { suggestion: result.suggestion }),
                    ...(result.maxSize && { maxSize: result.maxSize })
                });
            }
            updateData.media = result.imageUrl;
            console.log('✅ Media uploaded successfully:', result.imageUrl);
        }
        
        const populatedPost = await PostService.updateById(newPost.id, updateData);
        if (!populatedPost) {
            return res.status(400).json({ 
                success: false, 
                message: "Failed to update post with media"
            });
        }

        console.log('✅ Page post created successfully:', populatedPost.id);

        return res.status(201).json({ 
            success: true,
            message: "Page post created successfully", 
            post: populatedPost 
        });
        
    } catch (error) {
        console.error('Page post creation error:', error.message);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};


// Create story for page 
const createPageStory = async (req, res) => {
    try {
        const { pageId } = req.params;
        const { content, media, type, caption, privacy } = req.body;
        const currentUserId = req.user.id;

        console.log('📖 Creating story for page:', pageId);

        // Find the page and verify ownership
        const page = await PageService.findById(pageId);
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        // Check if user is the owner of the page
        if (page.owner !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to create stories for this page'
            });
        }

        // Check if page is published and approved
        if (!page.isPublished || page.approvalStatus !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Page must be published and approved before creating stories'
            });
        }

        if (!content && !media) {
            return res.status(400).json({ 
                success: false,
                message: 'Content or media is required' 
            });
        }

        // Create story object with timestamp
        const storyData = {
            userId: pageId, // Use pageId as userId for stories
            authorType: 'page', // Mark as page story
            content,
            type,
            caption,
            privacy: privacy || 'public', // Pages typically use public stories
            isActive: true,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            viewers: [],
            viewCount: 0
        };

        // Upload media if provided - FIXED: Use handleMediaUpload consistently
        if (media) {
            console.log('📸 Processing story media upload...');
            const result = await handleMediaUpload(media, type || 'image');
            if (!result.success) {
                console.log('❌ Story media upload failed:', result);
                return res.status(result.code).json({
                    success: false,
                    error: result.error,
                    message: result.message,
                    ...(result.suggestion && { suggestion: result.suggestion }),
                    ...(result.maxSize && { maxSize: result.maxSize })
                });
            }
            storyData.media = result.imageUrl;
            console.log('✅ Story media uploaded successfully');
        }

        
        const newStory = await Story.create(storyData);
        

        if (!newStory) {
            return res.status(500).json({ 
                success: false,
                message: 'Failed to create story' 
            });
        }

        // Add page data to story response
        const populatedStory = {
            ...newStory,
            user: {
                id: page.id,
                firstName: '', // Pages don't have first/last names
                lastName: '',
                username: page.username || page.pageName,
                profilePicture: page.profilePicture,
                pageName: page.pageName, // Add page-specific data
                isPage: true
            },
        };

        console.log('✅ Page story created successfully');

        res.status(201).json({
            success: true,
            message: 'Page story created successfully',
            story: populatedStory
        });

    } catch (error) {
        console.error('Page story creation error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};


// Get page posts
const getPagePosts = async (req, res) => {
    try {
        const { pageId } = req.params;
        const currentUserId = req.user?.id;

        const page = await PageService.findById(pageId);
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        // Only show published pages to non-owners
        if (!page.isPublished && page.owner !== currentUserId) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        // Get page posts
        const posts = await PostService.findByPageId ? 
            await PostService.findByPageId(pageId) : 
            await PostService.findByUserId(pageId); // Fallback to existing method

        // Populate with page data
        const populatedPosts = posts.map(post => ({
            ...post,
            author: {
                id: page.id,
                username: page.username || page.pageName,
                firstName: '',
                lastName: '',
                profilePicture: page.profilePicture,
                pageName: page.pageName,
                isPage: true
            }
        }));

        res.status(200).json({
            success: true,
            count: populatedPosts.length,
            message: 'Page posts retrieved successfully',
            posts: populatedPosts
        });

    } catch (error) {
        console.error('Get page posts error:', error.message);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};


// Enhanced Get page stories function with better error handling
const getPageStories = async (req, res) => {
    try {
        const { pageId } = req.params;
        const currentUserId = req.user?.id;

        console.log('📖 Getting page stories for pageId:', pageId);

        const page = await PageService.findById(pageId);
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        // Only show published pages to non-owners
        if (!page.isPublished && page.owner !== currentUserId) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        // Get page stories using the Story model
        const allStories = await Story.findByUserIdSimple(pageId);

        if (!allStories || allStories.length === 0) {
            return res.status(200).json({ 
                success: true,
                message: 'No stories found for this page', 
                stories: [] 
            });
        }

        // Filter active and non-expired stories
        const now = new Date();
        const activeStories = allStories.filter(story => {
            const expiresAt = new Date(story.expiresAt);
            return story.isActive && expiresAt > now && story.authorType === 'page';
        });

        // Sort by creation date (newest first)
        activeStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Populate with page data
        const populatedStories = activeStories.map(story => ({
            ...story,
            _id: story.id || story._id,
            viewCount: story.viewCount || 0,
            user: {
                id: page.id,
                firstName: '',
                lastName: '',
                username: page.username || page.pageName,
                profilePicture: page.profilePicture,
                pageName: page.pageName,
                isPage: true,
                type: 'page'
            },
            authorType: 'page'
        }));

        console.log('✅ Found', populatedStories.length, 'active page stories');

        return res.status(200).json({
            success: true,
            count: populatedStories.length,
            message: 'Page stories retrieved successfully',
            stories: populatedStories
        });

    } catch (error) {
        console.error('Get page stories error:', error.message);
        return res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

//@desc     Get WhatsApp contact URL for page
const getPageWhatsAppContact = async (req, res) => {
    try {
        const pageId = req.params.id;
        
        const page = await PageService.findById(pageId);
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        // Only allow contact for published and approved pages
        if (!page.isPublished || page.approvalStatus !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Page is not available for contact'
            });
        }

        // Check if page has a phone number
        if (!page.phone) {
            return res.status(400).json({
                success: false,
                message: 'Contact information not available for this page'
            });
        }

        // Generate WhatsApp URL with default message
        const defaultMessage = generatePageContactMessage(page.pageName);
        const whatsappURL = generateWhatsAppURL(page.phone, defaultMessage);

        if (!whatsappURL) {
            return res.status(500).json({
                success: false,
                message: 'Failed to generate contact link'
            });
        }

        res.status(200).json({
            success: true,
            message: 'WhatsApp contact link generated successfully',
            data: {
                whatsappURL,
                pageName: page.pageName,
                phone: page.phone,
                message: defaultMessage
            }
        });

    } catch (error) {
        console.error('Error generating WhatsApp contact:', error);
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
    updatePageProfile,
    deletePage,
    getPageCategories,
    getPendingPages,
    approvePageContactDetails,
    rejectPageContactDetails,
    getAllPagesForAdmin,
    togglePageBan,
    getPageForAdmin,
    createPagePost,
    createPageStory,
    getPagePosts,
    getPageStories,
    getPageWhatsAppContact
};