const e = require('express');
const { connectFirebase } = require('../config/firebase');
const db = connectFirebase();
const postCollection = db.collection('posts');

class Post {
    constructor(postData) {
        this.author = postData.author;
        this.content = postData.content;
        this.media = postData.media || [];
        this.tags = postData.tags || [];
        this.privacy = postData.privacy || 'public';
        this.location = postData.location || null;

        this.likes = postData.likes || [];
        this.comments = postData.comments || [];
        this.shares = postData.shares || [];

        this.isEdited = postData.isEdited || false;
        this.editHistory = postData.editHistory || [];

        this.createdAt = postData.createdAt || new Date();
        this.updatedAt = postData.updatedAt || new Date();
    };

    // save post to database
    async save() {
        try {
            this.updatedAt = new Date();

            if (this.id) {
                // update existing post
                await postCollection.doc(this.id).update(this.toFirestore());
                return this.id;
            } else {
                // create new post
                const docRef = await postCollection.add(this.toFirestore());
                this.id = docRef.id;
                return this.id;
            }
        } catch (error) {
            throw error;
        }
    };

    // Convert to Firestore compatible object
    toFirestore() {
        const post = { ...this };
        delete post.id;  // Remove id property as it's stored as document ID
        return post;
    };

    // delete post
    async remove() {
        try {
            if (!this.id){
                throw new Error('Post ID not defined');
            }

            await postCollection.doc(this.id).delete();

            return true;
        } catch (error) {
            throw error;
        }
    };





    // static methods
    static async findById(id) {
        try {
            const doc = await postCollection.doc(id).get();
            if (!doc.exists) {
                return null;
            }

            const postData = doc.data();
            const post = new Post(postData);
            post.id = doc.id;

            return post;
        } catch (error) {
            throw error;
        }
    };

    static async find(filter = {}) {
        try {
            let query = postCollection;

            // build query from filter
            if (filter.$or) {
                // Firestore doesn't directly support $or, we need to use multiple queries
                const orConditions = filter.$or;

                // For OR conditions related to author
                if (orConditions.some(c => c.author)) {
                    const authorIds = orConditions
                    .filter(c => c.author || c.author?.$in)
                    .map(c => c.author.$in ? c.author.$in : [c.author])
                    .flat();
                    
                    if (authorIds.length > 0) {
                        // Firestore 'in' operator requires at least one value
                        query = query.where('author', 'in', authorIds);
                    }
                }

                // For privacy filter
                const privacyCondition = orConditions.find(c => c.privacy);
                if (privacyCondition) {
                    query = query.where('privacy', '==', privacyCondition.privacy);
                }
            } else {
                Object.keys(filter).forEach(key => {
                    if (typeof filter[key] === 'object' && filter[key] !== null) {
                      // Handle special query operators
                      if (filter[key].$in) {
                        query = query.where(key, 'in', filter[key].$in);
                      }
                    } else {
                      query = query.where(key, '==', filter[key]);
                    }
                  });
            }

            return query;
        } catch (error) {
            throw error;
        }
    };


    

    // get comment count
    get commentCount() {
        return this.comments.length;
    };

    // get comment count
    get likeCount() {
        return this.likes.length;
    };

    // get comment count
    get shareCount() {
        return this.shares.length;
    };


}


module.exports = Post;