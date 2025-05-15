const Post = require('../models/Post');
const User = require('../models/User');
const Comments = require('../models/Comment');

//@desc     create a post 
const createPost = async (req, res) => {
    try {
        const { content, media, tags, privacy, location } = req.body;

        const postData = {
            author: req.user.id,
            content,
            tags,
            media,
            privacy,
            location
        };

        const newPost = await Post.create(postData);

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

        res.status(201).json({ msg: "Post created successfully", populatedPost });
        
    } catch (error) {
        console.error('Post creation error:', error.message);
        res.status(500).json({ msg: 'Server error' });
    }
};


//@desc     Get all posts by id
const getAllPostsByUserId = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.id;
        
        // Get posts by user ID
        const posts = await Post.findByUserId(userId);
        
        if (!posts.length) {
            return res.status(200).json([]);
        }
        
        // Get user details
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
        const authorData = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            profilePicture: user.profilePicture
        };
        
        // Populate posts with user data
        const populatedPosts = posts.map(post => ({
            ...post,
            author: authorData
        }));
        
        res.status(200).json({msg: "User posts:", populatedPosts});
    } catch (error) {
        console.error('Get posts error:', error.message);
        res.status(500).json({ msg: 'Server error' });
    }
};


//@desc     Get all posts (feed)
const getAllPostsInFeed = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get feed posts (in a real app, this would likely be posts from followed users)
        const posts = await Post.findForFeed(userId);
        
        if (!posts.length) {
            return res.status(200).json([]);
        }
        
        // Get unique author IDs from posts
        const authorIds = [...new Set(posts.map(post => post.author))];
        
        // Get author details for all posts
        // In a production app, you'd want to batch this or use a more efficient approach
        const authorsPromises = authorIds.map(authorId => User.findById(authorId));
        const authors = await Promise.all(authorsPromises);
        
        // Create a map of author IDs to author data for quick lookup
        const authorMap = authors.reduce((map, author) => {
            if (author) {
                map[author.id] = {
                    id: author.id,
                    firstName: author.firstName,
                    lastName: author.lastName,
                    username: author.username,
                    profilePicture: author.profilePicture
                };
            }
            return map;
        }, {});
        
        // Populate posts with author data
        const populatedPosts = posts.map(post => ({
            ...post,
            author: authorMap[post.author] || post.author // Fallback to ID if author not found
        }));
        
        res.status(200).json({msg: "Posts:", populatedPosts});
    } catch (err) {
        console.error('Get feed error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};



module.exports = {
    createPost,
    getAllPostsByUserId,
    getAllPostsInFeed
};