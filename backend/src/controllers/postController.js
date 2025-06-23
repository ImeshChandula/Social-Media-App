const UserService = require('../services/userService');
const PostService = require('../services/postService');
const {deleteAllComments} = require('../services/userDeletionService');
const { handleMediaUpload } = require('../utils/handleMediaUpload');
const notificationUtils = require('../utils/notificationUtils');
const populateAuthor = require('../utils/populateAuthor');


//@desc     create a post 
const createPost = async (req, res) => {
    try {
        const { content, media, mediaType, tags, privacy, location } = req.body;

        if (!content && !media) {
            return res.status(400).json({ error: "Either content or media is required." });
        }

        if(!mediaType) {
            return res.status(400).json({ error: "Media type is required." });
        }
        
        const postData = {
            tags,
            mediaType,
            privacy,
            location
        };

        if (content !== undefined) postData.content = content;

        const newPost = await PostService.create(postData);

        const updateData = { author: req.user.id, }
        if (media) {
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
        }
        
        const populatedPost = await PostService.updateById(newPost.id, updateData);
        if (!populatedPost) {
            return res.status(400).json({ success: false, message: "Failed to create post"});
        }

        // Send notifications to friends (only if post is public or friends can see it)
        const author = await UserService.findById(req.user.id);
        const friendIds = author.friends || [];
        if (friendIds.length > 0 && (privacy === 'public' || privacy === 'friends')){
            try {
                const postPreview = content ? content.substring(0, 100) + (content.length > 100 ? '...' : '') : 'shared a media post';
                const senderName = `${author.firstName} ${author.lastName}`;

                await notificationUtils.sendNewPostNotification(
                    friendIds,
                    req.user.id,
                    newPost.id,
                    senderName,
                    postPreview
                ).catch(error => {
                    console.error('Error sending post notifications:', error);
                });
            } catch (error) {
                console.error('Error preparing post notifications:', error);
            }
        }

        return res.status(201).json({ message: "Post created successfully", populatedPost });
        
    } catch (error) {
        console.error('Post creation error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};


const getPostByPostId = async (req, res) => {
    try {
        const postId = req.params.id;
        
        const post = await PostService.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        res.status(200).json({ success: true, message: "Post received successfully", post })
    } catch (error) {
        console.error('Error getting post by post id:', error.message);
        res.status(500).json({ error: error.message, message: 'Server error' });
    }
};


//@desc     Get all posts
const getAllPosts = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const posts = await PostService.findAll();
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
                
                const user = await UserService.findById(authorId);
                
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

             // Check if current user has liked this post
            const isLiked = currentUserId ? (post.likes || []).includes(currentUserId) : false;
            
            // Create a new object with post properties
            const postObj = {
                ...post,
                likeCount: post.likes ? post.likes.length : (post.likeCount || 0),
                commentCount: post.commentCount,
                shareCount: post.shareCount,
                isLiked: isLiked,
                author: authorData
            };
            
            return postObj;
        });
        
        res.status(200).json({
            success: true,
            count: populatedPosts.length, 
            message: "All posts retrieved successfully", 
            posts: populatedPosts
        });
    } catch (error) {
        console.error('Get all posts error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};


//@desc     Get all video posts
const getAllVideoPosts = async (req, res) => {
    try {
        const mediaType = "video";

        const posts = await PostService.findByMediaType(mediaType);
        if (!posts.length) {
            return res.status(200).json({message: "No videos found", posts: []});
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
                
                const user = await UserService.findById(authorId);
                
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
                likeCount: post.likeCount,
                commentCount: post.commentCount,
                shareCount: post.shareCount,
                author: authorData
            };
            
            return postObj;
        });
        
        res.status(200).json({
            success: true,
            count: populatedPosts.length, 
            message: "All Videos retrieved successfully", 
            posts: populatedPosts
        });
    } catch (error) {
        console.error('Get all videos error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};


//@desc     Get all video posts
const getAllPhotoPosts = async (req, res) => {
    try {
        const mediaType = "image";

        const posts = await PostService.findByMediaType(mediaType);
        if (!posts.length) {
            return res.status(200).json({message: "No photos found", posts: []});
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
                
                const user = await UserService.findById(authorId);
                
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
                likeCount: post.likeCount,
                commentCount: post.commentCount,
                shareCount: post.shareCount,
                author: authorData
            };
            
            return postObj;
        });
        
        res.status(200).json({
            count: populatedPosts.length, 
            message: "All photos retrieved successfully", 
            posts: populatedPosts
        });
    } catch (error) {
        console.error('Get all photos error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};


//@desc     Get all posts by id
const getAllPostsByUserId = async (req, res) => {
    try {
        const userId = req.params.id || req.user.id;
        const currentUserId = req.user.id;

        // Get posts by user ID
        const posts = await PostService.findByUserId(userId);
        
        if (!posts.length) {
            return res.status(200).json({message: "No posts found for this user", posts: []});
        }
        
        // Get user details
        const user = await UserService.findById(userId);
        
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
            // Check if current user has liked this post
            const isLiked = post.likes && post.likes.includes(currentUserId);

            // Create a new object with post properties
            const postObj = {
                ...post,
                likeCount: post.likeCount,
                commentCount: post.commentCount,
                shareCount: post.shareCount,
                isLiked: isLiked,
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
        const posts = await PostService.findForFeed();
        if (!posts) {
            return res.status(400).json({ success: false, message: "Error finding posts for feed"});
        }
        
        const populatedPosts = await populateAuthor(posts);
        return res.status(200).json({ 
            success: true, 
            message: "Fetching posts for feed successfully.", 
            count: populatedPosts.length,
            posts: populatedPosts
        });
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

        const existingPost = await PostService.findById(postId);
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
        }
        
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
        const updatedPost = await PostService.updateById(postId, updateData);
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
        const existingPost = await PostService.findById(postId);
        if (!existingPost) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        // Check if user is the author of the post
        // Assuming req.user.id contains the authenticated user's ID
        if (req.user.role !== 'super_admin' && existingPost.author !== currentUserId) {
            return res.status(403).json({ message: 'Unauthorized: You can only delete your own posts' });
        }

        // Delete all comments associated with the post
        await deleteAllComments(postId);
        
        // Delete the post
        const deleteResult = await PostService.deleteById(postId);
        if (!deleteResult) {
            return res.status(500).json({ message: 'Failed to delete post' });
        }

        res.status(200).json({success: true, message: 'Post and all associated comments deleted successfully' });
    } catch (error) {
        console.error('Delete post error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};



module.exports = {
    createPost,
    getAllPosts,
    getPostByPostId,
    getAllVideoPosts,
    getAllPhotoPosts,
    getAllPostsByUserId,
    getAllPostsInFeed,
    updatePostByPostId,
    deletePostByPostId
};