
const { connectFirebase } = require('../config/firebase');
const Post = require('../models/Post');

const { db } = connectFirebase();
const postCollection = db.collection('posts');

const PostService = {
    // Helper method to safely create Post instances
    _createPostSafely(docId, docData) {
        try {
            if (!docId) {
                console.warn('Document ID is missing');
                return null;
            }
            
            if (!docData) {
                console.warn(`Document data is missing for ID ${docId}`);
                return null;
            }

            return new Post(docId, docData);
        } catch (error) {
            console.error(`Error creating Post instance for ID ${docId}:`, error);
            return null;
        }
    },

    // static methods
    async findById(id) {
        try {
            const doc = await postCollection.doc(id).get();
            if (!doc.exists) {
                return null;
            }

            return this._createPostSafely(doc.id, doc.data());
        } catch (error) {
            console.error('Error finding post by ID:', error);
            throw error;
        }
    },

    // save post to database
    async create(postData) {
        try {
            postData.createdAt = new Date().toISOString();

            const docRef = await postCollection.add(postData);
            return this._createPostSafely(docRef.id, postData);
        } catch (error) {
            console.error('Error creating post:', error);
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
            console.error('Error updating post:', error);
            throw error;
        }
    },

    // delete post
    async deleteById(id) {
        try {
            await postCollection.doc(id).delete();
            return true;
        } catch (error) {
            console.error('Error deleting post:', error);
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
            
            const posts = [];
            postRef.docs.forEach(doc => {
                const post = this._createPostSafely(doc.id, doc.data());
                if (post) {
                    posts.push(post);
                } else {
                    console.warn(`Skipped corrupted post with ID: ${doc.id}`);
                }
            });
            
            return posts;
        } catch (error) {
            console.error('Error finding all posts:', error);
            throw error;
        }
    },

    // get all videos - FIXED: No composite index needed
    async findByMediaType(type) {
        try {
            // Use only single field query to avoid composite index requirement
            const postRef = await postCollection
                    .where('mediaType', '==', type)
                    .get(); // Remove orderBy to avoid composite index
            
            if (postRef.empty) {
                return [];
            }

            const posts = [];
            postRef.docs.forEach(doc => {
                const post = this._createPostSafely(doc.id, doc.data());
                if (post) {
                    posts.push(post);
                } else {
                    console.warn(`Skipped corrupted ${type} post with ID: ${doc.id}`);
                }
            });
            
            // Sort in memory instead of in query
            posts.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            });
            
            return posts;
        } catch (error) {
            console.error('Error finding posts by media type', error);
            throw error;
        }
    },

    // SOLUTION 1: Filter in memory (works immediately)
    async findByMediaTypeAndCategory(mediaType, category) {
        try {
            console.log(`Fetching ${mediaType} posts for category: ${category}`);
            
            // Get all posts of the media type (single field query - no index needed)
            const postRef = await postCollection
                    .where('mediaType', '==', mediaType)
                    .get(); // No orderBy to avoid composite index
            
            if (postRef.empty) {
                return [];
            }

            // Filter by category and create posts in memory
            const posts = [];
            postRef.docs.forEach(doc => {
                const postData = doc.data();
                
                // Filter by category in JavaScript
                if (postData.category === category) {
                    const post = this._createPostSafely(doc.id, postData);
                    if (post) {
                        posts.push(post);
                    }
                }
            });
            
            // Sort by createdAt in memory
            posts.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            });
            
            console.log(`Found ${posts.length} ${mediaType} posts in ${category} category`);
            return posts;
            
        } catch (error) {
            console.error('Error finding posts by media type and category', error);
            // Fallback to all posts of that media type
            return await this.findByMediaType(mediaType);
        }
    },

    // SOLUTION 2: Alternative approach - get all videos first, then filter
    async findVideosByCategory(category) {
        try {
            // Get all video posts first
            const allVideos = await this.findByMediaType('video');
            
            // Filter by category
            const categoryVideos = allVideos.filter(post => post.category === category);
            
            return categoryVideos;
        } catch (error) {
            console.error('Error finding videos by category:', error);
            return [];
        }
    },
    
    // Find posts by user ID - FIXED: No composite index needed
    async findByUserId(userId) {
        try {
            const postRef = await postCollection
                    .where('author', '==', userId)
                    .get(); // Remove orderBy to avoid composite index
            
            if (postRef.empty) {
                return [];
            }
            
            const posts = [];
            postRef.docs.forEach(doc => {
                const post = this._createPostSafely(doc.id, doc.data());
                if (post) {
                    posts.push(post);
                } else {
                    console.warn(`Skipped corrupted user post with ID: ${doc.id} for user: ${userId}`);
                }
            });
            
            // Sort in memory
            posts.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            });
            
            return posts;
        } catch (error) {
            console.error('Error finding posts by user ID:', error);
            throw error;
        }
    },

    // Find posts for feed - FIXED: Avoid composite indexes - UPDATED to exclude hidden posts
    async findForFeed(currentUserId, userFriends = [], limit = 50) {
        try {
            const posts = [];
        
            // 1. Get all public posts - single field query, exclude hidden posts
            try {
                const publicPostsRef = await postCollection
                    .where('privacy', '==', 'public')
                    .limit(limit * 2) // Get more since we'll sort in memory
                    .get(); // Remove orderBy
                
                console.log("public posts: " + publicPostsRef.size);

                publicPostsRef.docs.forEach(doc => {
                    const postData = doc.data();
                    // Exclude hidden (reported) posts from normal feed
                    if (!postData.isHidden) {
                        const post = this._createPostSafely(doc.id, postData);
                        if (post) {
                            posts.push(post);
                        }
                    }
                });
            } catch (publicError) {
                console.error('Error fetching public posts:', publicError);
            }
            
            // 2. Get friends-only posts - single field query, exclude hidden posts
            if (userFriends.length > 0) {
                try {
                    const friendsPostsRef = await postCollection
                        .where('privacy', '==', 'friends')
                        .limit(limit * 2)
                        .get(); // Remove orderBy

                    console.log("friends-only posts: " + friendsPostsRef.size);
                    
                    let count = 0;
                    friendsPostsRef.docs.forEach(doc => {
                        const postData = doc.data();
                        
                        if (postData && postData.author && 
                            userFriends.includes(postData.author) && 
                            postData.author !== currentUserId &&
                            !postData.isHidden) { // Exclude hidden posts
                            
                            const post = this._createPostSafely(doc.id, postData);
                            if (post) {
                                posts.push(post);
                                count++;
                            }
                        }
                    });
                    console.log("friends-only posts(for array): " + count);
                } catch (friendsError) {
                    console.error('Error fetching friends posts:', friendsError);
                }
            }
            
            // 3. Get user's own friends-only posts, exclude hidden posts
            try {
                const userFriendsPostsRef = await postCollection
                        .where('author', '==', currentUserId)
                        .get(); // Remove compound where and orderBy
                
                console.log("user's own posts: " + userFriendsPostsRef.size);

                let friendsCount = 0;
                userFriendsPostsRef.docs.forEach(doc => {
                    const postData = doc.data();
                    
                    // Filter for friends privacy in memory and exclude hidden posts
                    if (postData && postData.privacy === 'friends' && !postData.isHidden) {
                        const post = this._createPostSafely(doc.id, postData);
                        if (post) {
                            posts.push(post);
                            friendsCount++;
                        }
                    }
                });

                console.log("user's own friends-only posts(for array): " + friendsCount);
            } catch (userPostsError) {
                console.error("Error fetching user's posts:", userPostsError);
            }
            
            // 4. Sort all posts by creation date in memory
            posts.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            });
            
            // 5. Remove duplicates and limit
            const uniquePosts = posts.filter((post, index, self) => 
                index === self.findIndex(p => p.id === post.id)
            ).slice(0, limit);
            
            console.log("total posts after processing: " + uniquePosts.length);
            return uniquePosts;
        } catch (error) {
            console.error('Error in findForFeed:', error);
            throw error;
        }
    },

    // NEW METHODS FOR REPORT FUNCTIONALITY

    // Mark post as reported and hide from feed
    async markAsReported(postId, reportId) {
        try {
            const post = await this.findById(postId);
            if (!post) {
                throw new Error('Post not found');
            }

            const reports = post.reports || [];
            reports.push(reportId);

            const updateData = {
                isReported: true,
                isHidden: true, // Hide from normal feed
                reportCount: reports.length,
                reports: reports
            };

            return await this.updateById(postId, updateData);
        } catch (error) {
            console.error('Error marking post as reported:', error);
            throw error;
        }
    },

    // Show post in feed again (when report is declined)
    async showPost(postId) {
        try {
            const updateData = {
                isHidden: false
            };

            return await this.updateById(postId, updateData);
        } catch (error) {
            console.error('Error showing post:', error);
            throw error;
        }
    },

    // Get all reported posts for admin dashboard
    async findReportedPosts() {
        try {
            // Use single field query to avoid composite index requirement
            const postRef = await postCollection
                .where('isReported', '==', true)
                .get(); // Remove orderBy to avoid composite index
            
            if (postRef.empty) {
                return [];
            }
            
            const posts = [];
            postRef.docs.forEach(doc => {
                const post = this._createPostSafely(doc.id, doc.data());
                if (post) {
                    posts.push(post);
                }
            });
            
            // Sort in memory by updatedAt (most recent first)
            posts.sort((a, b) => {
                const dateA = new Date(a.updatedAt || a.createdAt || 0);
                const dateB = new Date(b.updatedAt || b.createdAt || 0);
                return dateB - dateA;
            });
            
            return posts;
        } catch (error) {
            console.error('Error finding reported posts:', error);
            throw error;
        }
    },

    // updated to create posts for pages
    // Create post for page
    async createPagePost(pageId, postData) {
        try {
            postData.author = pageId; // Page ID as author
            postData.authorType = 'page'; // Distinguish from user posts
            postData.createdAt = new Date().toISOString();

            const docRef = await postCollection.add(postData);
            return this._createPostSafely(docRef.id, postData);
        } catch (error) {
            console.error('Error creating page post:', error);
            throw error;
        }
    },

    // Find posts by page ID
    async findByPageId(pageId) {
        try {
            const postRef = await postCollection
                    .where('author', '==', pageId)
                    .where('authorType', '==', 'page')
                    .get();
            
            if (postRef.empty) {
                return [];
            }
            
            const posts = [];
            postRef.docs.forEach(doc => {
                const post = this._createPostSafely(doc.id, doc.data());
                if (post) {
                    posts.push(post);
                }
            });
            
            // Sort in memory
            posts.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            });
            
            return posts;
        } catch (error) {
            console.error('Error finding posts by page ID:', error);
            throw error;
        }
    }
};

module.exports = PostService;