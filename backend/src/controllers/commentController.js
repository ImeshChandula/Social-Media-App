const Comment = require('../models/Comment');
const Post = require('../models/Post');

// Add comment to post
exports.addComment = async (req, res) => {
  try {
    const { text, media } = req.body;
    
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    const newComment = new Comment({
      post: req.params.postId,
      user: req.user.id,
      text,
      media
    });
    
    await newComment.save();
    
    // Add comment reference to post
    post.comments.push(newComment.id);
    await post.save();
    
    // Get user details
    const user = await User.findById(req.user.id);
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      profilePicture: user.profilePicture
    };
    
    // Populate user data
    const populatedComment = {
      id: newComment.id,
      ...newComment,
      user: userData
    };
    
    res.json(populatedComment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get comments for a post
exports.getComments = async (req, res) => {
  try {
    const commentsQuery = Comment.find({ post: req.params.postId });
    const commentsSnapshot = await commentsQuery.get();
    
    const comments = [];
    
    for (const doc of commentsSnapshot.docs) {
      const commentData = doc.data();
      const comment = { id: doc.id, ...commentData };
      
      // Get user details
      const commentUser = await User.findById(comment.user);
      comment.user = {
        id: commentUser.id,
        firstName: commentUser.firstName,
        lastName: commentUser.lastName,
        username: commentUser.username,
        profilePicture: commentUser.profilePicture
      };
      
      // Get reply user details
      for (let i = 0; i < comment.replies.length; i++) {
        const replyUser = await User.findById(comment.replies[i].user);
        comment.replies[i].user = {
          id: replyUser.id,
          firstName: replyUser.firstName,
          lastName: replyUser.lastName,
          username: replyUser.username,
          profilePicture: replyUser.profilePicture
        };
      }
      
      comments.push(comment);
    }
    
    // Sort by createdAt descending
    comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update comment
exports.updateComment = async (req, res) => {
  try {
    const { text, media } = req.body;
    
    let comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    
    // Check comment belongs to user
    if (comment.user !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    if (text) comment.text = text;
    if (media) comment.media = media;
    
    await comment.save();
    
    res.json(comment);
	}catch(err){
		console.error(err.message);
		res.status(500).send('Server error');
	}
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    
    // Check comment belongs to user or user is admin/moderator
    if (comment.user !== req.user.id && 
        !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Remove comment reference from post
    const post = await Post.findById(comment.post);
    if (post) {
      post.comments = post.comments.filter(id => id !== comment.id);
      await post.save();
    }
    
    await comment.remove();
    
    res.json({ msg: 'Comment removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

