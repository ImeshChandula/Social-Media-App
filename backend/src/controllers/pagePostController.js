const PageService = require('../services/pageService');
const PostService = require('../services/postService');
const { handleMediaUpload } = require('../utils/handleMediaUpload');

//@desc     Create post as page
const createPagePost = async (req, res) => {
    try {
        const pageId = req.params.pageId;
        const { content, media, mediaType, tags, privacy, location } = req.body;
        const userId = req.user.id;

        // Check if page exists and user is owner
        const page = await PageService.findById(pageId);
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        if (page.owner !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to post on this page'
            });
        }

        if (!content && !media) {
            return res.status(400).json({ 
                success: false,
                message: "Either content or media is required." 
            });
        }

        if (!mediaType) {
            return res.status(400).json({ 
                success: false,
                message: "Media type is required." 
            });
        }

        const postData = {
            tags,
            mediaType,
            privacy: privacy || 'public', // Page posts are usually public
            location,
            authorType: 'page'
        };

        if (content !== undefined) postData.content = content;

        const newPost = await PostService.createPagePost(pageId, postData);

        const updateData = {};
        if (media) {
            const result = await handleMediaUpload(media, mediaType);
            if (!result.success) {
                return res.status(result.code).json({
                    success: false,
                    error: result.error,
                    message: result.message
                });
            }
            updateData.media = result.imageUrl;
        }
        
        const populatedPost = await PostService.updateById(newPost.id, updateData);
        if (!populatedPost) {
            return res.status(400).json({ 
                success: false, 
                message: "Failed to create post"
            });
        }

        return res.status(201).json({ 
            success: true,
            message: "Page post created successfully", 
            post: {
                ...populatedPost,
                author: {
                    id: page.id,
                    name: page.pageName,
                    username: page.username,
                    profilePicture: page.profilePicture,
                    type: 'page'
                }
            }
        });
        
    } catch (error) {
        console.error('Page post creation error:', error.message);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

//@desc     Get page posts
const getPagePosts = async (req, res) => {
    try {
        const pageId = req.params.pageId;
        const currentUserId = req.user ? req.user.id : null;

        const page = await PageService.findById(pageId);
        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        const posts = await PostService.findByPageId(pageId);
        
        if (!posts.length) {
            return res.status(200).json({
                success: true,
                message: "No posts found for this page", 
                posts: []
            });
        }
        
        // Populate posts with page data
        const populatedPosts = posts.map(post => {
            const isLiked = currentUserId ? (post.likes || []).includes(currentUserId) : false;

            return {
                ...post,
                likeCount: post.likeCount,
                commentCount: post.commentCount,
                shareCount: post.shareCount,
                isLiked: isLiked,
                author: {
                    id: page.id,
                    name: page.pageName,
                    username: page.username,
                    profilePicture: page.profilePicture,
                    type: 'page'
                }
            };
        });
        
        res.status(200).json({
            success: true,
            count: populatedPosts.length, 
            message: "Page posts retrieved successfully", 
            posts: populatedPosts
        });
    } catch (error) {
        console.error('Get page posts error:', error.message);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

module.exports = {
    createPagePost,
    getPagePosts
};