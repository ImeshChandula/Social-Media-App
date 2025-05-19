const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const cloudinary =  require("../config/cloudinary");

//@desc     Add comment to post
const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const { text, media } = req.body;

    if (!text && !media) {
      return res.status(400).json({ message: 'Either text or media is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const commentData = {
      post: postId,
      user: req.user.id,
      text: text,
    };

    if (media) {
      try {
        if (!cloudinary || typeof cloudinary.uploader.upload !== 'function') {
            throw new Error('Cloudinary is not properly configured');
        }

        if (Array.isArray(media)) {
          // If it's an array of media files
          const uploadPromises = media.map(item => cloudinary.uploader.upload(item.path || item));
          const uploadResults = await Promise.all(uploadPromises);
          commentData.media = uploadResults.map(result => result.secure_url);
        } else if (typeof media === 'object' && media !== null && media.path) {
          // If it's a file object from multer
          const uploadResponse = await cloudinary.uploader.upload(media.path);
          commentData.media = uploadResponse.secure_url;
        } else if (typeof media === 'string') {
          // If it's a base64 string or a URL
          const uploadResponse = await cloudinary.uploader.upload(media);
          commentData.media = uploadResponse.secure_url;
        } else {
          throw new Error('Invalid media format');
        }
      } catch (uploadError) {
          console.error('Media upload error:', uploadError);
          return res.status(400).json({ 
              error: "Failed to upload media. Invalid format or Cloudinary configuration issue.",
              details: uploadError.message
          });
      }
    };
    
    const newComment = await Comment.create(commentData);
    if (!newComment) {
      return res.status(500).json({ message: 'Failed to create comment' });
    }

    // Get user details
    const user = await User.findById(req.user.id);

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
const addReply = async (req, res) => {
  try {
    const commentId = req.params.id
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ msg: 'Reply text is required' });
    }
    
    // Check if comment exists
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    
    // Create reply object
    const reply = {
      id: Date.now().toString(), // Generate unique ID for the reply
      user: req.user.id,
      text,
      createdAt: new Date().toISOString(),
      likes: []
    };
    
    // Get current replies array or create a new one
    const currentReplies = comment.replies || [];
    
    // Add new reply to the array
    const updatedReplies = [...currentReplies, reply];
    
    try {
      // Update the comment with the new reply
      await commentsCollection.doc(commentId).update({
        replies: updatedReplies,
        updatedAt: new Date().toISOString()
      });
      
      // Get user details
      const user = await User.findById(req.user.id);
      
      // Prepare reply with user details for response
      let replyWithUser = { ...reply };
      
      if (user) {
        replyWithUser.user = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          profilePicture: user.profilePicture
        };
      }
      
      res.status(201).json({
        msg: 'Reply added successfully',
        reply: replyWithUser
      });
    } catch (updateError) {
      console.error(`Error adding reply to comment ${commentId}:`, updateError.message);
      res.status(500).json({ msg: 'Error adding reply' });
    }
  } catch (error) {
    console.error('Add reply error:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};


//@desc     Get all comments for a specific post
const getCommentsByPostId  = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!postId) {
      return res.status(400).json({ msg: 'Post ID is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Get comments for this post
    const comments = await Comment.findByPostId(postId);

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
        
        const user = await User.findById(userId);
        
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
      const userData = comment.user && typeof comment.user === 'string' 
        ? usersMap[comment.user] 
        : null;
      
      // Populate replies with user data too
      let populatedReplies = [];
      if (comment.replies && Array.isArray(comment.replies)) {
        populatedReplies = comment.replies.map(reply => {
          const replyUserData = reply.user && typeof reply.user === 'string'
            ? usersMap[reply.user]
            : null;
          
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
      msg: 'Comments retrieved successfully',
      count: populatedComments.length,
      comments: populatedComments
    });
  } catch (err) {
    console.error('Get comments error:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};


//@desc     Update a comment
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text, media } = req.body;
    
    if (!commentId) {
      return res.status(400).json({ msg: 'Comment ID is required' });
    }
    
    if (!text && !media) {
      return res.status(400).json({ msg: 'Nothing to update' });
    }
    
    // Check if comment exists
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    
    // Ensure user owns this comment
    if (comment.user !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized: You can only update your own comments' });
    }
    
    // Create update object
    const updateData = {};
    
    if (text !== undefined) updateData.text = text;
    if (media !== undefined) updateData.media = media;
    
    try {
      // Get the updated comment
      const updatedComment = await Comment.updateById(commentId, updateData);
      
      if (!updatedComment) {
        return res.status(404).json({ msg: 'Failed to retrieve updated comment' });
      }
      
      // Get user details
      const user = await User.findById(req.user.id);
      
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
      
      res.status(200).json({
        msg: 'Comment updated successfully',
        comment: commentWithUser
      });
    } catch (updateError) {
      console.error(`Error updating comment ${commentId}:`, updateError.message);
      res.status(500).json({ msg: 'Error updating comment' });
    }
  } catch (error) {
    console.error('Update comment error:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};


//@desc     Delete a comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    if (!commentId) {
      return res.status(400).json({ msg: 'Comment ID is required' });
    }
    
    // Check if comment exists
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    
    // Ensure user owns this comment or is the owner of the post
    if (comment.user !== req.user.id) {
      // If not the comment owner, check if user is the post owner
      const post = await Post.findById(comment.post);
      
      if (!post || post.author !== req.user.id) {
        return res.status(403).json({ 
          msg: 'Unauthorized: You can only delete your own comments or comments on your posts' 
        });
      }
    }
    
    try {
      // Delete the comment
      const deleteResult = await Comment.delete(commentId);
      
      if (!deleteResult) {
        return res.status(500).json({ msg: 'Failed to delete comment' });
      }
      
      res.status(200).json({ msg: 'Comment deleted successfully' });
    } catch (deleteError) {
      console.error(`Error deleting comment ${commentId}:`, deleteError.message);
      res.status(500).json({ msg: 'Error deleting comment' });
    }
  } catch (error) {
    console.error('Delete comment error:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};




module.exports = {
  addComment,
  getCommentsByPostId,
  addReply,
  deleteComment,
  updateComment,
};