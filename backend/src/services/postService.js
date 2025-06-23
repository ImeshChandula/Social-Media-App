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
    async findForFeed(currentUserId, userFriends = [], limit = 50) {
        try {
            const posts = [];
        
            // 1. Get all public posts
            const publicPostsRef = await postCollection
                .where('privacy', '==', 'public')
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();
            
            console.log("public posts: " + publicPostsRef.size);

            publicPostsRef.docs.forEach(doc => {
                posts.push(new Post(doc.id, doc.data()));
            });
            
            // 2. Get friends-only posts from user's friends
            if (userFriends.length > 0) {
                const friendsPostsRef = await postCollection
                    .where('privacy', '==', 'friends')
                    .orderBy('createdAt', 'desc')
                    .limit(limit * 2)
                    .get();

                console.log("friends-only posts: " + friendsPostsRef.size);
                
                // Filter for friends' posts only (excluding current user)
                let count = 0;
                friendsPostsRef.docs.forEach(doc => {
                    const postData = doc.data();
                    
                    if (userFriends.includes(postData.author) && postData.author !== currentUserId) {
                        posts.push(new Post(doc.id, postData));
                        count++;
                    }
                });
                console.log("friends-only posts(for array): " + count);
            }
            
            // 3. DEBUG: Try getting user's posts without orderBy first
            const userFriendsPostsRef = await postCollection
                    .where('author', '==', currentUserId)
                    .where('privacy', '==', 'friends')
                    .orderBy('createdAt', 'desc')
                    .limit(limit)
                    .get();
            
            console.log("user's own friends-only posts: " + userFriendsPostsRef.size);

            let friendsCount = 0;
            userFriendsPostsRef.docs.forEach(doc => {
                posts.push(new Post(doc.id, doc.data()));
                friendsCount++;
            });

            console.log("user's own friends-only posts(for array): " + friendsCount);
            
            
            // 4. Sort all posts by creation date (newest first)
            posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            // 5. Remove duplicates if any (though there shouldn't be any with this logic)
            const uniquePosts = posts.filter((post, index, self) => 
                index === self.findIndex(p => p.id === post.id)
            );
            
            console.log("total posts after remove duplicates: " + uniquePosts.length);
            return uniquePosts;
        } catch (error) {
            throw error;
        }
    },
};

module.exports = PostService;