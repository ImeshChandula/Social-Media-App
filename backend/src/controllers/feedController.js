const UserService = require('../services/userService');
const PostService = require('../services/postService');
const PageService = require('../services/pageService');
const Story = require('../models/Story');
const populateAuthor = require('../utils/populateAuthor');
const FeedAlgorithm = require('../algorithms/FeedAlgorithm');
const UserInteractionService = require('../services/userInteractionService');
const UserActivityService = require('../services/userActivityService');

const feedAlgorithm = new FeedAlgorithm();

// Enhanced feed with page posts and stories support
const getAllPostsInFeed = async (req, res) => {
    try {
        const user = await UserService.findById(req.user.id);
        const userFriends = user.friends || [];
        
        // Get pages the user follows
        const followedPages = await getUserFollowedPages(req.user.id);
        const pageIds = followedPages.map(page => page.id);
        
        // Get user posts
        const userPosts = await PostService.findForFeed(req.user.id, userFriends);
        
        // Get page posts from followed pages
        let pagePosts = [];
        for (const pageId of pageIds) {
            try {
                const posts = await PostService.findByUserId(pageId);
                const pagePostsWithPageData = await Promise.all(posts.map(async (post) => {
                    const pageData = await PageService.findById(pageId);
                    return {
                        ...post,
                        author: {
                            id: pageData.id,
                            username: pageData.username || pageData.pageName,
                            firstName: '',
                            lastName: '',
                            profilePicture: pageData.profilePicture,
                            pageName: pageData.pageName,
                            isPage: true
                        },
                        authorType: 'page'
                    };
                }));
                pagePosts = [...pagePosts, ...pagePostsWithPageData];
            } catch (error) {
                console.error(`Error fetching posts for page ${pageId}:`, error);
            }
        }
        
        // Combine user and page posts
        const allPosts = [...userPosts, ...pagePosts];
        
        if (!allPosts.length) {
            return res.status(200).json({
                success: true,
                message: "No posts found in feed",
                posts: []
            });
        }

        // Populate author data for user posts
        const populatedPosts = await populateAuthor(allPosts);

        // Extract algorithm options from query params
        const {
            refresh = 'false',
            last_seen = '',
            sort_by = 'engagement',
            show_trending = 'false'
        } = req.query;

        const lastSeenPosts = last_seen ? last_seen.split(',') : [];
        const userInteractions = await getUserInteractionData(req.user.id);

        const algorithmOptions = {
            isRefresh: refresh === 'true',
            lastSeenPosts: lastSeenPosts,
            userInteractions: userInteractions,
            prioritizeEngagement: sort_by === 'engagement'
        };

        // Apply feed algorithm
        let sortedPosts;
        
        if (show_trending === 'true') {
            sortedPosts = feedAlgorithm.getTrendingPosts(populatedPosts, 6);
        } else {
            sortedPosts = feedAlgorithm.generateFeed(
                populatedPosts, 
                req.user.id, 
                [...userFriends, ...pageIds],
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
            count: paginatedPosts.length,
            totalCount: sortedPosts.length,
            posts: paginatedPosts,
            page: page,
            hasMore: endIndex < sortedPosts.length,
            pagination: {
                page: page,
                limit: limit,
                hasMore: endIndex < sortedPosts.length,
                totalPages: Math.ceil(sortedPosts.length / limit)
            },
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

// Stories feed with comprehensive page stories support
const getStoriesFeedWithPages = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user details
        const user = await UserService.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's friends
        const friendIds = user.friends || [];
        
        // Get pages the user follows
        const followedPages = await getUserFollowedPages(userId);
        const pageIds = followedPages.map(page => page.id);

        // Get pages owned by the user
        const ownedPages = await PageService.findByOwner(userId);
        const ownedPageIds = ownedPages.map(page => page.id);

        // Combine all IDs for story fetching
        const allPageIds = [...new Set([...pageIds, ...ownedPageIds])]; // Remove duplicates
        const userIdsToFetch = [...friendIds, userId]; // User and friends

        console.log('Stories Feed Debug:', {
            userId,
            friendIds: friendIds.length,
            followedPages: pageIds.length,
            ownedPages: ownedPageIds.length,
            totalPageIds: allPageIds.length
        });

        // Get user stories (friends + current user)
        let userStories = [];
        if (userIdsToFetch.length > 0) {
            userStories = await Story.getFriendsStoriesSimple(userIdsToFetch);
            // Filter to only include user stories
            userStories = userStories.filter(story => !story.authorType || story.authorType === 'user');
        }

        // Get page stories (followed pages + owned pages)
        let pageStories = [];
        if (allPageIds.length > 0) {
            pageStories = await Story.getFriendsStoriesSimple(allPageIds);
            // Filter to only include page stories
            pageStories = pageStories.filter(story => story.authorType === 'page');
        }

        // Apply privacy filtering for page stories
        const filteredPageStories = pageStories.filter(story => {
            if (story.privacy === 'public') {
                return true; // Public page stories visible to all
            }
            if (story.privacy === 'friends') {
                // Check if user follows this page OR owns this page
                return pageIds.includes(story.userId) || ownedPageIds.includes(story.userId);
            }
            return false;
        });

        // Combine all stories
        const allStories = [...userStories, ...filteredPageStories];

        if (!allStories.length) {
            return res.status(200).json({ 
                success: true,
                message: 'No stories found in your feed', 
                stories: [] 
            });
        }

        // Filter active and non-expired stories
        const now = new Date();
        const activeStories = allStories.filter(story => {
            const expiresAt = new Date(story.expiresAt);
            return story.isActive && expiresAt > now;
        });

        if (!activeStories.length) {
            return res.status(200).json({ 
                success: true,
                message: 'No active stories found in your feed', 
                stories: [] 
            });
        }

        // Sort stories by creation date (newest first)
        activeStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Separate user stories and page stories for processing
        const userStoryIds = activeStories.filter(story => !story.authorType || story.authorType !== 'page').map(story => story.userId);
        const pageStoryIds = activeStories.filter(story => story.authorType === 'page').map(story => story.userId);

        // Get unique user IDs and page IDs
        const uniqueUserIds = [...new Set(userStoryIds)];
        const uniquePageIds = [...new Set(pageStoryIds)];

        // Create maps for user and page details
        const userMap = {};
        const pageMap = {};

        // Fetch user details
        for (const id of uniqueUserIds) {
            try {
                if (!id) continue;
                const friend = await UserService.findById(id);
                if (friend) {
                    userMap[id] = {
                        id: friend.id,
                        firstName: friend.firstName || '',
                        lastName: friend.lastName || '',
                        username: friend.username || `user_${id}`,
                        profilePicture: friend.profilePicture || 'https://via.placeholder.com/40',
                        type: 'user'
                    };
                }
            } catch (error) {
                console.error(`Error fetching user ${id}:`, error.message);
            }
        }

        // Fetch page details
        for (const id of uniquePageIds) {
            try {
                if (!id) continue;
                const page = await PageService.findById(id);
                if (page) {
                    pageMap[id] = {
                        id: page.id,
                        firstName: '',
                        lastName: '',
                        username: page.username || page.pageName,
                        profilePicture: page.profilePicture || 'https://via.placeholder.com/40',
                        pageName: page.pageName,
                        type: 'page',
                        isPage: true
                    };
                }
            } catch (error) {
                console.error(`Error fetching page ${id}:`, error.message);
            }
        }

        // Group stories by author (user or page)
        const storiesByAuthor = activeStories.reduce((acc, story) => {
            const storyUserId = story.userId;
            const isPageStory = story.authorType === 'page';
            
            if (!acc[storyUserId]) {
                acc[storyUserId] = {
                    user: isPageStory ? pageMap[storyUserId] : userMap[storyUserId],
                    stories: []
                };
                
                // Fallback if author data not found
                if (!acc[storyUserId].user) {
                    acc[storyUserId].user = {
                        id: storyUserId,
                        firstName: isPageStory ? '' : '',
                        lastName: isPageStory ? '' : '',
                        username: `${isPageStory ? 'page' : 'user'}_${storyUserId}`,
                        profilePicture: 'https://via.placeholder.com/40',
                        type: isPageStory ? 'page' : 'user',
                        isPage: isPageStory,
                        pageName: isPageStory ? `Page ${storyUserId}` : undefined
                    };
                }
            }
            
            acc[storyUserId].stories.push({
                ...story,
                _id: story.id || story._id,
                user: acc[storyUserId].user
            });

            return acc;
        }, {});

        // Convert to array format and sort user groups by most recent story
        const feedStories = Object.values(storiesByAuthor).map(authorGroup => {
            // Sort stories within each author group by creation date (newest first)
            authorGroup.stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return authorGroup;
        }).sort((a, b) => {
            // Sort author groups by their most recent story
            const aLatest = new Date(a.stories[0].createdAt);
            const bLatest = new Date(b.stories[0].createdAt);
            return bLatest - aLatest;
        });

        console.log('Stories Feed Result:', {
            totalActiveStories: activeStories.length,
            userGroups: feedStories.filter(g => g.user.type === 'user').length,
            pageGroups: feedStories.filter(g => g.user.type === 'page').length,
            totalGroups: feedStories.length
        });

        res.status(200).json({
            success: true,
            message: 'Stories feed retrieved successfully',
            stories: feedStories
        });

    } catch (error) {
        console.error('Error fetching stories feed:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

// Helper function to get pages a user follows
const getUserFollowedPages = async (userId) => {
    try {
        const allPages = await PageService.findAll();
        return allPages.filter(page => page.followers && page.followers.includes(userId));
    } catch (error) {
        console.error('Error getting followed pages:', error);
        return [];
    }
};

// Get user interaction data for personalization
const getUserInteractionData = async (userId) => {
    try {
        const interactions = await UserInteractionService.getInteractionHistory(userId);
        
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

// Track which posts user has seen for better recommendations
const trackSeenPosts = async (userId, postIds) => {
    try {
        await UserActivityService.trackSeenPosts(userId, postIds);
    } catch (error) {
        console.error('Error tracking seen posts:', error);
    }
};

// Get trending posts endpoint
const getTrendingPosts = async (req, res) => {
    try {
        const user = await UserService.findById(req.user.id);
        const followedPages = await getUserFollowedPages(req.user.id);
        const pageIds = followedPages.map(page => page.id);
        
        // Get posts from both users and pages
        const userPosts = await PostService.findForFeed(req.user.id, user.friends);
        let pagePosts = [];
        
        for (const pageId of pageIds) {
            try {
                const posts = await PostService.findByUserId(pageId);
                pagePosts = [...pagePosts, ...posts];
            } catch (error) {
                console.error(`Error fetching page posts for trending: ${pageId}`, error);
            }
        }
        
        const allPosts = [...userPosts, ...pagePosts];
        
        if (!allPosts.length) {
            return res.status(200).json({ 
                success: true, 
                message: "No posts found for trending", 
                posts: []
            });
        }
        
        const populatedPosts = await populateAuthor(allPosts);
        const hours = parseInt(req.query.hours) || 6;
        const trendingPosts = feedAlgorithm.getTrendingPosts(populatedPosts, hours);

        return res.status(200).json({ 
            success: true, 
            message: "Fetching trending posts successfully.", 
            count: trendingPosts.length,
            posts: trendingPosts.slice(0, 20)
        });
    } catch (err) {
        console.error('Get trending posts error:', err.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Refresh feed endpoint (for pull-to-refresh)
const refreshFeed = async (req, res) => {
    try {
        await UserActivityService.clearSeenPosts(req.user.id);
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
    getStoriesFeedWithPages,
    getUserFollowedPages,
    refreshFeed
};