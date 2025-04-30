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


module.exports = post;