const { connectFirebase } = require('../config/firebase');
const Story = require('../models/Story');

const {db} = connectFirebase();
const storiesCollection = db.collection('stories');

const StoryService = {
    // Find all stories by user ID
    async findAllByUserId(id) {
        try {
            const storyRef = await storiesCollection
                    .where('userId', '==', id)
                    .orderBy('createdAt', 'desc')
                    .get();
            if (storyRef.empty) {
                return [];
            }
            
            const stories = storyRef.docs.map(doc => new Story(doc.id, doc.data()));

            return stories;
        } catch (error) {
            console.error('Error finding stories by user ID:', error);
            throw error;
        }
    },

    // NEW: Find page stories by page ID
    async findByPageId(pageId) {
        try {
            const storyRef = await storiesCollection
                    .where('userId', '==', pageId)
                    .where('authorType', '==', 'page')
                    .get();
            
            if (storyRef.empty) {
                return [];
            }
            
            const stories = storyRef.docs.map(doc => new Story(doc.id, doc.data()));
            
            // Sort by creation date (newest first)
            stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            return stories;
        } catch (error) {
            console.error('Error finding page stories:', error);
            throw error;
        }
    },

    // NEW: Find stories for feed including pages the user follows
    async findForFeedWithPages(userIds, followedPageIds = []) {
        try {
            // Combine user IDs and page IDs
            const allIds = [...userIds, ...followedPageIds];
            
            if (allIds.length === 0) {
                return [];
            }

            // Get stories from users and pages
            const storyRef = await storiesCollection
                    .where('userId', 'in', allIds)
                    .get();
            
            if (storyRef.empty) {
                return [];
            }
            
            const stories = storyRef.docs.map(doc => new Story(doc.id, doc.data()));
            
            // Sort by creation date (newest first)
            stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            return stories;
        } catch (error) {
            console.error('Error finding feed stories with pages:', error);
            throw error;
        }
    }
};

module.exports = StoryService;