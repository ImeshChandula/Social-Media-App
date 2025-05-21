const { connectFirebase } = require('../config/firebase');
const Story = require('../models/Story');

const {db} = connectFirebase();
const storiesCollection = db.collection('stories');

const StoryService = {
    // Find all stories by user ID
    async findAllByUserId(id) {
        try {
            const storyRef = await storiesCollection.where('userId', '==', id).get();
            
            const posts = storyRef.docs.map(doc => new Story(doc.id, doc.data()));

            return posts.sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
        } catch (error) {
            console.error('Error finding stories by user ID:', error);
            throw error;
        }
    },
};

module.exports = StoryService;