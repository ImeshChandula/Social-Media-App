const { connectFirebase } = require('../config/firebase');
const {db} = connectFirebase();
const storiesCollection = db.collection('stories');

class Story {
  constructor(id, storyData) {
    this.id = id;
    this.userId = storyData.userId;
    this.authorType = storyData.authorType || 'user'; // 'user' or 'page'
    this.content = storyData.content ;
    this.media = storyData.media ;
    
    this.mediaType = storyData.mediaType;
    this.type = storyData.type || this.mediaType; // Support both 'type' and 'mediaType'
    this.caption = storyData.caption;
    
    this.viewers = storyData.viewers || [];
    this.viewCount = storyData.viewCount || 0;
    
    this.privacy = storyData.privacy || 'friends';
    this.isActive = storyData.isActive || true;
    this.expiresAt = storyData.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    this.createdAt = storyData.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  // Check if this is a page story
  get isPageStory() {
    return this.authorType === 'page';
  }

  // Check if this is a user story
  get isUserStory() {
    return this.authorType === 'user';
  }

  // Find stories by user ID using a simple query
  static async findByUserIdSimple(userId) {
    const snapshot = await db.collection('stories')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
      
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  // Find stories by page ID
  static async findByPageIdSimple(pageId) {
    const snapshot = await db.collection('stories')
      .where('userId', '==', pageId)
      .where('authorType', '==', 'page')
      .orderBy('createdAt', 'desc')
      .get();
      
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  // Enhanced method to get stories for feed with proper privacy filtering
  static async getStoriesForFeedWithPrivacy(userIds, pageIds, requestingUserId, followedPageIds = []) {
    if ((!userIds || userIds.length === 0) && (!pageIds || pageIds.length === 0)) {
        return [];
    }

    let allStories = [];

    // Get user stories
    if (userIds && userIds.length > 0) {
        const userStories = await Story.getFriendsStoriesSimple(userIds);
        // Filter user stories - only include user type stories
        const filteredUserStories = userStories.filter(story => 
            !story.authorType || story.authorType === 'user'
        );
        allStories.push(...filteredUserStories);
    }

    // Get page stories with privacy filtering
    if (pageIds && pageIds.length > 0) {
        const pageStories = await Story.getFriendsStoriesSimple(pageIds);
        // Filter page stories with privacy rules
        const filteredPageStories = pageStories.filter(story => {
            // Only include stories marked as page stories
            if (story.authorType !== 'page') return false;
            
            // Apply privacy filtering
            if (story.privacy === 'public') {
                return true; // Public stories visible to everyone
            }
            
            if (story.privacy === 'friends') {
                // For pages, "friends" means followers
                // Allow if user follows the page or owns the page
                return followedPageIds.includes(story.userId) || pageIds.includes(story.userId);
            }
            
            return false;
        });
        allStories.push(...filteredPageStories);
    }

    // Sort by creation date (newest first)
    return allStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Method to get all stories by page ID with proper filtering
  static async findByPageIdWithPrivacy(pageId, requestingUserId = null, isFollower = false) {
    const snapshot = await db.collection('stories')
        .where('userId', '==', pageId)
        .where('authorType', '==', 'page')
        .orderBy('createdAt', 'desc')
        .get();
    
    const stories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    
    // Apply privacy filtering if requesting user is provided
    if (requestingUserId) {
        return stories.filter(story => {
            if (story.privacy === 'public') return true;
            if (story.privacy === 'friends') {
                // Check if requesting user follows this page or owns it
                return isFollower || story.userId === requestingUserId;
            }
            return false;
        });
    }
    
    return stories;
  }

  // Enhanced method to get user stories with author type filtering
  static async findUserStoriesByIds(userIds) {
    if (!userIds || userIds.length === 0) {
        return [];
    }

    const stories = await Story.getFriendsStoriesSimple(userIds);
    
    // Filter to only include user stories
    return stories.filter(story => !story.authorType || story.authorType === 'user');
  }

  // Enhanced method to get page stories with author type filtering
  static async findPageStoriesByIds(pageIds) {
    if (!pageIds || pageIds.length === 0) {
        return [];
    }

    const stories = await Story.getFriendsStoriesSimple(pageIds);
    
    // Filter to only include page stories
    return stories.filter(story => story.authorType === 'page');
  }

  // Get combined feed stories with proper separation and privacy
  static async getCombinedFeedStories(userId, friendIds, followedPageIds, ownedPageIds) {
    const userIdsToFetch = [...friendIds, userId];
    const allPageIds = [...new Set([...followedPageIds, ...ownedPageIds])];

    let userStories = [];
    let pageStories = [];

    // Get user stories
    if (userIdsToFetch.length > 0) {
        userStories = await Story.findUserStoriesByIds(userIdsToFetch);
    }

    // Get page stories with privacy filtering
    if (allPageIds.length > 0) {
        const allPageStories = await Story.findPageStoriesByIds(allPageIds);
        
        // Apply privacy filtering
        pageStories = allPageStories.filter(story => {
            if (story.privacy === 'public') {
                return true; // Public stories visible to all
            }
            if (story.privacy === 'friends') {
                // For pages, "friends" means followers
                // Allow if user follows the page OR owns the page
                return followedPageIds.includes(story.userId) || ownedPageIds.includes(story.userId);
            }
            return false;
        });
    }

    // Combine and sort
    const allStories = [...userStories, ...pageStories];
    return allStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Filter active stories (non-expired and active)
  static filterActiveStories(stories) {
    const now = new Date();
    return stories.filter(story => {
        const expiresAt = new Date(story.expiresAt);
        return story.isActive && expiresAt > now;
    });
  }

  // Group stories by author with proper user/page data handling
  static groupStoriesByAuthor(stories, userMap, pageMap) {
    return stories.reduce((acc, story) => {
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
  }

  // save story to database
  static async create(storyData) {
    try {
      storyData.createdAt = new Date().toISOString();
      const docRef = await storiesCollection.add(storyData);
      return new Story(docRef.id, storyData);
    } catch (error) {
      throw error;
    }
  }

  // Update Story
  static async updateById(id, updateData) {
    try {
        updateData.updatedAt = new Date().toISOString();
    
        await storiesCollection.doc(id).update(updateData);
    
        const updatedStory = await Story.findById(id);
        return updatedStory;
    } catch (error) {
        throw error;
    }
  }

  // delete story
  static async deleteById(id) {
    try {
        await storiesCollection.doc(id).delete();
        return true;
    } catch (error) {
        throw error;
    }
  }
  
  // Add a viewer to the story
  async addViewer(userId) {
    try {
      if (!this.viewers.includes(userId)) {
        this.viewers.push(userId);
        this.viewCount = this.viewers.length;
        await this.save();
      }
      return this.viewCount;
    } catch (error) {
      throw error;
    }
  }
  
  // Get all active stories
  static async findAll() {
    try {
      const now = new Date().toISOString();
      const snapshot = await storiesCollection
        .where('expiresAt', '>', now)
        .where('isActive', '==', true)
        .orderBy('expiresAt')
        .get();
      
      if (snapshot.empty) {
        return [];
      }
      
      const stories = [];
      
      snapshot.forEach(doc => {
        const storyData = doc.data();
        const story = new Story(storyData);
        story.id = doc.id;
        stories.push(story);
      });
      
      return stories;
    } catch (error) {
      throw error;
    }
  }

  // Find story by ID
  static async findById(id) {
    try {
      const doc = await storiesCollection.doc(id).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return new Story(doc.id, doc.data());
    } catch (error) {
      throw error;
    }
  }

  // Simplified query - only uses userId IN filter (supports both user and page stories)
  static async getFriendsStoriesSimple(userIds) {
      if (!userIds || userIds.length === 0) {
          return [];
      }

      // Firestore IN query limit is 10 items
      if (userIds.length > 10) {
          // Split into batches if more than 10 IDs
          const batches = [];
          for (let i = 0; i < userIds.length; i += 10) {
              const batch = userIds.slice(i, i + 10);
              const snapshot = await db.collection('stories')
                  .where('userId', 'in', batch)
                  .orderBy('createdAt', 'desc')
                  .get();
              
              batches.push(...snapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data()
              })));
          }
          
          // Sort all results by createdAt
          return batches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      const snapshot = await db.collection('stories')
          .where('userId', 'in', userIds)
          .orderBy('createdAt', 'desc')
          .get();

      return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
      }));
  }

  // Find all stories by user ID
  static async findAllByUserId(id) {
    try {
      const storyRef = await storiesCollection.where('userId', '==', id).get();
      
      const stories = storyRef.docs.map(doc => new Story(doc.id, doc.data()));

      return stories.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    } catch (error) {
      console.error('Error finding stories by user ID:', error);
      throw error;
    }
  }
  
  // Delete a story
  static async findByIdAndDelete(id) {
    try {
      const docRef = storiesCollection.doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        return null;
      }
      
      await docRef.delete();
      return { id };
    } catch (error) {
      throw error;
    }
  }

  // Get story statistics
  static async getStoryStats(storyId) {
    try {
      const story = await Story.findById(storyId);
      if (!story) return null;

      return {
        viewCount: story.viewCount || 0,
        viewerCount: story.viewers ? story.viewers.length : 0,
        isActive: story.isActive,
        expiresAt: story.expiresAt,
        authorType: story.authorType,
        privacy: story.privacy
      };
    } catch (error) {
      throw error;
    }
  }

  // Check if story has expired
  isExpired() {
    const now = new Date();
    const expiresAt = new Date(this.expiresAt);
    return now > expiresAt;
  }

  // Check if user can view this story based on privacy settings
  canUserView(userId, isFollower = false, isOwner = false) {
    // Owner can always view
    if (isOwner || this.userId === userId) return true;

    // Check if story is active and not expired
    if (!this.isActive || this.isExpired()) return false;

    // Apply privacy rules
    if (this.privacy === 'public') return true;
    
    if (this.privacy === 'friends') {
      if (this.authorType === 'page') {
        // For pages, "friends" means followers
        return isFollower;
      } else {
        // For users, "friends" means actual friends - this would need friend check
        return isFollower; // Assuming isFollower represents friend status for users
      }
    }

    if (this.privacy === 'private') {
      return false; // Only owner can see private stories
    }

    return false;
  }
}

module.exports = Story;