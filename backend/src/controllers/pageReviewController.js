const PageReviewService = require('../services/pageReviewService');
const PageService = require('../services/pageService');
const UserService = require('../services/userService');
const { uploadImages } = require('../storage/firebaseStorage');

// Valid review types
const VALID_REVIEW_TYPES = ['text', 'image', 'video', 'image_text', 'video_text'];

//@desc     Create a review for a page
const createPageReview = async (req, res) => {
    try {
        const { pageId } = req.params;
        const { rating, reviewType, content, media, mediaType } = req.body;
        const currentUserId = req.user.id;

        console.log('📝 Creating review for page:', pageId);

        // Find the page
        const page = await PageService.findById(pageId);
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        // Only allow reviews for published and approved pages
        if (!page.isPublished || page.approvalStatus !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'This page is not available for reviews'
            });
        }

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Validate review type
        if (!reviewType || !VALID_REVIEW_TYPES.includes(reviewType)) {
            return res.status(400).json({
                success: false,
                message: `Invalid review type. Valid types are: ${VALID_REVIEW_TYPES.join(', ')}`
            });
        }

        // Validate content and media based on review type
        if (reviewType === 'text' && !content) {
            return res.status(400).json({
                success: false,
                message: 'Content is required for text reviews'
            });
        }

        if (['image', 'image_text'].includes(reviewType) && (!media || media.length === 0)) {
            return res.status(400).json({
                success: false,
                message: 'Images are required for this review type'
            });
        }

        if (['video', 'video_text'].includes(reviewType) && (!media || media.length === 0)) {
            return res.status(400).json({
                success: false,
                message: 'Videos are required for this review type'
            });
        }

        if (['image_text', 'video_text'].includes(reviewType) && !content) {
            return res.status(400).json({
                success: false,
                message: 'Content is required for this review type'
            });
        }

        // Validate media limits
        if (media && media.length > 0) {
            if (mediaType === 'image' && media.length > 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum 6 images allowed per review'
                });
            }

            if (mediaType === 'video' && media.length > 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum 2 videos allowed per review'
                });
            }
        }

        // Prepare review data
        const reviewData = {
            pageId,
            userId: currentUserId,
            rating: parseInt(rating),
            reviewType
        };

        // Add optional fields
        if (content) reviewData.content = content.trim();
        if (mediaType) reviewData.mediaType = mediaType;

        // Handle media upload
        if (media && media.length > 0) {
            console.log('📸 Uploading review media...');
            const folderName = mediaType === 'image' ? 'page_review_images' : 'page_review_videos';
            const mediaUrls = await uploadImages(media, folderName);
            reviewData.media = mediaUrls;
            console.log('✅ Review media uploaded successfully');
        } else {
            reviewData.media = [];
        }

        // Create the review
        const newReview = await PageReviewService.createReview(reviewData);

        // Get user info for response
        const user = await UserService.findById(currentUserId);

        const reviewResponse = {
            ...newReview,
            user: user ? {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                profilePicture: user.profilePicture
            } : null
        };

        console.log('✅ Review created successfully');

        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            review: reviewResponse
        });

    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

//@desc     Get all reviews for a page
const getPageReviews = async (req, res) => {
    try {
        const { pageId } = req.params;

        console.log('📖 Getting reviews for page:', pageId);

        // Find the page
        const page = await PageService.findById(pageId);
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        // Get all reviews
        const reviews = await PageReviewService.findByPageId(pageId);

        // Populate user info for each review and reply
        const populatedReviews = await Promise.all(
            reviews.map(async (review) => {
                try {
                    const user = await UserService.findById(review.userId);

                    // Populate reply users
                    const populatedReplies = await Promise.all(
                        (review.replies || []).map(async (reply) => {
                            const replyUser = await UserService.findById(reply.userId);
                            return {
                                ...reply,
                                user: replyUser ? {
                                    id: replyUser.id,
                                    firstName: replyUser.firstName,
                                    lastName: replyUser.lastName,
                                    username: replyUser.username,
                                    profilePicture: replyUser.profilePicture
                                } : null
                            };
                        })
                    );

                    return {
                        ...review,
                        user: user ? {
                            id: user.id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            username: user.username,
                            profilePicture: user.profilePicture
                        } : null,
                        replies: populatedReplies
                    };
                } catch (error) {
                    console.error(`Error populating review ${review.id}:`, error);
                    return {
                        ...review,
                        user: null,
                        replies: []
                    };
                }
            })
        );

        // Get average rating
        const ratingStats = await PageReviewService.getAverageRating(pageId);

        console.log('✅ Found', populatedReviews.length, 'reviews');

        res.status(200).json({
            success: true,
            count: populatedReviews.length,
            averageRating: ratingStats.average,
            totalReviews: ratingStats.count,
            message: 'Reviews retrieved successfully',
            reviews: populatedReviews
        });

    } catch (error) {
        console.error('Error getting reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

//@desc     Get a specific review
const getReviewById = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await PageReviewService.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Populate user info
        const user = await UserService.findById(review.userId);

        // Populate reply users
        const populatedReplies = await Promise.all(
            (review.replies || []).map(async (reply) => {
                const replyUser = await UserService.findById(reply.userId);
                return {
                    ...reply,
                    user: replyUser ? {
                        id: replyUser.id,
                        firstName: replyUser.firstName,
                        lastName: replyUser.lastName,
                        username: replyUser.username,
                        profilePicture: replyUser.profilePicture
                    } : null
                };
            })
        );

        const reviewResponse = {
            ...review,
            user: user ? {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                profilePicture: user.profilePicture
            } : null,
            replies: populatedReplies
        };

        res.status(200).json({
            success: true,
            message: 'Review retrieved successfully',
            review: reviewResponse
        });

    } catch (error) {
        console.error('Error getting review:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

//@desc     Update a review
const updatePageReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, content, media, mediaType } = req.body;
        const currentUserId = req.user.id;

        // Find the review
        const review = await PageReviewService.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user is the review owner
        if (review.userId !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own reviews'
            });
        }

        const updateData = {};

        // Update rating
        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating must be between 1 and 5'
                });
            }
            updateData.rating = parseInt(rating);
        }

        // Update content
        if (content !== undefined) {
            updateData.content = content.trim();
        }

        // Handle media update
        if (media && media.length > 0) {
            // Validate media limits
            if (mediaType === 'image' && media.length > 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum 6 images allowed per review'
                });
            }

            if (mediaType === 'video' && media.length > 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum 2 videos allowed per review'
                });
            }

            console.log('📸 Uploading updated media...');
            const folderName = mediaType === 'image' ? 'page_review_images' : 'page_review_videos';
            const mediaUrls = await uploadImages(media, folderName);
            updateData.media = mediaUrls;
            updateData.mediaType = mediaType;
        }

        // Update the review
        const updatedReview = await PageReviewService.updateById(reviewId, updateData);

        // Get user info
        const user = await UserService.findById(currentUserId);

        const reviewResponse = {
            ...updatedReview,
            user: user ? {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                profilePicture: user.profilePicture
            } : null
        };

        res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            review: reviewResponse
        });

    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

//@desc     Delete a review
const deletePageReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const currentUserId = req.user.id;

        // Find the review
        const review = await PageReviewService.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user is the review owner or page admin
        const page = await PageService.findById(review.pageId);
        const isReviewOwner = review.userId === currentUserId;
        const isPageAdmin = page && page.hasAdminPrivileges(currentUserId);

        if (!isReviewOwner && !isPageAdmin) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this review'
            });
        }

        await PageReviewService.deleteById(reviewId);

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

//@desc     Reply to a review
const replyToReview = async (req, res) => {
    try {
        const { pageId, reviewId } = req.params;
        const { content } = req.body;
        const currentUserId = req.user.id;

        console.log('💬 Replying to review:', reviewId);

        // Validate content
        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Reply content is required'
            });
        }

        // Find the page
        const page = await PageService.findById(pageId);
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        // Find the review
        const review = await PageReviewService.findById(reviewId);
        if (!review || review.pageId !== pageId) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user has permission to reply (Main Admin, Admin, or Moderator with replyToReviews permission)
        const hasPermission = page.hasAdminPrivileges(currentUserId) || 
                            (page.isModerator(currentUserId) && 
                             page.getModeratorPermissions(currentUserId)?.replyToReviews);

        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to reply to reviews'
            });
        }

        // Add the reply
        const reply = await PageReviewService.addReply(reviewId, {
            userId: currentUserId,
            content: content.trim()
        });

        // Get user info for response
        const user = await UserService.findById(currentUserId);

        const replyResponse = {
            ...reply,
            user: user ? {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                profilePicture: user.profilePicture
            } : null
        };

        console.log('✅ Reply added successfully');

        res.status(201).json({
            success: true,
            message: 'Reply added successfully',
            reply: replyResponse
        });

    } catch (error) {
        console.error('Error replying to review:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

//@desc     Update a reply
const updateReviewReply = async (req, res) => {
    try {
        const { pageId, reviewId, replyId } = req.params;
        const { content } = req.body;
        const currentUserId = req.user.id;

        // Validate content
        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Reply content is required'
            });
        }

        // Find the review
        const review = await PageReviewService.findById(reviewId);
        if (!review || review.pageId !== pageId) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Find the reply
        const reply = review.replies.find(r => r.id === replyId);
        if (!reply) {
            return res.status(404).json({
                success: false,
                message: 'Reply not found'
            });
        }

        // Check if user is the reply owner
        if (reply.userId !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own replies'
            });
        }

        // Update the reply
        const updatedReply = await PageReviewService.updateReply(reviewId, replyId, content.trim());

        // Get user info
        const user = await UserService.findById(currentUserId);

        const replyResponse = {
            ...updatedReply,
            user: user ? {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                profilePicture: user.profilePicture
            } : null
        };

        res.status(200).json({
            success: true,
            message: 'Reply updated successfully',
            reply: replyResponse
        });

    } catch (error) {
        console.error('Error updating reply:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

//@desc     Delete a reply
const deleteReviewReply = async (req, res) => {
    try {
        const { pageId, reviewId, replyId } = req.params;
        const currentUserId = req.user.id;

        // Find the page
        const page = await PageService.findById(pageId);
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        // Find the review
        const review = await PageReviewService.findById(reviewId);
        if (!review || review.pageId !== pageId) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Find the reply
        const reply = review.replies.find(r => r.id === replyId);
        if (!reply) {
            return res.status(404).json({
                success: false,
                message: 'Reply not found'
            });
        }

        // Check if user is the reply owner or page admin
        const isReplyOwner = reply.userId === currentUserId;
        const isPageAdmin = page.hasAdminPrivileges(currentUserId);

        if (!isReplyOwner && !isPageAdmin) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this reply'
            });
        }

        await PageReviewService.deleteReply(reviewId, replyId);

        res.status(200).json({
            success: true,
            message: 'Reply deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting reply:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    createPageReview,
    getPageReviews,
    getReviewById,
    updatePageReview,
    deletePageReview,
    replyToReview,
    updateReviewReply,
    deleteReviewReply
};