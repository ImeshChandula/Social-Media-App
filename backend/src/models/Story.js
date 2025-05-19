const { connectFirebase } = require('../config/firebase');

const db = connectFirebase();
const storiesCollection = db.collection('stories');

class Story {
  constructor(id, storyData) {
    this.id = id;
    this.userId = storyData.userId;
    this.content = storyData.content || null;
    this.mediaUrl = storyData.mediaUrl || null;
    
    // Optional fields with defaults
    this.type = this.validateType(storyData.type) || 'image';
    this.caption = storyData.caption || '';
    this.filter = storyData.filter || 'none';
    this.backgroundColor = storyData.backgroundColor || null;
    this.textColor = storyData.textColor || null;
    this.font = storyData.font || 'default';
    
    // View tracking
    this.viewers = storyData.viewers || [];
    this.viewCount = storyData.viewCount || 0;
    
    // Privacy settings
    this.privacy = this.validatePrivacy(storyData.privacy) || 'friends';
    
    // Status
    this.isActive = storyData.isActive !== undefined ? storyData.isActive : true;
    
    // Auto-expire after 24 hours (timestamp when story will expire)
    this.expiresAt = storyData.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    // Timestamps
    this.createdAt = storyData.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
  
  // Validate story type
  validateType(type) {
    const validTypes = ['image', 'video', 'text'];
    return validTypes.includes(type) ? type : 'image';
  }
  
  // Validate privacy setting
  validatePrivacy(privacy) {
    const validPrivacy = ['public', 'friends', 'close-friends', 'custom'];
    return validPrivacy.includes(privacy) ? privacy : 'friends';
  }

  // Save story to database
  async save() {
    try {
      this.updatedAt = new Date();
      
      if (this.id) {
        // Update existing story
        await storiesCollection.doc(this.id).update(this.toFirestore());
        return this.id;
      } else {
        // Create new story
        const docRef = await storiesCollection.add(this.toFirestore());
        this.id = docRef.id;
        return this.id;
      }
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
  
  // Check if story is expired
  isExpired() {
    return new Date() > this.expiresAt;
  }
  
  // Static methods
  
  // Get all active stories
  static async find() {
    try {
      // Get stories that haven't expired yet
      const now = new Date();
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
      
      const storyData = doc.data();
      const story = new Story(storyData);
      story.id = doc.id;
      
      return story;
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
