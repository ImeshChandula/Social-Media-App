const UserService = require('../services/userService');
const PostService = require('../services/postService');
const CommentService = require('../services/commentService');
const notificationUtils = require('../utils/notificationUtils');
const { handleMediaUpload } = require('../utils/handleMediaUpload');
const { areImagesUnchanged } = require('../utils/checkImagesAreSame');


//@desc     Add comment to post
const addComment = async(req, res) => {
    try {
        const postId = req.params.id;
        const { text, media } = req.body;

        if (!text && !media) {
            return res.status(400).json({ message: 'Either text or media is required' });
        }

        const post = await PostService.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const commentData = {
            post: postId,
            user: req.user.id,
        };

        if (text !== undefined) {
            commentData.text = text;
        } else {
            commentData.text = '';
        }

        // upload media
        if (media !== undefined) {
            const mediaType = "image";

            const result = await handleMediaUpload(media, mediaType);
            if (!result.success) {
                return res.status(result.code).json({
                    success: false,
                    error: result.error,
                    message: result.message,
                    ...(result.suggestion && { suggestion: result.suggestion }),
                    ...(result.maxSize && { maxSize: result.maxSize })
                });
            }

            commentData.media = result.imageUrl;
        }

        const newComment = await CommentService.create(commentData);
        if (!newComment) {
            return res.status(500).json({ message: 'Failed to create comment' });
        }

        // Update the post's comments array with the new comment ID
        try {
            // Get current comments array or create a new one
            const currentComments = post.comments || [];

            // Add new comment ID to the array
            const updatedComments = [...currentComments, newComment.id];

            // Update the post with the new comment ID
            await PostService.updateById(postId, {
                comments: updatedComments,
                commentCount: updatedComments.length // Update comment count as well
            });
        } catch (updateError) {
            console.error(`Error updating post ${postId} with new comment:`, updateError.message);
            // We've already created the comment, so we'll continue instead of returning an error
        }

        // Get user details
        const user = await UserService.findById(req.user.id);

        const commentWithUser = {
            ...newComment,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                profilePicture: user.profilePicture
            }
        };

        // Send notification to post owner
        const userId = req.user.id;
        const username = `${user.firstName} ${user.lastName}`;
        if (post.author !== userId) {
            const commentPreview = text.length > 50 ? text.substring(0, 50) + '...' : text;
            await notificationUtils.sendCommentNotification(
                post.author,
                userId,
                postId,
                newComment.id,
                username,
                commentPreview
            );
        }

        res.status(201).json({
            message: 'Comment added successfully',
            comment: commentWithUser
        });
    } catch (error) {
        console.error('Add comment error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};


//@desc     Add a reply to a comment
const addReply = async(req, res) => {
    try {
        const commentId = req.params.id;
        const { text, media } = req.body;

        if (!text && !media) {
            return res.status(400).json({ message: 'Reply text or media is required' });
        }


        // Check if comment exists
        const comment = await CommentService.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Create reply object
        let mediaUrl = null;
        if (media) {
            const mediaType = "image";
            const result = await handleMediaUpload(media, mediaType);
            if (!result.success) {
                return res.status(result.code).json({
                    success: false,
                    error: result.error,
                    message: result.message,
                    ...(result.suggestion && { suggestion: result.suggestion }),
                    ...(result.maxSize && { maxSize: result.maxSize })
                });
            }
            mediaUrl = result.imageUrl;
        }

        const reply = {
            id: Date.now().toString(),
            user: req.user.id,
            text: text || "",
            media: mediaUrl,
            createdAt: new Date().toISOString(),
            likes: [],
        };
        // Get current replies array or create a new one
        const currentReplies = comment.replies || [];

        // Add new reply to the array
        const updatedReplies = [...currentReplies, reply];

        try {
            // Update the comment with the new reply
            const commentDataToBeUpdated = {
                replies: updatedReplies,
            };
            await CommentService.updateById(commentId, commentDataToBeUpdated);

            // Get user details
            const user = await UserService.findById(req.user.id);

            // Prepare reply with user details for response
            let replyWithUser = {...reply };

            if (user) {
                replyWithUser.user = {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    profilePicture: user.profilePicture
                };
            }

            res.status(201).json({ message: 'Reply added successfully', reply: replyWithUser });

            // Send notification to comment owner
            const userId = req.user.id;
            const postId = comment.post;
            const senderName = `${user.firstName} ${user.lastName}`;
            const post = await PostService.findById(postId);
            if (replyWithUser.id !== userId) {
                const replyPreview = text.length > 50 ? text.substring(0, 50) + '...' : text;
                await notificationUtils.sendReplyNotification(
                    comment.user,
                    userId,
                    post.id,
                    comment.id,
                    reply.id,
                    senderName,
                    replyPreview
                );
            }

        } catch (updateError) {
            console.error(`Error adding reply to comment ${commentId}:`, updateError.message);
            res.status(500).json({ message: 'Error adding reply', error: updateError.message });
        }
    } catch (error) {
        console.error('Add reply error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


//@desc     Get all comments for a specific post
const getCommentsByPostId = async(req, res) => {
    try {
        const postId = req.params.id;

        const post = await PostService.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comments = await CommentService.findByPostId(postId);
        if (comments.length === 0) {
            return res.status(200).json({ message: 'No comments found for this post', comments: [] });
        }

        // Collect all unique user IDs from comments and replies
        const userIds = new Set();
        comments.forEach(comment => {
            if (comment.user && typeof comment.user === 'string') {
                userIds.add(comment.user);
            }

            // Also collect user IDs from replies
            if (comment.replies && Array.isArray(comment.replies)) {
                comment.replies.forEach(reply => {
                    if (reply.user && typeof reply.user === 'string') {
                        userIds.add(reply.user);
                    }
                });
            }
        });

        // Fetch user data for all commenter's
        const usersMap = {};

        for (const userId of userIds) {
            try {
                if (!userId) continue;

                const user = await UserService.findById(userId);

                if (user) {
                    usersMap[userId] = {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        username: user.username,
                        profilePicture: user.profilePicture
                    };
                }
            } catch (userError) {
                console.error(`Error fetching user ${userId}:`, userError.message);
            }
        }

        // Populate comments with user data
        const populatedComments = comments.map(comment => {
            const userData = comment.user && typeof comment.user === 'string' ?
                usersMap[comment.user] :
                null;

            // Populate replies with user data too
            let populatedReplies = [];
            if (comment.replies && Array.isArray(comment.replies)) {
                populatedReplies = comment.replies.map(reply => {
                    const replyUserData = reply.user && typeof reply.user === 'string' ?
                        usersMap[reply.user] :
                        null;

                    return {
                        ...reply,
                        user: replyUserData,
                        likeCount: reply.likes ? reply.likes.length : 0
                    };
                });
            }

            return {
                id: comment.id,
                post: comment.post,
                text: comment.text,
                media: comment.media,
                likes: comment.likes,
                replies: populatedReplies,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
                user: userData,
                likeCount: comment.likes ? comment.likes.length : 0
            };
        });

        res.status(200).json({
            message: 'Comments retrieved successfully',
            count: populatedComments.length,
            comments: populatedComments
        });
    } catch (error) {
        console.error('Get comments error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};


//@desc     Update a comment
const updateComment = async(req, res) => {
    try {
        const commentId = req.params.id;
        const { text, media } = req.body;

        if (!commentId) {
            return res.status(400).json({ message: 'Comment ID is required' });
        }

        if (!text && !media) {
            return res.status(400).json({ message: 'Nothing to update' });
        }

        // Check if comment exists
        const comment = await CommentService.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Ensure user owns this comment
        if (comment.user !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized: You can only update your own comments' });
        }

        // Create update object
        const updateData = {};

        if (text !== undefined) updateData.text = text;
        if (media !== undefined && !areImagesUnchanged(media, comment.media)) {
            const mediaType = "image";

            const result = await handleMediaUpload(media, mediaType);
            if (!result.success) {
                return res.status(result.code).json({
                    success: false,
                    error: result.error,
                    message: result.message,
                    ...(result.suggestion && { suggestion: result.suggestion }),
                    ...(result.maxSize && { maxSize: result.maxSize })
                });
            }

            updateData.media = result.imageUrl;
        };

        try {
            // Get the updated comment
            const updatedComment = await CommentService.updateById(commentId, updateData);

            if (!updatedComment) {
                return res.status(404).json({ message: 'Failed to retrieve updated comment' });
            }

            // Get user details
            const user = await UserService.findById(req.user.id);

            let userDetails = null;
            if (user) {
                userDetails = {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    profilePicture: user.profilePicture
                };
            }

            const commentWithUser = {
                ...updatedComment,
                user: userDetails
            };

            res.status(200).json({ message: 'Comment updated successfully', comment: commentWithUser });
        } catch (updateError) {
            console.error(`Error updating comment ${commentId}:`, updateError.message);
            return res.status(500).json({ message: 'Error updating comment' });
        }
    } catch (error) {
        console.error('Update comment error:', error.message);
        return res.status(500).json({ message: 'Server error' });
    }
};


//@desc     Delete a comment
const deleteComment = async(req, res) => {
    try {
        const commentId = req.params.id;

        const comment = await CommentService.findById(commentId);
        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' });
        }

        const commentOwnerId = comment.user;
        const postId = comment.post;

        // Ensure user owns this comment or is the owner of the post
        if (commentOwnerId.toString() !== req.user.id.toString()) {
            // If not the comment owner, check if user is the post owner
            const post = await PostService.findById(postId);

            if (!post || post.author !== req.user.id) {
                return res.status(403).json({
                    message: 'Unauthorized: You can only delete your own comments or comments on your posts'
                });
            }
        }

        try {
            const postId = comment.post;
            const post = await PostService.findById(postId);
            if (post) {
                // Remove the comment ID from the post's comments array
                const updatedComments = post.comments.filter(id => id !== commentId);

                // Update the post with the new comments array
                await PostService.updateById(postId, {
                    comments: updatedComments,
                    commentCount: updatedComments.length // Update comment count as well
                });
            }

            // delete comment
            const deleteResult = await CommentService.deleteById(commentId);

            if (!deleteResult) {
                return res.status(500).json({ message: 'Failed to delete comment' });
            }

            res.status(200).json({ message: 'Comment deleted successfully' });
        } catch (deleteError) {
            console.error(`Error deleting comment ${commentId}:`, deleteError.message);
            res.status(500).json({ message: 'Error deleting comment' });
        }
    } catch (error) {
        console.error('Delete comment error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};




module.exports = {
    addComment,
    getCommentsByPostId,
    addReply,
    deleteComment,
    updateComment,
};