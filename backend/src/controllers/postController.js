const UserService = require('../services/userService');
const PostService = require('../services/postService');
const {deleteAllComments} = require('../services/userDeletionService');
const notificationUtils = require('../utils/notificationUtils');
const ReportService = require('../services/reportService');
const notificationService = require('../services/notificationService');
const { uploadImages, deleteImages } = require('../storage/firebaseStorage');

// Valid video categories
const VALID_VIDEO_CATEGORIES = ['Music', 'Sports', 'Education', 'Entertainment', 'News'];

//@desc     create a post 
const createPost = async (req, res) => {
    try {
        // Added 'category' to the destructuring
        const { content, media, mediaType, tags, privacy, location, category } = req.body;

        // Debug logging
        console.log('🔍 CREATE POST DEBUG:');
        console.log('Request body:', req.body);
        console.log('Category received:', category);
        console.log('Media type:', mediaType);
        console.log('Valid categories:', VALID_VIDEO_CATEGORIES);

        if (!content && !media) {
            return res.status(400).json({ error: "Either content or media is required." });
        }

        if(!mediaType) {
            return res.status(400).json({ error: "Media type is required." });
        }

        // Validate category for video posts
        if (mediaType === 'video') {
            console.log('📹 Video post detected, validating category...');

            if (!category) {
                console.log('❌ No category provided for video');
                return res.status(400).json({ 
                    error: "Category is required for video posts.",
                    validCategories: VALID_VIDEO_CATEGORIES
                });
            }
            
            if (!VALID_VIDEO_CATEGORIES.includes(category)) {
                console.log('❌ Invalid category:', category);
                console.log('Available categories:', VALID_VIDEO_CATEGORIES);
                console.log('Category type:', typeof category);
                console.log('Is string?', typeof category === 'string');

                return res.status(400).json({ 
                    error: "Invalid category for video post.",
                    receivedCategory: category,
                    validCategories: VALID_VIDEO_CATEGORIES,
                    message: `"${category}" is not allowed. Please select from: ${VALID_VIDEO_CATEGORIES.join(', ')}`
                });
            }
            
            console.log('✅ Category validation passed:', category);
        }
        
        const postData = {
            tags,
            mediaType,
            privacy,
            location
        };

        // Add category only for video posts
        if (mediaType === 'video' && category) {
            postData.category = category;
            console.log('✅ Category added to postData:', postData.category);
        }

        if (content !== undefined) postData.content = content;

        console.log('📦 Final postData:', postData);

        const newPost = await PostService.create(postData);

        const updateData = { author: req.user.id, }
        if (media) {
            const resultURLs = await uploadImages(media, 'post_images');
            updateData.media = resultURLs;
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

        console.log('✅ Post created successfully:', populatedPost.id);
        return res.status(201).json({ message: "Post created successfully", populatedPost });
        
    } catch (error) {
        console.error('❌ Post creation error:', error.message);
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
        const {category} = req.query; //Get category from query params

        let posts;

        if(category && category !== 'All') {
            //filter by specific category
            posts = await PostService.findByMediaTypeAndCategory(mediaType, category);
        } else{
            // Get all video posts
            posts = await PostService.findByMediaType(mediaType);
        }

        if (!posts.length) {
            return res.status(200).json({
                success: true,
                message: category ? `No videos found for category "${category}"` : "No videos found", 
                posts: []
            });
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
            message: category ? `Videos for category "${category}" retrieved successfully` : "All Videos retrieved successfully", 
            posts: populatedPosts
        });
    } catch (error) {
        console.error('Get all videos error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

//@desc     Get all photo posts
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

// @desc     Add post to favorites
const addToFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = req.params.postId;

        // Check if post exists
        const post = await PostService.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        // Get current user
        const user = await UserService.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Initialize favorites array if it doesn't exist
        const favorites = user.favorites || [];

        // Check if post is already in favorites
        if (favorites.includes(postId)) {
            return res.status(400).json({ success: false, message: "Post is already in favorites" });
        }

        // Add post to favorites
        favorites.push(postId);
        
        // Update user with new favorites
        const updatedUser = await UserService.updateById(userId, { favorites });
        
        if (!updatedUser) {
            return res.status(500).json({ success: false, message: "Failed to add to favorites" });
        }

        res.status(200).json({ 
            success: true, 
            message: "Post added to favorites successfully",
            isFavorited: true
        });
    } catch (error) {
        console.error('Add to favorites error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


// @desc     Remove post from favorites
const removeFromFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = req.params.postId;

        // Get current user
        const user = await UserService.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Get current favorites
        const favorites = user.favorites || [];

        // Check if post is in favorites
        if (!favorites.includes(postId)) {
            return res.status(400).json({ success: false, message: "Post is not in favorites" });
        }

        // Remove post from favorites
        const updatedFavorites = favorites.filter(id => id !== postId);
        
        // Update user with new favorites
        const updatedUser = await UserService.updateById(userId, { favorites: updatedFavorites });
        
        if (!updatedUser) {
            return res.status(500).json({ success: false, message: "Failed to remove from favorites" });
        }

        res.status(200).json({ 
            success: true, 
            message: "Post removed from favorites successfully",
            isFavorited: false
        });
    } catch (error) {
        console.error('Remove from favorites error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


// @desc     Get favorite posts
const getFavoritePosts = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get current user with favorites
        const user = await UserService.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const favorites = user.favorites || [];
        
        if (!favorites.length) {
            return res.status(200).json({
                success: true,
                message: "No favorite posts found",
                posts: []
            });
        }

        // Get all favorite posts
        const favoritePosts = [];
        
        for (const postId of favorites) {
            try {
                const post = await PostService.findById(postId);
                if (post) {
                    // Get author information
                    const author = await UserService.findById(post.author);
                    
                    const postObj = {
                        ...post,
                        likeCount: post.likes ? post.likes.length : (post.likeCount || 0),
                        commentCount: post.commentCount,
                        shareCount: post.shareCount,
                        isLiked: post.likes ? post.likes.includes(userId) : false,
                        isFavorited: true, // All posts here are favorited
                        author: author ? {
                            id: author.id,
                            firstName: author.firstName,
                            lastName: author.lastName,
                            username: author.username,
                            profilePicture: author.profilePicture
                        } : null
                    };
                    
                    favoritePosts.push(postObj);
                }
            } catch (postError) {
                console.error(`Error fetching post ${postId}:`, postError.message);
            }
        }

        res.status(200).json({
            success: true,
            count: favoritePosts.length,
            message: "Favorite posts retrieved successfully",
            posts: favoritePosts
        });
    } catch (error) {
        console.error('Get favorite posts error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


// @desc     Update post by post ID
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
        
        const { content, media, mediaType, tags, privacy, location, category } = req.body;
        
        // Validate category for video posts
        if (mediaType === 'video' && category && !VALID_VIDEO_CATEGORIES.includes(category)) {
            return res.status(400).json({ 
                error: "Invalid category for video post.",
                validCategories: VALID_VIDEO_CATEGORIES
            });
        }
        
        // Create update object with only the provided fields
        const updateData = {};
        
        if (content !== undefined) updateData.content = content;
        if (mediaType !== undefined) updateData.mediaType = mediaType;
        if (tags !== undefined) updateData.tags = tags;
        if (privacy !== undefined) updateData.privacy = privacy;
        if (location !== undefined) updateData.location = location;
        
        // Add category only for video posts
        if (mediaType === 'video' && category !== undefined) {
            updateData.category = category;
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
        let updatedPost = await PostService.updateById(postId, updateData);
        if (!updatedPost) {
            return res.status(404).json({ message: 'Failed to update post' });
        }

        if (media !== undefined) {
            const resultURLs = await uploadImages(media, 'post_images');

            updatedPost = await PostService.updateById(postId, { media: resultURLs });
            if (!updatedPost) {
                return res.status(404).json({ message: 'Failed to update post' });
            }
        }

        res.status(200).json({ message: 'Post updated successfully', post: updatedPost });
  } catch (error) {
        console.error('Update post error:', error.message);
        res.status(500).json({ message: 'Server error' });
  }
};


//@desc     Delete post by post ID
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
        await deleteImages(existingPost.media);
        
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


// @desc     Get video categories
const getVideoCategories = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            categories: VALID_VIDEO_CATEGORIES,
            message: "Video categories retrieved successfully"
        });
    } catch (error) {
        console.error('Get video categories error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};


// @desc     Get feed posts
// This function retrieves posts for the user's feed, including posts from friends and public posts.
const getFeedPosts = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        
        // Get user's friends list
        const user = await UserService.findById(currentUserId);
        const userFriends = user.friends || [];
        
        // Get posts for feed
        const posts = await PostService.findForFeed(currentUserId, userFriends);
        
        if (!posts.length) {
            return res.status(200).json({
                success: true,
                message: "No posts found in feed",
                posts: []
            });
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
                
                const author = await UserService.findById(authorId);
                
                if (author) {
                    authorsMap[authorId] = {
                        id: author.id,
                        firstName: author.firstName,
                        lastName: author.lastName,
                        username: author.username,
                        profilePicture: author.profilePicture
                    };
                }
            } catch (userError) {
                console.error(`Error fetching user ${authorId}:`, userError.message);
            }
        }
        
        // Populate posts with author data and user-specific info
        const populatedPosts = posts.map(post => {
            let authorData = null;
            
            // Check if author is a string ID and exists in our map
            if (post.author && typeof post.author === 'string' && authorsMap[post.author]) {
                authorData = authorsMap[post.author];
            }

            // Check if current user has liked this post
            const isLiked = currentUserId ? (post.likes || []).includes(currentUserId) : false;
            
            // Check if current user has favorited this post
            const isFavorited = user.favorites ? user.favorites.includes(post.id) : false;
            
            // Create a new object with post properties
            const postObj = {
                ...post,
                likeCount: post.likes ? post.likes.length : (post.likeCount || 0),
                commentCount: post.commentCount,
                shareCount: post.shareCount,
                isLiked: isLiked,
                isFavorited: isFavorited,
                author: authorData
            };
            
            return postObj;
        });
        
        res.status(200).json({
            success: true,
            count: populatedPosts.length,
            message: "Feed posts retrieved successfully",
            posts: populatedPosts
        });
    } catch (error) {
        console.error('Get feed posts error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


//Report functionality

//@desc     Report a post
const reportPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { reason } = req.body;
        const reporterId = req.user.id;

        if (!reason || reason.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: "Reason is required for reporting a post" 
            });
        }

        // Check if post exists
        const post = await PostService.findById(postId);
        if (!post) {
            return res.status(404).json({ 
                success: false, 
                message: "Post not found" 
            });
        }

        // Check if user has already reported this post
        const hasReported = await ReportService.hasUserReported(postId, reporterId);
        if (hasReported) {
            return res.status(400).json({ 
                success: false, 
                message: "You have already reported this post" 
            });
        }

        // Create report data
        const reportData = {
            postId: postId,
            reportedBy: reporterId,
            postAuthor: post.author,
            reason: reason.trim()
        };

        // Create the report
        const report = await ReportService.create(reportData);
        if (!report) {
            return res.status(500).json({ 
                success: false, 
                message: "Failed to create report" 
            });
        }

        // Mark post as reported and hide from feed
        await PostService.markAsReported(postId, report.id);

        res.status(201).json({
            success: true,
            message: "Post reported successfully",
            reportId: report.id
        });
    } catch (error) {
        console.error('Report post error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

//@desc     Get all reported posts for admin dashboard
const getReportedPosts = async (req, res) => {
    try {
        // Get all reported posts
        const reportedPosts = await PostService.findReportedPosts();
        
        if (!reportedPosts.length) {
            return res.status(200).json({
                success: true,
                message: "No reported posts found",
                posts: []
            });
        }

        // Get reports for each post and populate with user data
        const populatedPosts = [];
        
        for (const post of reportedPosts) {
            try {
                // Get all reports for this post
                const reports = await ReportService.findByPostId(post.id);
                
                // Get post author info
                const author = await UserService.findById(post.author);
                
                // Get reporter info for each report
                const reportsWithUserInfo = [];
                for (const report of reports) {
                    const reporter = await UserService.findById(report.reportedBy);
                    
                    reportsWithUserInfo.push({
                        ...report,
                        reporterInfo: reporter ? {
                            id: reporter.id,
                            firstName: reporter.firstName,
                            lastName: reporter.lastName,
                            username: reporter.username
                        } : null
                    });
                }
                
                // Create populated post object
                const populatedPost = {
                    ...post,
                    author: author ? {
                        id: author.id,
                        firstName: author.firstName,
                        lastName: author.lastName,
                        username: author.username,
                        profilePicture: author.profilePicture
                    } : null,
                    reports: reportsWithUserInfo
                };
                
                populatedPosts.push(populatedPost);
            } catch (postError) {
                console.error(`Error processing post ${post.id}:`, postError.message);
            }
        }

        res.status(200).json({
            success: true,
            count: populatedPosts.length,
            message: "Reported posts retrieved successfully",
            posts: populatedPosts
        });
    } catch (error) {
        console.error('Get reported posts error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

//@desc     Accept a report (keep post hidden, can delete, or warn user)
const acceptReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { reviewNote } = req.body;
        const adminId = req.user.id;

        // Find the report
        const report = await ReportService.findById(reportId);
        if (!report) {
            return res.status(404).json({ 
                success: false, 
                message: "Report not found" 
            });
        }

        // Get admin information for the notification
        const admin = await UserService.findById(adminId);
        const adminName = admin ? `${admin.firstName} ${admin.lastName}` : 'Administrator';

        // Determine action based on reviewNote
        let action = 'general';
        if (reviewNote && reviewNote.toLowerCase().includes('warn')) {
            action = 'warn_user';
        } else if (reviewNote && reviewNote.toLowerCase().includes('delete')) {
            action = 'delete_post';
        }

        // Update report status
        const updateData = {
            status: 'accepted',
            reviewedBy: adminId,
            reviewNote: reviewNote || null,
            action: action // Track what action was taken
        };

        const updatedReport = await ReportService.updateById(reportId, updateData);
        if (!updatedReport) {
            return res.status(500).json({ 
                success: false, 
                message: "Failed to update report" 
            });
        }

        // Handle different actions
        if (action === 'delete_post') {
            // Delete the post entirely
            const post = await PostService.findById(report.postId);
            if (post) {
                // Delete all comments associated with the post
                await deleteAllComments(report.postId);
                
                // Delete the post
                await PostService.deleteById(report.postId);

                // Send notification to post author about post deletion
                try {
                    const deletionMessage = `Your post has been removed due to a policy violation. Reason: ${report.reason}. If you believe this was a mistake, please contact support.`;
                    
                    await notificationService.createNotification(
                        report.postAuthor, // recipient (post author)
                        adminId, // sender (admin)
                        'post_warning', // type
                        report.postId, // entity ID
                        'post', // entity type
                        deletionMessage,
                        {
                            action: 'post_deleted',
                            reportReason: report.reason,
                            reviewNote: reviewNote,
                            reportId: reportId
                        }
                    );
                } catch (notificationError) {
                    console.error('Error sending deletion notification:', notificationError);
                }
            }
        } else if (action === 'warn_user') {
            // Keep post hidden but send warning to user
            await PostService.updateById(report.postId, {
                isReported: false, // Remove from reported posts list
                isHidden: true // Keep post hidden
            });

            // Send warning notification to post author
            try {
                const warningMessage = `Your post has received a warning due to a policy violation. Reason: ${report.reason}. Please review our community guidelines to avoid future issues.`;
                
                await notificationService.createNotification(
                    report.postAuthor, // recipient (post author)
                    adminId, // sender (admin)
                    'post_warning', // type
                    report.postId, // entity ID
                    'post', // entity type
                    warningMessage,
                    {
                        action: 'post_warning',
                        reportReason: report.reason,
                        reviewNote: reviewNote,
                        reportId: reportId
                    }
                );
                
                console.log(`Warning notification sent to user ${report.postAuthor} for post ${report.postId}`);
            } catch (notificationError) {
                console.error('Error sending warning notification:', notificationError);
                // Don't fail the entire operation if notification fails
            }
        } else {
            // General acceptance - just hide the post
            await PostService.updateById(report.postId, {
                isReported: false, // Remove from reported posts list
                isHidden: true // Keep post hidden
            });
        }

        // Send success response with action details
        const responseMessage = action === 'delete_post' 
            ? 'Report accepted and post deleted successfully' 
            : action === 'warn_user'
            ? 'Report accepted and warning sent to user'
            : 'Report accepted successfully';

        res.status(200).json({
            success: true,
            message: responseMessage,
            report: updatedReport,
            action: action
        });
    } catch (error) {
        console.error('Accept report error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

//@desc     Decline a report (show post in feed again)
const declineReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { reviewNote } = req.body;
        const adminId = req.user.id;

        // Find the report
        const report = await ReportService.findById(reportId);
        if (!report) {
            return res.status(404).json({ 
                success: false, 
                message: "Report not found" 
            });
        }

        // Update report status
        const updateData = {
            status: 'declined',
            reviewedBy: adminId,
            reviewNote: reviewNote || null
        };

        const updatedReport = await ReportService.updateById(reportId, updateData);
        if (!updatedReport) {
            return res.status(500).json({ 
                success: false, 
                message: "Failed to update report" 
            });
        }

        // Show post in feed again
        await PostService.showPost(report.postId, {
            isReported: false, // Remove from reported posts list
            isHidden: false // Show post in feed again
        });

        res.status(200).json({
            success: true,
            message: "Report declined successfully. Post is now visible in feed.",
            report: updatedReport
        });
    } catch (error) {
        console.error('Decline report error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};



module.exports = {
    createPost,
    getAllPosts,
    getPostByPostId,
    getAllVideoPosts,
    getAllPhotoPosts,
    getAllPostsByUserId,
    updatePostByPostId,
    deletePostByPostId,
    addToFavorites,
    removeFromFavorites,
    getFavoritePosts,
    getVideoCategories,
    getFeedPosts,
    reportPost,
    getReportedPosts,
    acceptReport,
    declineReport
};