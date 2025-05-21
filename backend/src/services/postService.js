const { connectFirebase } = require('../config/firebase');
const Post = require('../models/Post');

const { db } = connectFirebase();
const postCollection = db.collection('posts');

const PostService = {
    // static methods
    async findById(id) {
        try {
            const doc = await postCollection.doc(id).get();
            if (!doc.exists) {
                return null;
            }

            return new Post(doc.id, doc.data());
        } catch (error) {
            throw error;
        }
    },

    // save post to database
    async create(postData) {
        try {
            const docRef = await postCollection.add(postData);
            return new Post(docRef.id, postData);
        } catch (error) {
            throw error;
        }
    },

    // Update post
    async updateById(id, updateData) {
        try {
            updateData.updatedAt = new Date().toISOString();
        
            await postCollection.doc(id).update(updateData);
        
            const updatedPost = await Post.findById(id);
            return updatedPost;
        } catch (error) {
            throw error;
        }
    },

    // delete post
    async deleteById(id) {
        try {
            await postCollection.doc(id).delete();
            return true;
        } catch (error) {
            throw error;
        }
    },

    // get all posts
    async findAll() {
        try {
            const postRef = await postCollection.get();

            const posts = postRef.docs.map(doc => new Post(doc.id, doc.data()));
            return posts.sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
        } catch (error) {
            throw error;
        }
    },

    // get all videos
    async findByMediaType(type) {
        try {
            const postRef = await postCollection.where('mediaType', '==', type).get();
            const posts = postRef.docs.map(doc => new Post(doc.id, doc.data()));

            return posts.sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
        } catch (error) {
            console.error('Error finding posts by media type', error);
            throw error;
        }
    },
    
    // Find posts by user ID
    async findByUserId(userId) {
        try {
            const postRef = await postCollection.where('author', '==', userId).get();
            
            /*if (postRef.empty) {
                const objectPostRef = await postCollection
                    .where('author.id', '==', userId)
                    .orderBy('createdAt', 'desc')
                    .get();
            
                return objectPostRef.docs.map(doc => new Post(doc.id, doc.data()));
            }*/

            const posts = postRef.docs.map(doc => new Post(doc.id, doc.data()));

            return posts.sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
        } catch (error) {
            console.error('Error finding posts by user ID:', error);
            throw error;
        }
    },

    // Here you might want more complex logic depending on your feed requirements
    // For example, getting posts from users the current user follows
    // This is a simple implementation that gets the most recent posts
    // Find posts for feed (could be based on user's following list or other criteria)
    async findForFeed(userId, limit = 10) {
        try {
            const postRef = await postCollection
                .where('privacy', '==', 'public')
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();
            
            return postRef.docs.map(doc => new Post(doc.id, doc.data()));
        } catch (error) {
            throw error;
        }
    },
};

module.exports = PostService;