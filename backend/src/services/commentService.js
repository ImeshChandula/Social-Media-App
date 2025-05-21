const { connectFirebase } = require('../config/firebase');
const Comment = require('../models/Comment');

const {db} = connectFirebase();
const commentsCollection = db.collection('comments');

const CommentService = {
    // find by comment id
    async findById(id) {
        try {
        const doc = await commentsCollection.doc(id).get();
        if (!doc.exists) return null;
        
        return new Comment(doc.id, doc.data());
        } catch (error) {
        throw error;
        }
    },

    // find by post id
    async findByPostId(postId) {
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
    },

    // find by user id
    async findByUserId(userId) {
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
    },

    // Save comment to database
    async create(commentData) {
        try { 
        const docRef = await commentsCollection.add(commentData);
        return new Comment(docRef.id, commentData);
        } catch (error) {
        throw error;
        }
    },

    // Delete comment
    async deleteById(id) {
        try {
        await commentsCollection.doc(id).delete();
        return true;
        } catch (error) {
        throw error;
        }
    },

    // Update comment
    async updateById(id, updateData) {
        try {
        await commentsCollection.doc(id).update(updateData);
        updateData.updatedAt = new Date().toISOString();

        const updatedComment = await Comment.findById(id);
        return updatedComment;
        } catch (error) {
        throw error;
        }
    },

};

module.exports = CommentService;