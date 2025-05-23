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
};

module.exports = StoryService;