const { connectFirebase } = require('../config/firebase');

const {db} = connectFirebase();
const storiesCollection = db.collection('stories');

class Story {
  constructor(id, storyData) {
    this.id = id;
    this.userId = storyData.userId;
    this.content = storyData.content ;
    this.media = storyData.media ;
    
    this.mediaType = storyData.mediaType;
    this.caption = storyData.caption;
    
    
    this.viewers = storyData.viewers || [];
    this.viewCount = storyData.viewCount || 0;
    
    this.privacy = storyData.privacy || 'friends';
    this.isActive = storyData.isActive || true;
    this.expiresAt = storyData.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    this.createdAt = storyData.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  };

      //Previous method to find stories by user ID
      // static methods
    // static async findById(id) {
    //     try {
    //         const doc = await storiesCollection.doc(id).get();
    //         if (!doc.exists) {
    //             return null;
    //         }

    //         return new Story(doc.id, doc.data());
    //     } catch (error) {
    //         throw error;
    //     }
    // };

    //new one
  // Find stories by user ID using a simple query
    // Simple query - only requires single-field index on userId
  static async findByUserIdSimple(userId) {
    // Query only by userId, filter other conditions in application
    const snapshot = await db.collection('stories')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
      
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
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
  };

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
    };

  // delete story
    static async deleteById(id) {
        try {
            await storiesCollection.doc(id).delete();
            return true;
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
      
      return new Story(doc.id, doc.data());
    } catch (error) {
      throw error;
    }
  }
    
  
  
  //Previous method to find stories by user ID
  // // Find stories by user ID
  // static async findByUserId(userId) {
  //   try {
  //     const now = new Date();
  //     const snapshot = await storiesCollection
  //       .where('userId', '==', userId)
  //       .where('expiresAt', '>', now)
  //       .where('isActive', '==', true)
  //       .orderBy('expiresAt')
  //       .get();
      
  //     if (snapshot.empty) {
  //       return [];
  //     }
      
  //     const stories = [];
      
  //     snapshot.forEach(doc => {
  //       const storyData = doc.data();
  //       const story = new Story(storyData);
  //       story.id = doc.id;
  //       stories.push(story);
  //     });
      
  //     return stories;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // new method to get friends' stories
  // Simplified query - only uses userId IN filter
    static async getFriendsStoriesSimple(friendIds) {
        if (!friendIds || friendIds.length === 0) {
            return [];
        }

        // Firestore IN query limit is 10 items
        if (friendIds.length > 10) {
            throw new Error('Friend IDs batch too large. Use batched approach.');
        }

        const snapshot = await db.collection('stories')
            .where('userId', 'in', friendIds)
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
