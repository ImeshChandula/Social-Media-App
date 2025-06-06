const UserService = require('../services/userService');
const PostService = require('../services/postService');
const {uploadMedia} = require('../utils/uploadMedia');
const {deleteAllComments} = require('../services/userDeletionService');
const {validateAndProcessMedia} = require('../middleware/mediaValidation');
const notificationUtils = require('../utils/notificationUtils');



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
                console.log(`Starting ${mediaType} upload...`);
                
                // Validate media before upload
                const validatedMedia = validateAndProcessMedia(media, mediaType);

                const imageUrl  = await uploadMedia(validatedMedia, mediaType);
                postData.media = imageUrl;

                console.log(`${mediaType} uploaded successfully:`);
            } catch (error) {
                console.error('Media upload failed:', error);

                if (error.message.includes('timeout')) {
                    return res.status(408).json({
                        error: "Upload timeout", 
                        message: "Your file is too large or upload is taking too long. Please try compressing the video or use a smaller file.",
                        suggestion: "For videos over 25MB, consider compressing to reduce file size."
                    });
                } else if (error.message.includes('File size')) {
                    return res.status(413).json({
                        error: "File too large",
                        message: error.message,
                        maxSize: mediaType === 'video' ? '50MB' : '15MB'
                    });
                } else {
                    return res.status(400).json({
                        error: "Failed to upload media", 
                        message: error.message
                    });
                }
            }
        }
        

        const newPost = await PostService.create(postData);

        // get author details
        const author = await UserService.findById(req.user.id);
        
        if (!author) {
            return res.status(404).json({ message: 'Author not found' });
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

        // Send notifications to friends (only if post is public or friends can see it)
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

        res.status(201).json({ message: "Post created successfully", populatedPost });
        
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
        const userId = req.user.id;
        
        // Get feed posts (in a real app, this would likely be posts from followed users)
        const posts = await PostService.findForFeed(userId);
        
        if (!posts.length) {
            return res.status(200).json([]);
        }
        
        // Get unique author IDs from posts
        const authorIds = [...new Set(posts.map(post => post.author))];
        
        // Get author details for all posts
        // In a production app, you'd want to batch this or use a more efficient approach
        const authorsPromises = authorIds.map(authorId => UserService.findById(authorId));
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
            try {
                console.log(`Starting ${mediaType} upload...`);
                
                // Validate media before upload
                const validatedMedia = validateAndProcessMedia(media, mediaType);

                const imageUrl  = await uploadMedia(validatedMedia, mediaType);
                updateData.media = imageUrl;

                console.log(`${mediaType} uploaded successfully:`);
            } catch (error) {
                console.error('Media upload failed:', error);

                if (error.message.includes('timeout')) {
                    return res.status(408).json({
                        error: "Upload timeout", 
                        message: "Your file is too large or upload is taking too long. Please try compressing the video or use a smaller file.",
                        suggestion: "For videos over 25MB, consider compressing to reduce file size."
                    });
                } else if (error.message.includes('File size')) {
                    return res.status(413).json({
                        error: "File too large",
                        message: error.message,
                        maxSize: mediaType === 'video' ? '50MB' : '15MB'
                    });
                } else {
                    return res.status(400).json({
                        error: "Failed to upload media", 
                        message: error.message
                    });
                }
            }
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