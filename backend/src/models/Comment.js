// using firebase
const { connectFirebase } = require('../config/firebase');
const db = connectFirebase();
const commentsCollection = db.collection('comments');

class Comment {
  constructor(commentData) {
    this.post = commentData.post;
    this.user = commentData.user;
    this.text = commentData.text;
    this.media = commentData.media || null;
    this.likes = commentData.likes || [];
    this.replies = commentData.replies || [];
    this.createdAt = commentData.createdAt || new Date();
    this.updatedAt = commentData.updatedAt || new Date();
  }

  // Save comment to database
  async save() {
    try {
      this.updatedAt = new Date(); 

      if (this.id) {
        // Update existing comment
        await commentsCollection.doc(this.id).update(this.toFirestore());
        return this.id;
      } else {
        // Create new comment
        const docRef = await commentsCollection.add(this.toFirestore());
        this.id = docRef.id;
        return this.id;
      }
    } catch (error) {
      throw error;
    }
  }

  // Convert to Firestore compatible object
  toFirestore() {
    const comment = { ...this }; // After this we will get a plain JavaScript object with the same properties.
    delete comment.id;  // Remove id property as it's stored as document ID
    return comment;
  }

  // Delete comment
  async remove() {
    try {
      if (!this.id) throw new Error('Comment ID not defined');
      await commentsCollection.doc(this.id).delete();
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Static methods
  static async findById(id) {
    try {
      const doc = await commentsCollection.doc(id).get();
      if (!doc.exists) return null;
      
      const commentData = doc.data(); // Extracts the plain JavaScript object stored in the Firestore document
      const comment = new Comment(commentData); // Creates a new Comment class instance using the data fetched from Firestore.
      comment.id = doc.id; // Assigns the document ID to the comment instance.
      return comment;
    } catch (error) {
      throw error;
    }
  }

  static async find(filter) {
    try {
      let query = commentsCollection;
      
      // Build query from filter
      Object.keys(filter).forEach(key => {
        query = query.where(key, '==', filter[key]);
      });
      
      return query;
    } catch (error) {
      throw error;
    }
  }
}

module.exports=Comment;