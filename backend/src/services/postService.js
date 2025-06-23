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
            postData.createdAt = new Date().toISOString();

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
        
            const updatedPost = await PostService.findById(id);
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
            const postRef = await postCollection.orderBy('createdAt', 'desc').get();

            if (postRef.empty) {
                return [];
            }
            const posts = postRef.docs.map(doc => new Post(doc.id, doc.data()));
            return posts;
        } catch (error) {
            throw error;
        }
    },

    // get all videos
    async findByMediaType(type) {
        try {
            const postRef = await postCollection
                    .where('mediaType', '==', type)
                    .orderBy('createdAt', 'desc')
                    .get();
            if (postRef.empty) {
                return [];
            }

            const posts = postRef.docs.map(doc => new Post(doc.id, doc.data()));
            return posts
        } catch (error) {
            console.error('Error finding posts by media type', error);
            throw error;
        }
    },
    
    // Find posts by user ID
    async findByUserId(userId) {
        try {
            const postRef = await postCollection
                    .where('author', '==', userId)
                    .orderBy('createdAt', 'desc')
                    .get();
            
            if (postRef.empty) {
                return [];
            }
            
            const posts = postRef.docs.map(doc => new Post(doc.id, doc.data()));
            return posts;
        } catch (error) {
            console.error('Error finding posts by user ID:', error);
            throw error;
        }
    },

    
    // Find posts for feed 
    async findForFeed() {
        try {
            const postRef = await postCollection
                .where('privacy', 'in', ['public', 'friends'])
                .orderBy('createdAt', 'desc')
                .get();
            
            return postRef.docs.map(doc => new Post(doc.id, doc.data()));
        } catch (error) {
            throw error;
        }
    },
};

module.exports = PostService;