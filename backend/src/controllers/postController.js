const Post = require('../models/Post');
const User = require('../models/User');

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



//@desc     Get all posts (feed)




module.exports = {
    createPost,
};