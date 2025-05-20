const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');


//@desc     like/unlike to a post by post Id
const likeToAPostByPostId = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({success: false, message: "Post not found"});
        }

        // Check if user has already liked the post
        const likeIndex = post.likes.indexOf(userId);
        let actionPerformed = '';

        // update likes array
        if (likeIndex === -1) {
            // User hasn't liked the post, add like
            post.likes.push(userId);
            actionPerformed = 'liked';
        } else {
            // User has already liked the post, remove like
            post.likes.splice(likeIndex, 1);
            actionPerformed = 'unliked';
        }

        // Update the post in the database
        const updatedPost = await Post.updateById(postId, {likes: post.likes});
        if (!updatedPost) {
            return res.status(400).json({ success: false, message: "Failed to like this post"});
        }

        return res.status(200).json({ 
            success: true, 
            message: "Successfully liked to this post",
            data: {
                post: updatedPost.id,
                likeCount: updatedPost.likeCount,
                isLiked: updatedPost.likes.includes(userId)
            }
        });
    } catch (error) {
        console.error('Error in toggleLike controller:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error while processing like',
            error: error.message
        });
    }
};


//@desc     like/unlike to a post by post Id
const likeToACommentByCommentId = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user.id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({success: false, message: "Comment not found"});
        }

        // Check if user has already liked the comment
        const likeIndex = comment.likes.indexOf(userId);
        let actionPerformed = '';

        // update likes array
        if (likeIndex === -1) {
            // User hasn't liked the comment, add like
            comment.likes.push(userId);
            actionPerformed = 'liked';
        } else {
            // User has already liked the comment, remove like
            comment.likes.splice(likeIndex, 1);
            actionPerformed = 'unliked';
        }

        // Update the comment in the database
        const updatedComment = await Comment.updateById(commentId, {likes: comment.likes});
        if (!updatedComment) {
            return res.status(400).json({ success: false, message: "Failed to like this comment"});
        }

        return res.status(200).json({ 
            success: true, 
            message: "Successfully liked to this comment",
            data: {
                comment: updatedComment.id,
                likeCount: updatedComment.likeCount,
                isLiked: updatedComment.likes.includes(userId)
            }
        });
    } catch (error) {
        console.error('Error in toggleLike controller:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error while processing like',
            error: error.message
        });
    }
};


//@desc     Get all users who liked a post by post id
const getAllLikedUsersInPost = async (req, res) => {
    try {
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({success: false, message: "Post not found"});
        }

        // Fetch user details for all users who liked the post
        const userPromises = post.likes.map(userId => User.findById(userId));
        const users = await Promise.all(userPromises);
      
        // Filter out any null values in case some users don't exist anymore
        const validUsers = users.filter(user => user !== null);

        const likedUserDetails = validUsers.map(user => ({
            id: user.id,
            username: user.firstName + " " + user.lastName,
            profilePicture: user.profilePicture,
        }));

        return res.status(200).json({ 
            success: true,
            data: {
                users: likedUserDetails,
                count: likedUserDetails.length
            }
        });
    } catch (error) {
        console.error('Error in getLikes controller:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching likes',
            error: error.message
        });
    }
};


//@desc     Get all users who liked a comment by comment id
const getAllLikedUsersInComment = async (req, res) => {
    try {
        const commentId = req.params.id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({success: false, message: "Comment not found"});
        }

        // Fetch user details for all users who liked the comment
        const userPromises = comment.likes.map(userId => User.findById(userId));
        const users = await Promise.all(userPromises);
      
        // Filter out any null values in case some users don't exist anymore
        const validUsers = users.filter(user => user !== null);

        const likedUserDetails = validUsers.map(user => ({
            id: user.id,
            username: user.firstName + " " + user.lastName,
            profilePicture: user.profilePicture,
        }));

        return res.status(200).json({ 
            success: true,
            data: {
                users: likedUserDetails,
                count: likedUserDetails.length
            }
        });
    } catch (error) {
        console.error('Error in getLikes controller:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching likes',
            error: error.message
        });
    }
};




module.exports = { 
    likeToAPostByPostId, 
    getAllLikedUsersInPost,
    likeToACommentByCommentId,
    getAllLikedUsersInComment
};