const Post = require('../models/Post');
const User = require('../models/User');
const Comments = require('../models/Comment');

//@desc     create a post 
const createPost = async (req, res) => {
    try {
        const { content, media, tags, privacy, location } = req.body;

        const newPost = new Post({
            author: req.user.id,
            content,
            tags,
            media,
            privacy,
            location
        });

        await newPost.save();

        // get author details
        const author = await User.findById(req.user.id);
        
        if (!author) {
            return res.status(404).json({ msg: 'Author not found' });
        }
        
        const authorData = {
            id: author.id,
            firstName: author.firstName,
            lastName: author.lastName,
            username: author.username,
            profilePicture: author.profilePicture
        };

        // combine post with author details
        const populatedPost = {
            ...newPost,
            author: authorData
        };

        res.json(populatedPost);
        
    } catch (err) {
        console.error('Post creation error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};


//@desc     Get all posts by logged user
const getAllPostsByUser = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not authenticated' 
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Query for posts where author equals the user ID
        // Order by createdAt in descending order (latest first)
        const postsQuery = await Post.find({ author: userId });
        const sortedQuery = postsQuery.orderBy('createdAt', 'desc');
        const postsSnapshot = await sortedQuery.get();

        if (postsSnapshot.empty) {
            return res.status(200).json({ 
                success: true, 
                message: 'No posts found for this user',
                data: []
            });
        }

        // transform the post data
        const posts = [];
        postsSnapshot.forEach(doc => {
            const postData = doc.data();
            postData.id = doc.id;
            
            // Add computed properties
            postData.commentCount = postData.comments.length;
            postData.likeCount = postData.likes.length;
            postData.shareCount = postData.shares.length;
            
            posts.push(postData);
        });

        return res.status(200).json({
            success: true,
            count: posts.length,
            data: posts
        });

    } catch (error) {
        console.error('Error fetching user posts:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching posts',
            error: error.message
        });
    }
};


//@desc     Get all posts (feed)
const getAllPostsInFeed = async (req, res) => {

};



module.exports = {
    createPost,
    getAllPostsByUser,
};