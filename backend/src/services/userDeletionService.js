const UserService = require('./userService');
const PostService = require('./postService');
const CommentService = require('./commentService');
const StoryService = require('./storyService');


//  Delete all posts by a user and their associated comments
const deleteUserPosts = async (userId) => {
    try {
        const userPosts = await PostService.findByUserId(userId);
        console.log(`Found ${userPosts.length} posts to delete for user ${userId}`);
        
        // Delete each post and its comments
        for (const post of userPosts) {
            // Delete all comments for this post
            if (post.comments && post.comments.length > 0) {
                console.log(`Deleting ${post.comments.length} comments for post ${post.id}`);
                
                const deleteCommentPromises = post.comments.map(commentId => 
                    CommentService.deleteById(commentId).catch(err => 
                        console.error(`Error deleting comment ${commentId}:`, err.message)
                    )
                );
                
                await Promise.all(deleteCommentPromises);
            }
            
            // Delete the post
            await PostService.deleteById(post.id);
            console.log(`Deleted post ${post.id}`);
        }
    } catch (error) {
        console.error(`Error deleting posts for user ${userId}:`, error.message);
        // We still want the overall deletion process to continue if this step fails
    }
};

//  Delete all comments made by a user on any post
const deleteUserComments = async (userId) => {
    try {
        // Get all comments by this user
        const userComments = await CommentService.findByUserId(userId);
        console.log(`Found ${userComments.length} comments to delete for user ${userId}`);
        
        // For each comment:
        for (const comment of userComments) {
            // 1. Update the post to remove this comment ID
            try {
                const post = await PostService.findById(comment.post);
                if (post) {
                    // Remove the comment ID from the post's comments array
                    const updatedComments = post.comments.filter(id => id !== comment.id);
                    
                    // Update the post
                    await PostService.updateById(comment.post, {
                        comments: updatedComments,
                        commentCount: updatedComments.length
                    });
                }
            } catch (postUpdateError) {
                console.error(`Error updating post ${comment.post}:`, postUpdateError.message);
                // Continue with deleting the comment even if post update fails
            }
            
            // 2. Delete the comment
            await CommentService.deleteById(comment.id);
            console.log(`Deleted comment ${comment.id}`);
        }
    } catch (error) {
        console.error(`Error deleting comments for user ${userId}:`, error.message);
        // We still want the overall deletion process to continue if this step fails
    }
};

//  Delete all stories created by a user
const deleteUserStories = async (userId) => {
    try {
        // Get all stories by this user
        const userStories = await StoryService.findAllByUserId(userId);
        console.log(`Found ${userStories.length} stories to delete for user ${userId}`);
        
        // Delete each story
        for (const story of userStories) {
            await StoryService.findByIdAndDelete(story.id);
            console.log(`Deleted story ${story.id}`);
        }
    } catch (error) {
        console.error(`Error deleting stories for user ${userId}:`, error.message);
        // We still want the overall deletion process to continue if this step fails
    }
};

// Delete all comments in post
const deleteAllComments = async (postId) => {
    try {
        const existingPost = await PostService.findById(postId);
        if (existingPost.comments && existingPost.comments.length > 0) {
            console.log(`Deleting ${existingPost.comments.length} comments for post ${postId}`);
                
            // Create an array of promises for deleting each comment
            const deleteCommentPromises = existingPost.comments.map(async (commentId) => {
                try {
                    await CommentService.deleteById(commentId);
                    return { commentId, success: true };
                } catch (commentError) {
                    console.error(`Error deleting comment ${commentId}:`, commentError.message);
                    return { commentId, success: false, error: commentError.message };
                }
            });
                
            // Wait for all comment deletions to complete
            const commentDeletionResults = await Promise.all(deleteCommentPromises);
                
            // Log any failed comment deletions
            const failedDeletions = commentDeletionResults.filter(result => !result.success);
            if (failedDeletions.length > 0) {
                console.error(`Failed to delete ${failedDeletions.length} comments:`, failedDeletions);
            }
        }
    } catch (commentsError) {
        console.error(`Error handling comments for post ${postId}:`, commentsError.message);
        // We continue with post deletion even if some comments fail to delete
    }
};

//  Performs the complete user deletion process by cleaning up all associated data
const performUserDeletion = async (userId) => {
    // Step 1: Delete all posts by this user and their associated comments
    await deleteUserPosts(userId);
    
    // Step 2: Delete all comments by this user on any post
    await deleteUserComments(userId);
    
    // Step 3: Delete all stories by this user
    await deleteUserStories(userId);
    
    // Step 4: Delete the user account itself
    await UserService.deleteById(userId);
    
    return { success: true, message: 'User deleted successfully' };
};

module.exports = {
    performUserDeletion,
    deleteUserPosts,
    deleteUserComments, 
    deleteUserStories,
    deleteAllComments
};