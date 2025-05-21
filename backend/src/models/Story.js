const { connectFirebase } = require('../config/firebase');

const {db} = connectFirebase();
const storiesCollection = db.collection('stories');

class Story {
  constructor(id, storyData) {
    this.id = id;
    this.userId = storyData.userId;
    this.content = storyData.content || null;
    this.mediaUrl = storyData.mediaUrl || null;
    
    this.mediaType = storyData.mediaType || null;
    this.caption = storyData.caption || '';
    this.filter = storyData.filter || 'none';
    this.backgroundColor = storyData.backgroundColor || null;
    this.textColor = storyData.textColor || null;
    this.font = storyData.font || 'default';
    
    this.viewers = storyData.viewers || [];
    this.viewCount = storyData.viewCount || 0;
    
    this.privacy = storyData.privacy || 'friends';
    this.isActive = storyData.isActive || true;
    this.expiresAt = storyData.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    this.createdAt = storyData.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  };
  

  // save story to database
  static async create(storyData) {
    try {
      const docRef = await storiesCollection.add(storyData);
      return new Post(docRef.id, storyData);
    } catch (error) {
      throw error;
    }
  };
  
  
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
      // Get stories that haven't expired yet
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
      
      return new Post(doc.id, doc.data());
    } catch (error) {
      throw error;
    }
  }
  
  // Find stories by user ID
  static async findByUserId(userId) {
    try {
      const now = new Date();
      const snapshot = await storiesCollection
        .where('userId', '==', userId)
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

  // Find all stories by user ID
  static async findAllByUserId(id) {
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
  };
  
  // Get stories from friends
  static async getFriendsStories(userIds) {
    try {
      const now = new Date();
      const stories = [];
      
      // Firestore doesn't support direct array queries with multiple values
      // So we need to get stories for each user ID
      for (const userId of userIds) {
        const snapshot = await storiesCollection
          .where('userId', '==', userId)
          .where('expiresAt', '>', now)
          .where('isActive', '==', true)
          .orderBy('expiresAt')
          .get();
        
        snapshot.forEach(doc => {
          const storyData = doc.data();
          const story = new Story(storyData);
          story.id = doc.id;
          stories.push(story);
        });
      }
      
      // Sort by created time (newest first)
      return stories.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
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
}

module.exports = Story;
