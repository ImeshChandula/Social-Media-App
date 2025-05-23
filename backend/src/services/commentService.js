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
        const commentsSnapshot = await commentsCollection
                .where('post', '==', postId)
                .orderBy('createdAt', 'desc')
                .get();
        
        if (commentsSnapshot.empty) {
            return [];
        }

        const comments = commentsSnapshot.docs.map(doc => new Comment(doc.id, doc.data()));
        return comments
        } catch (error) {
            console.error('Error finding comments by post ID:', error);
            throw error;
        }
    },

    // find by user id
    async findByUserId(userId) {
        try {
        const commentRef = await commentsCollection
                .where('user', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();
        if (commentRef.empty) {
            return [];
        }
        
        const comments = commentRef.docs.map(doc => new Comment(doc.id, doc.data()));

        return comments;
        } catch (error) {
        console.error('Error finding comments by user ID:', error);
        throw error;
        }
    },

    // Save comment to database
    async create(commentData) {
        try { 
            commentData.updatedAt = new Date().toISOString();
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

            const updatedComment = await CommentService.findById(id);
            return updatedComment;
        } catch (error) {
            throw error;
        }
    },

};

module.exports = CommentService;