const Post = require('../models/Post');
const User = require('../models/User');
const Comments = require('../models/Comment');
const cloudinary =  require("../config/cloudinary");

//@desc     create a post 
const createPost = async (req, res) => {
    try {
        const { content, media, mediaType, tags, privacy, location } = req.body;

        if (!content && !media) {
            return res.status(400).json({ error: "Either content or media is required." });
        }
        
        const postData = {
            author: req.user.id,
            content,
            tags,
            mediaType,
            privacy,
            location
        };

        // Only upload media if provided
        if (media) {
            try {
                // Make sure cloudinary is properly initialized
                if (!cloudinary || typeof cloudinary.uploader.upload !== 'function') {
                    throw new Error('Cloudinary is not properly configured');
                }
                
                // Check the type of media and handle appropriately
                if (Array.isArray(media)) {
                    // If it's an array of media files
                    const uploadPromises = media.map(item => cloudinary.uploader.upload(item.path || item));
                    const uploadResults = await Promise.all(uploadPromises);
                    postData.media = uploadResults.map(result => result.secure_url);
                } else if (typeof media === 'object' && media !== null && media.path) {
                    // If it's a file object from multer
                    const uploadResponse = await cloudinary.uploader.upload(media.path);
                    postData.media = uploadResponse.secure_url;
                } else if (typeof media === 'string') {
                    // If it's a base64 string or a URL
                    const uploadResponse = await cloudinary.uploader.upload(media);
                    postData.media = uploadResponse.secure_url;
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

        const newPost = await Post.create(postData);

        // get author details
        const author = await User.findById(req.user.id);
        
        if (!author) {
            return res.status(404).json({ msg: 'Author not found' });
        }
        
        const authorData = {
            id: author.id,
            firstName: author.firstName,
            lastName: author.lastName,
            username: author.username,
            profilePicture: author.profilePicture
        };

        // combine post with author details
        const populatedPost = {
            ...newPost,
            author: authorData
        };

        res.status(201).json({ msg: "Post created successfully", populatedPost });
        
    } catch (error) {
        console.error('Post creation error:', error.message);
        res.status(500).json({ msg: 'Server error' });
    }
};


//@desc     Get all posts
const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.findAll();
        if (!posts.length) {
            return res.status(200).json({message: "No posts found", posts: []});
        }

        // Collect all unique author IDs from posts
        const authorIds = new Set();
        posts.forEach(post => {
            if (post.author && typeof post.author === 'string') {
                authorIds.add(post.author);
            }
        });
        
        // Create a map to store author information
        const authorsMap = {};
        
        // Fetch author data for each unique author ID
        for (const authorId of authorIds) {
            try {
                if (!authorId) continue;
                
                const user = await User.findById(authorId);
                
                if (user) {
                    authorsMap[authorId] = {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        username: user.username,
                        profilePicture: user.profilePicture
                    };
                }
            } catch (userError) {
                console.error(`Error fetching user ${authorId}:`, userError.message);
            }
        }
        
        // Populate posts with author data
        const populatedPosts = posts.map(post => {
            let authorData = null;
            
            // Check if author is a string ID and exists in our map
            if (post.author && typeof post.author === 'string' && authorsMap[post.author]) {
                authorData = authorsMap[post.author];
            }
            
            // Create a new object with post properties
            const postObj = {
                ...post,
                author: authorData
            };
            
            return postObj;
        });
        
        res.status(200).json({
            count: populatedPosts.length, 
            message: "All posts retrieved successfully", 
            posts: populatedPosts
        });
    } catch (error) {
        console.error('Get all posts error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};


//@desc     Get all posts by id
const getAllPostsByUserId = async (req, res) => {
    try {
        const userId = req.params.id || req.user.id;
        
        // Get posts by user ID
        const posts = await Post.findByUserId(userId);
        
        if (!posts.length) {
            return res.status(200).json({message: "No posts found for this user", posts: []});
        }
        
        // Get user details
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const authorData = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            profilePicture: user.profilePicture
        };
        
        // Populate posts with user data
        const populatedPosts = posts.map(post => {
            // Create a new object with post properties
            const postObj = {
                ...post,
                likeCount: post.likeCount,
                commentCount: post.commentCount,
                shareCount: post.shareCount,
                author: authorData
            };
            return postObj;
        });
        
        res.status(200).json({count: populatedPosts.length, message: "User posts retrieved successfully", posts: populatedPosts});
    } catch (error) {
        console.error('Get posts error:', error.message);
        res.status(500).json({ msg: 'Server error' });
    }
};


//@desc     Get all posts (feed)
const getAllPostsInFeed = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get feed posts (in a real app, this would likely be posts from followed users)
        const posts = await Post.findForFeed(userId);
        
        if (!posts.length) {
            return res.status(200).json([]);
        }
        
        // Get unique author IDs from posts
        const authorIds = [...new Set(posts.map(post => post.author))];
        
        // Get author details for all posts
        // In a production app, you'd want to batch this or use a more efficient approach
        const authorsPromises = authorIds.map(authorId => User.findById(authorId));
        const authors = await Promise.all(authorsPromises);
        
        // Create a map of author IDs to author data for quick lookup
        const authorMap = authors.reduce((map, author) => {
            if (author) {
                map[author.id] = {
                    id: author.id,
                    firstName: author.firstName,
                    lastName: author.lastName,
                    username: author.username,
                    profilePicture: author.profilePicture
                };
            }
            return map;
        }, {});
        
        // Populate posts with author data
        const populatedPosts = posts.map(post => ({
            ...post,
            author: authorMap[post.author] || post.author // Fallback to ID if author not found
        }));
        
        res.status(200).json({message: "Posts:", populatedPosts});
    } catch (err) {
        console.error('Get feed error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};


//@desc     Update post by post id
const updatePostByPostId = async (req, res) => {
    try {
        const postId = req.params.id;
        if (!postId) {
            return res.status(400).json({ message: 'Post ID is required' });
        }

        const existingPost = await Post.findById(postId);
        if (!existingPost) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        // Check if user is the author of the post
        if (existingPost.author !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized: You can only update your own posts' });
        }
        
        const { content, media, mediaType, tags, privacy, location } = req.body;
        
        // Create update object with only the provided fields
        const updateData = {};
        
        if (content !== undefined) updateData.content = content;
        if (mediaType !== undefined) updateData.mediaType = mediaType;
        if (tags !== undefined) updateData.tags = tags;
        if (privacy !== undefined) updateData.privacy = privacy;
        if (location !== undefined) updateData.location = location;
        if (media !== undefined) {
            try {
                // Make sure cloudinary is properly initialized
                if (!cloudinary || typeof cloudinary.uploader.upload !== 'function') {
                    throw new Error('Cloudinary is not properly configured');
                }
                
                // Check the type of media and handle appropriately
                if (Array.isArray(media)) {
                    // If it's an array of media files
                    const uploadPromises = media.map(item => cloudinary.uploader.upload(item.path || item));
                    const uploadResults = await Promise.all(uploadPromises);
                    updateData.media = uploadResults.map(result => result.secure_url);
                } else if (typeof media === 'object' && media !== null && media.path) {
                    // If it's a file object from multer
                    const uploadResponse = await cloudinary.uploader.upload(media.path);
                    updateData.media = uploadResponse.secure_url;
                } else if (typeof media === 'string') {
                    // If it's a base64 string or a URL
                    const uploadResponse = await cloudinary.uploader.upload(media);
                    updateData.media = uploadResponse.secure_url;
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
        
        // Add edit history if content is changed
        if (content !== undefined && content !== existingPost.content) {
            updateData.isEdited = true;
        
            // Create edit history entry
            const editEntry = {
                previousContent: existingPost.content,
                editedAt: new Date().toISOString()
            };
        
            // Use the existing edit history or create a new array
            updateData.editHistory = [...(existingPost.editHistory || []), editEntry];
        }

        // Make sure we have something to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }
        
        // Update the post
        const updatedPost = await Post.updateById(postId, updateData);
        if (!updatedPost) {
            return res.status(404).json({ message: 'Failed to update post' });
        }

        res.status(200).json({ message: 'Post updated successfully', post: updatedPost });
  } catch (error) {
        console.error('Update post error:', error.message);
        res.status(500).json({ message: 'Server error' });
  }
};


//@desc 
const deletePostByPostId = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const postId = req.params.id;
        if (!postId) {
            return res.status(400).json({ message: 'Post ID is required' });
        }

        // Check if post exists
        const existingPost = await Post.findById(postId);
        if (!existingPost) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        // Check if user is the author of the post
        // Assuming req.user.id contains the authenticated user's ID
        if (req.user.role !== 'super_admin' && existingPost.author !== currentUserId) {
            return res.status(403).json({ message: 'Unauthorized: You can only delete your own posts' });
        }

        // Delete all comments associated with the post
        try {
            if (existingPost.comments && existingPost.comments.length > 0) {
                console.log(`Deleting ${existingPost.comments.length} comments for post ${postId}`);
                
                // Create an array of promises for deleting each comment
                const deleteCommentPromises = existingPost.comments.map(async (commentId) => {
                    try {
                        await Comment.deleteById(commentId);
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
        
        // Delete the post
        const deleteResult = await Post.deleteById(postId);
        if (!deleteResult) {
            return res.status(500).json({ message: 'Failed to delete post' });
        }

        res.status(200).json({ message: 'Post and all associated comments deleted successfully' });
    } catch (error) {
        console.error('Delete post error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};



module.exports = {
    createPost,
    getAllPosts,
    getAllPostsByUserId,
    getAllPostsInFeed,
    updatePostByPostId,
    deletePostByPostId
};