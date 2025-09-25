const Story = require('../models/Story');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { count } = require('console');
const UserService = require('../services/userService');
const { uploadSingleImage, deleteImages } = require('../storage/firebaseStorage');


// Create a new story (updated)
const createStory = async(req, res) => {
    try {
        const { content, media, type, caption, privacy } = req.body;

        if (!content && !media) {
            return res.status(400).json({ message: 'Content or media  is required' });
        }

        // Create story object with timestamp
        const storyData = {
            userId: req.user.id,
            content,
            type,
            caption,
            //newly added
            privacy: privacy || 'friends', // Default to 'friends' if not provided
            isActive: true, // Explicitly set to true
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
            createdAt: new Date().toISOString(),
            viewers: [], // Initialize empty viewers array
            viewCount: 0 // Initialize view count
        };

        // Check if media is provided
        // Only upload media if provided
        if (media) {
            try {
                const imageUrl = await uploadSingleImage(media, 'story_media');
                storyData.media = imageUrl;
            } catch (error) {
                return res.status(400).json({ error: "Failed to upload media", message: error.message });
            }
        }

        console.log('Creating story with data:', storyData); // Debug log

        const newStory = await Story.create(storyData);
        if (!newStory) {
            return res.status(500).json({ message: 'Failed to create story' });
        }



        // get user details
        const user = await UserService.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userData = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            profilePicture: user.profilePicture
        }

        // Add user data to story
        const populatedStory = {
            ...newStory,
            user: userData,
        }


        res.status(201).json({
            message: 'Story created successfully',
            populatedStory
        });


    } catch (error) {
        console.error('Error creating story:', error);
        res.status(500).json({ message: 'Server error' });
    }


};


// Option A: Simplify the Firestore query and filter in application code
const getCurrentUserStories = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch the user
    //const user = await Story.findByUserId(userId);
    const user = await UserService.findById(userId);

    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Simplified query - only filter by userId in Firestore
    const allStories = await Story.findByUserIdSimple(userId);

    console.log('All stories found:', allStories.length); // Debug log
    
    if (!allStories || allStories.length === 0) {
      return res.status(200).json({ 
        message: 'No stories found for this user', 
        stories: [] 
      });
    }
    
    const now = new Date();
    console.log('Current time:', now.toISOString()); // Debug log
    
    // Filter in application code instead of database query
    const activeStories = allStories.filter(story => {
      const expiresAt = new Date(story.expiresAt);
      return story.isActive && expiresAt > now;
    });

    console.log('Active stories after filtering:', activeStories.length); // Debug log
    
    // Sort by creation date (newest first)
    activeStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Construct minimal user info
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      profilePicture: user.profilePicture
    };
    
    // Populate each story with user info
    const populatedStories = activeStories.map(story => ({
      ...story,
      _id: story.id || story._id, // Ensure _id is set for frontend compatibility (newly added line 15/7)
      viewCount: story.viewCount,
      user: userData
    }));
    
    return res.status(200).json({
      count: populatedStories.length,
      message: 'User stories retrieved successfully',
      stories: populatedStories
    });
    
  } catch (error) {
    console.error('Error getting current user stories:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};
 
// Enhanced getStoriesFeed function with page story integration
const getStoriesFeed = async (req, res) => {
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
        const PageService = require('../services/pageService');
        const followedPages = await getUserFollowedPages(userId);
        const pageIds = followedPages.map(page => page.id);

        // Get pages owned by the user
        const ownedPages = await PageService.findByOwner(userId);
        const ownedPageIds = ownedPages.map(page => page.id);

        // Combine all page IDs (followed + owned)
        const allPageIds = [...new Set([...pageIds, ...ownedPageIds])];

        // If user has no friends and no pages, return empty story feed
        if (friendIds.length === 0 && allPageIds.length === 0) {
            return res.status(200).json({ 
                message: 'You have no friends or followed pages to fetch stories from.', 
                stories: [] 
            });
        }

        // Create array of user IDs to fetch stories from (friends + current user)
        const userIdsToFetch = [...friendIds, userId];

        console.log('Enhanced Stories Feed Debug:', {
            userId,
            friendIds: friendIds.length,
            followedPages: pageIds.length,
            ownedPages: ownedPageIds.length,
            totalPageIds: allPageIds.length
        });

        // Get user stories
        let userStories = [];
        if (userIdsToFetch.length > 0) {
            userStories = await Story.getFriendsStoriesSimple(userIdsToFetch);
            // Filter to only include user stories
            userStories = userStories.filter(story => !story.authorType || story.authorType === 'user');
        }

        // Get page stories
        let pageStories = [];
        if (allPageIds.length > 0) {
            pageStories = await Story.getFriendsStoriesSimple(allPageIds);
            // Filter to only include page stories
            pageStories = pageStories.filter(story => story.authorType === 'page');
            
            // Apply privacy filtering for page stories
            pageStories = pageStories.filter(story => {
                if (story.privacy === 'public') {
                    return true; // Public stories visible to all
                }
                if (story.privacy === 'friends') {
                    // For pages, "friends" means followers
                    // Allow if user follows the page OR owns the page
                    return pageIds.includes(story.userId) || ownedPageIds.includes(story.userId);
                }
                return false;
            });
        }

        // Combine user and page stories
        const allFriendStories = [...userStories, ...pageStories];

        if (!allFriendStories.length) {
            return res.status(200).json({ 
                message: 'No stories found in your feed', 
                stories: [] 
            });
        }

        // Filter active and non-expired stories in application code
        const now = new Date();
        const activeStories = allFriendStories.filter(story => {
            const expiresAt = new Date(story.expiresAt);
            return story.isActive && expiresAt > now;
        });

        if (!activeStories.length) {
            return res.status(200).json({ 
                message: 'No active stories found in your feed', 
                stories: [] 
            });
        }

        // Sort stories by creation date (newest first)
        activeStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Get unique user IDs and page IDs from the stories
        const userStoryIds = activeStories.filter(story => !story.authorType || story.authorType !== 'page').map(story => story.userId);
        const pageStoryIds = activeStories.filter(story => story.authorType === 'page').map(story => story.userId);

        const uniqueUserIds = [...new Set(userStoryIds)];
        const uniquePageIds = [...new Set(pageStoryIds)];

        // Create a map to store user and page details
        const userMap = {};
        const pageMap = {};

        // Fetch user details for each unique user ID
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
                } else {
                    // Fallback user data when user is not found
                    console.warn(`User ${id} not found, using fallback data`);
                    userMap[id] = {
                        id: id,
                        firstName: '',
                        lastName: '',
                        username: `user_${id}`,
                        profilePicture: 'https://via.placeholder.com/40',
                        type: 'user'
                    };
                }
            } catch (userError) {
                console.error(`Error fetching user ${id}:`, userError.message);
                // Provide fallback data even when there's an error
                userMap[id] = {
                    id: id,
                    firstName: '',
                    lastName: '',
                    username: `user_${id}`,
                    profilePicture: 'https://via.placeholder.com/40',
                    type: 'user'
                };
            }
        }

        // Fetch page details for each unique page ID
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
                } else {
                    // Fallback page data when page is not found
                    console.warn(`Page ${id} not found, using fallback data`);
                    pageMap[id] = {
                        id: id,
                        firstName: '',
                        lastName: '',
                        username: `page_${id}`,
                        profilePicture: 'https://via.placeholder.com/40',
                        pageName: `Page ${id}`,
                        type: 'page',
                        isPage: true
                    };
                }
            } catch (pageError) {
                console.error(`Error fetching page ${id}:`, pageError.message);
                // Provide fallback data even when there's an error
                pageMap[id] = {
                    id: id,
                    firstName: '',
                    lastName: '',
                    username: `page_${id}`,
                    profilePicture: 'https://via.placeholder.com/40',
                    pageName: `Page ${id}`,
                    type: 'page',
                    isPage: true
                };
            }
        }

        // Group stories by user/page
        const storiesByAuthor = activeStories.reduce((acc, story) => {
            const storyUserId = story.userId;
            const isPageStory = story.authorType === 'page';
            
            if (!acc[storyUserId]) {
                acc[storyUserId] = {
                    user: isPageStory ? pageMap[storyUserId] : userMap[storyUserId],
                    stories: []
                };
                
                // Ensure we have user/page data
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
            
            // Add story with proper _id field for frontend compatibility
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

        // Add debug logging
        console.log('Enhanced Feed stories result:', {
            totalActiveStories: activeStories.length,
            userGroups: feedStories.filter(g => g.user.type === 'user').length,
            pageGroups: feedStories.filter(g => g.user.type === 'page').length,
            totalGroups: feedStories.length
        });

        res.status(200).json({
            message: 'Stories feed retrieved successfully',
            stories: feedStories
        });

    } catch (error) {
        console.error('Error fetching enhanced stories feed:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Helper function to get pages a user follows
const getUserFollowedPages = async (userId) => {
    try {
        const PageService = require('../services/pageService');
        const allPages = await PageService.findAll();
        return allPages.filter(page => 
            page.followers && 
            page.followers.includes(userId) && 
            page.isPublished && 
            page.approvalStatus === 'approved'
        );
    } catch (error) {
        console.error('Error getting followed pages:', error);
        return [];
    }
};



// Get a specific story by 
//Gets the story ID from the URL parameters
// and fetches the story from the database using the Story model
// and checks if the story is expired. If it is, returns a 404 Gone status
const getStoryById = async(req, res) => {
    try {
        const storyId = req.params.id;

        // Fetch the story by ID
        const story = await Story.findById(storyId);

        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        // Check if the story has expired (older than 24 hours)
        if (story.isExpired && typeof story.isExpired === 'function' && story.isExpired()) {
            return res.status(410).json({ message: 'Story has expired' });
        }

        // Fetch the story creator's user data
        const creator = await UserService.findById(story.userId);

        if (!creator) {
            return res.status(404).json({ message: 'Story creator not found' });
        }

        // Ensure that only the story creator and their friends can view the story
        const isCreator = req.user.id === story.userId;
        const isFriend = (creator.friends || []).includes(req.user.id);

        if (!isCreator && !isFriend) {
            return res.status(403).json({ message: 'You do not have permission to view this story' });
        }

        // Respond with the story and minimal user data
        res.status(200).json({
            story,
            user: {
                id: creator.id,
                username: creator.username,
                profilePicture: creator.profilePicture
            }
        });

    } catch (error) {
        console.error('Error fetching story:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark a story as viewed (updated)
const viewStory = async(req, res) => {
    try {
        const storyId = req.params.id;
        const userId = req.user.id;

        if (!storyId) {
            return res.status(400).json({ message: 'Story ID is required' });
        }

        // Get the story
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        // Check if story is expired
        const now = new Date();
        const expiresAt = new Date(story.expiresAt);
        if (now > expiresAt || !story.isActive) {
            return res.status(404).json({ message: 'Story has expired' });
        }

        let hasViewed = story.viewers.includes(userId);
        let updatedStory;

        // If user hasn't viewed the story yet, update viewer list and count
        if (!hasViewed) {
            const updatedViewers = [...story.viewers, userId];
            const updatedViewCount = updatedViewers.length;

            await Story.updateById(storyId, {
                viewers: updatedViewers,
                viewCount: updatedViewCount
            });

            hasViewed = true;
        }

        // Fetch viewer details
        const viewerDetails = [];
        for (const viewerId of story.viewers) {
            const user = await UserService.findById(viewerId);
            if (user) {
                viewerDetails.push({
                    id: user.id,
                    username: user.username,
                    profilePicture: user.profilePicture
                });
            }
        }

        res.status(200).json({
            message: hasViewed ? 'Story already viewed' : 'Story viewed successfully',
            viewCount: story.viewers.length,
            viewers: viewerDetails
        });

    } catch (error) {
        console.error('Error viewing story:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


//@desc     Update a story by story ID
const updateStoryByStoryId = async(req, res) => {
    try {
        const storyId = req.params.id;
        if (!storyId) {
            return res.status(400).json({ message: 'Story ID is required' });
        }

        // Fetch the existing story
        const existingStory = await Story.findById(storyId);
        if (!existingStory) {
            return res.status(404).json({ message: 'Story not found' });
        }

        // Check if the logged-in user is the author
        if (existingStory.userId !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized: You can only update your own stories' });
        }

        const { content, media, type, caption, privacy } = req.body;

        // Prepare update data
        const updateData = {};

        if (content !== undefined) updateData.content = content;
        // if (type !== undefined) updateData.mediaType = type; // fixed incorrect variable name from 'mediaType'
        if (type !== undefined) {
            updateData.type = type; // Fixed: should be 'type', not 'mediaType'
        }
        if (caption !== undefined) updateData.caption = caption;
        if (privacy !== undefined) updateData.privacy = privacy;

        // Upload new media if provided
        if (media) {
            try {
                const mediaUrl = await uploadSingleImage(media, 'story_media');
                updateData.media = mediaUrl;
            } catch (error) {
                return res.status(400).json({ error: 'Failed to upload media', message: error.message });
            }
        }

        // Ensure we have something to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        // Check if the story is expired or inactive
        const now = new Date();
        const expiresAt = new Date(existingStory.expiresAt);
        if (now > expiresAt || !existingStory.isActive) {
            return res.status(400).json({ message: 'Cannot update an expired or inactive story' });
        }

        // Add updatedAt timestamp
        updateData.updatedAt = new Date().toISOString();

        // Perform the update
        const updatedStory = await Story.updateById(storyId, updateData);
        if (!updatedStory) {
            return res.status(500).json({ message: 'Failed to update story' });
        }

        // Fetch the author's data
        const author = await UserService.findById(updatedStory.userId);
        if (!author) {
            return res.status(404).json({ message: 'Author not found' });
        }

        // Compose response with author info
        const populatedStory = {
            ...updatedStory,
            author: {
                id: author.id,
                firstName: author.firstName,
                lastName: author.lastName,
                username: author.username,
                profilePicture: author.profilePicture
            }
        };

        res.status(200).json({ message: 'Story updated successfully', story: populatedStory });
    } catch (error) {
        console.error('Update story error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};


//@desc     Delete a story by story ID (admin function)
const deleteStoryByStoryId = async(req, res) => {
    try {
        const storyId = req.params.id;

        if (!storyId) {
            return res.status(400).json({ message: 'Story ID is required' });
        }

        // Fetch the story
        const existingStory = await Story.findById(storyId);
        if (!existingStory) {
            return res.status(404).json({ message: 'Story not found' });
        }

        // Authorization check
        const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
        const isOwner = existingStory.userId === req.user.id;

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Unauthorized: Only the owner or an admin can delete the story' });
        }

        await deleteImages(existingStory.media);

        // Perform the deletion
        const deleted = await Story.deleteById(storyId);
        if (!deleted) {
            return res.status(500).json({ message: 'Failed to delete story' });
        }

        res.status(200).json({ message: 'Story deleted successfully' });
    } catch (error) {
        console.error('Delete story error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = {
    createStory, //done
    getCurrentUserStories,
    getStoriesFeed, //done
    getStoryById, //done
    viewStory, //done
    updateStoryByStoryId, //done
    deleteStoryByStoryId, //done
};