// using firebase
const { connectFirebase } = require('../config/firebase');
const {db} = connectFirebase();
const commentsCollection = db.collection('comments');

class Comment {
  constructor(id, commentData) {
    this.id = id;
    this.post = commentData.post;
    this.user = commentData.user;
    this.text = commentData.text;
    this.media = commentData.media || null;

    this.likes = commentData.likes || [];
    this.replies = commentData.replies || [];
    
    this.createdAt = commentData.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  };

  // find by comment id
  static async findById(id) {
    try {
      const doc = await commentsCollection.doc(id).get();
      if (!doc.exists) return null;
      
      return new Comment(doc.id, doc.data());
    } catch (error) {
      throw error;
    }
  };

  // find by post id
  static async findByPostId(postId) {
    try {
      const commentsSnapshot = await commentsCollection.where('post', '==', postId).get();
      
      if (commentsSnapshot.empty) {
        return res.status(200).json({msg: 'No comments found for this post', comments: [] });
      }

      const comments = commentsSnapshot.docs.map(doc => new Comment(doc.id, doc.data()));

      return comments.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    } catch (error) {
        console.error('Error finding comments by post ID:', error);
        throw error;
    }
  };

  // find by user id
  static async findByUserId(userId) {
    try {
      const commentRef = await commentsCollection.where('user', '==', userId).get();
      
      const comments = commentRef.docs.map(doc => new Comment(doc.id, doc.data()));

      return comments.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    } catch (error) {
      console.error('Error finding comments by user ID:', error);
      throw error;
    }
  };

  // Save comment to database
  static async create(commentData) {
    try { 
      const docRef = await commentsCollection.add(commentData);
      return new Comment(docRef.id, commentData);
    } catch (error) {
      throw error;
    }
  };

  // Delete comment
  static async deleteById(id) {
    try {
      await commentsCollection.doc(id).delete();
       return true;
    } catch (error) {
      throw error;
    }
  };

  // Update comment
  static async updateById(id, updateData) {
    try {
      await commentsCollection.doc(id).update(updateData);
      updateData.updatedAt = new Date().toISOString();

      const updatedComment = await Comment.findById(id);
      return updatedComment;
    } catch (error) {
      throw error;
    }
  };
  
  // get like count
  get likeCount() {
    return this.likes.length;
  };
}

module.exports=Comment;