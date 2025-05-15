const { connectFirebase } = require('../config/firebase');

const db = connectFirebase();
const postCollection = db.collection('posts');

class Post {
    constructor(id, postData) {
        this.id = id;
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

        this.createdAt = postData.createdAt || new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    };



    // static methods
    static async findById(id) {
        try {
            const doc = await postCollection.doc(id).get();
            if (!doc.exists) {
                return null;
            }

            return new Post(doc.id, doc.data());
        } catch (error) {
            throw error;
        }
    };

    // save post to database
    static async create(postData) {
        try {
            const docRef = await postCollection.add(postData);
            return new Post(docRef.id, postData);
        } catch (error) {
            throw error;
        }
    };

    // Update post
    static async update(id, updateData) {
        try {
            updateData.updatedAt = new Date().toISOString();
        
            await postCollection.doc(id).update(updateData);
        
            const updatedPost = await Post.findById(id);
            return updatedPost;
        } catch (error) {
            throw error;
        }
    };

    // delete post
    static async delete(id) {
        try {
            await postCollection.doc(id).delete();
            return true;
        } catch (error) {
            throw error;
        }
    };

    // get all posts
    static async findAll() {
        try {
            const postRef = await postCollection.get();
            return postRef.docs.map(doc => new Post(doc.id, doc.data()));
        } catch (error) {
            throw error;
        }
    };
    


    // get comment count
    get commentCount() {
        return this.comments.length;
    };

    // get like count
    get likeCount() {
        return this.likes.length;
    };

    // get share count
    get shareCount() {
        return this.shares.length;
    };


}


module.exports = Post;