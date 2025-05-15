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

        await Post.create(postData);

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

        res.status(201).json(populatedPost);
        
    } catch (err) {
        console.error('Post creation error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};


//@desc     Get all posts by id
const getAllPostsByUserId = async (req, res) => {
    
};


//@desc     Get all posts (feed)
const getAllPostsInFeed = async (req, res) => {

};



module.exports = {
    createPost,
    getAllPostsByUser,
};