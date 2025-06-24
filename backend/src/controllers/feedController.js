const UserService = require('../services/userService');
const PostService = require('../services/postService');
const populateAuthor = require('../utils/populateAuthor');
const FeedAlgorithm = require('../algorithms/FeedAlgorithm');
const UserInteractionService = require('../services/userInteractionService');
const UserActivityService = require('../services/userActivityService');


const feedAlgorithm = new FeedAlgorithm();

//@desc     Get all posts (feed)
const getAllPostsInFeed = async (req, res) => {
    try {
        const user = await UserService.findById(req.user.id);

        const posts = await PostService.findForFeed(req.user.id, user.friends);
        if (!posts) {
            return res.status(400).json({ success: false, message: "Error finding posts for feed"});
        }
        
        const populatedPosts = await populateAuthor(posts);

        // Extract algorithm options from query params
        const {
            refresh = 'false',
            last_seen = '',
            sort_by = 'engagement', // 'engagement' or 'recency'
            show_trending = 'false'
        } = req.query;

        // Parse last seen posts
        const lastSeenPosts = last_seen ? last_seen.split(',') : [];

        // Get user interaction data (you might want to store this in user profile or separate collection)
        const userInteractions = await getUserInteractionData(req.user.id);

        // Algorithm options
        const algorithmOptions = {
            isRefresh: refresh === 'true',
            lastSeenPosts: lastSeenPosts,
            userInteractions: userInteractions,
            prioritizeEngagement: sort_by === 'engagement'
        };

        // Apply feed algorithm
        let sortedPosts;
        
        if (show_trending === 'true') {
            // Show trending posts
            sortedPosts = feedAlgorithm.getTrendingPosts(populatedPosts, 6);
        } else {
            // Regular feed algorithm
            sortedPosts = feedAlgorithm.generateFeed(
                populatedPosts, 
                req.user.id, 
                user.friends, 
                algorithmOptions
            );
        }

        // For pagination/infinite scroll
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedPosts = sortedPosts.slice(startIndex, endIndex);

        // Track which posts user has seen
        const seenPostIds = paginatedPosts.map(post => post.id);
        await trackSeenPosts(req.user.id, seenPostIds);

        return res.status(200).json({ 
            success: true, 
            message: "Fetching posts for feed successfully.", 
            count: populatedPosts.length,
            posts: populatedPosts,
            page: page,
            hasMore: endIndex < sortedPosts.length,
            posts: paginatedPosts,
            metadata: {
                algorithm: sort_by,
                isRefresh: refresh === 'true',
                showTrending: show_trending === 'true'
            }
        });
    } catch (err) {
        console.error('Get feed error:', err.message);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};


/**
 * Get trending posts endpoint
 */
const getTrendingPosts = async (req, res) => {
    try {
        const user = await UserService.findById(req.user.id);
        const posts = await PostService.findForFeed(req.user.id, user.friends);
        
        if (!posts) {
            return res.status(400).json({ 
                success: false, 
                message: "Error finding posts for feed"
            });
        }
        
        const populatedPosts = await populateAuthor(posts);
        const hours = parseInt(req.query.hours) || 6;
        const trendingPosts = feedAlgorithm.getTrendingPosts(populatedPosts, hours);

        return res.status(200).json({ 
            success: true, 
            message: "Fetching trending posts successfully.", 
            count: trendingPosts.length,
            posts: trendingPosts.slice(0, 20) // Limit to top 20 trending
        });
    } catch (err) {
        console.error('Get trending posts error:', err.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

/**
 * Get user interaction data for personalization
 * This could be stored in user profile or separate analytics collection
 */
const getUserInteractionData = async (userId) => {
    try {
        // Example: Get user's interaction history
        // This is a placeholder - implement based on your data structure
        const interactions = await UserInteractionService.getInteractionHistory(userId);
        
        // Format: { authorId: { likes: count, comments: count } }
        const formattedInteractions = {};
        
        interactions.forEach(interaction => {
            if (!formattedInteractions[interaction.targetAuthorId]) {
                formattedInteractions[interaction.targetAuthorId] = { likes: 0, comments: 0 };
            }
            
            if (interaction.type === 'like') {
                formattedInteractions[interaction.targetAuthorId].likes++;
            } else if (interaction.type === 'comment') {
                formattedInteractions[interaction.targetAuthorId].comments++;
            }
        });
        
        return formattedInteractions;
    } catch (error) {
        console.error('Error getting user interaction data:', error);
        return {};
    }
};

/**
 * Track which posts user has seen for better recommendations
 */
const trackSeenPosts = async (userId, postIds) => {
    try {
        // Store seen posts in cache or database
        // This helps with infinite scroll and avoiding duplicate content
        await UserActivityService.trackSeenPosts(userId, postIds);
    } catch (error) {
        console.error('Error tracking seen posts:', error);
    }
};

/**
 * Refresh feed endpoint (for pull-to-refresh)
 */
const refreshFeed = async (req, res) => {
    try {
        // Clear user's seen posts cache for fresh content
        await UserActivityService.clearSeenPosts(req.user.id);
        
        // Call the main feed endpoint with refresh flag
        req.query.refresh = 'true';
        return getAllPostsInFeed(req, res);
    } catch (err) {
        console.error('Refresh feed error:', err.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

module.exports = {
    getAllPostsInFeed,
    getTrendingPosts,
    refreshFeed
};