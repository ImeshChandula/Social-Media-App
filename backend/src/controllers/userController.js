const UserService = require('../services/userService');
const PostService = require('../services/postService');
const CommentService = require('../services/commentService');
const StoryService = require('../services/storyService');
const ROLES = require("../enums/roles");
const bcrypt = require('bcrypt');
const cloudinary =  require("../config/cloudinary");
require('dotenv').config();


//@desc     Get All Users
const getAllUsers = async (req, res) => {
    try {
        const users = await UserService.findAll();

        const rolePriority = {
            [ROLES.SUPER_ADMIN]: 3,
            [ROLES.ADMIN]: 2,
            [ROLES.USER]: 1
        };

        const sortedUsers = users.length > 0
        ? users.sort((a, b) => {
            const priorityA = rolePriority[a.role] || 0;
            const priorityB = rolePriority[b.role] || 0;

            if (priorityB !== priorityA) {
                return priorityB - priorityA;
            }

            return (a.name || '').localeCompare(b.name || '');
            })
        : [];

        // Remove passwords from response
        const sanitizedUsers = sortedUsers.map(user => {
            user.password = undefined;
            user._isPasswordModified = undefined;
            return user;
        });

        res.status(200).json({count: sanitizedUsers.length, data: sanitizedUsers});
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Server error" });
    }
};


//@desc     Delete user by ID
const deleteUser = async (req, res) => {
    try {
        const userIdToDelete = req.params.id;
        const currentUserId = req.user.id;

        // Only allow users to update their own profile unless admin
        if (req.user.role !== 'super_admin' && currentUserId !== userIdToDelete) {
            return res.status(403).json({ message: 'Not authorized to delete this user' });
        }

        const userToDelete = await UserService.findById(userIdToDelete);
        if (!userToDelete) {
            return res.status(404).json({success: false, message: 'User not found'});
        }

        // Step 1: Delete all posts by this user and their associated comments
        try {
            // Get all posts by this user
            const userPosts = await PostService.findByUserId(userIdToDelete);
            console.log(`Found ${userPosts.length} posts to delete for user ${userIdToDelete}`);
            
            // Delete each post and its comments
            for (const post of userPosts) {
                // Delete all comments for this post
                if (post.comments && post.comments.length > 0) {
                    console.log(`Deleting ${post.comments.length} comments for post ${post.id}`);
                    
                    const deleteCommentPromises = post.comments.map(commentId => 
                        CommentService.deleteById(commentId).catch(err => 
                            console.error(`Error deleting comment ${commentId}:`, err.message)
                        )
                    );
                    
                    await Promise.all(deleteCommentPromises);
                }
                
                // Delete the post
                await PostService.deleteById(post.id);
                console.log(`Deleted post ${post.id}`);
            }
        } catch (postsError) {
            console.error(`Error deleting posts for user ${userIdToDelete}:`, postsError.message);
            // Continue with other deletions even if posts fail
        }

        // Step 2: Delete all comments by this user on any post
        try {
            // Get all comments by this user
            const userComments = await CommentService.findByUserId(userIdToDelete);
            console.log(`Found ${userComments.length} comments to delete for user ${userIdToDelete}`);
            
            // For each comment:
            for (const comment of userComments) {
                // 1. Update the post to remove this comment ID
                try {
                    const post = await PostService.findById(comment.post);
                    if (post) {
                        // Remove the comment ID from the post's comments array
                        const updatedComments = post.comments.filter(id => id !== comment.id);
                        
                        // Update the post
                        await PostService.updateById(comment.post, {
                            comments: updatedComments,
                            commentCount: updatedComments.length
                        });
                    }
                } catch (postUpdateError) {
                    console.error(`Error updating post ${comment.post}:`, postUpdateError.message);
                    // Continue with deleting the comment even if post update fails
                }
                
                // 2. Delete the comment
                await CommentService.deleteById(comment.id);
                console.log(`Deleted comment ${comment.id}`);
            }
        } catch (commentsError) {
            console.error(`Error deleting comments for user ${userIdToDelete}:`, commentsError.message);
            // Continue with other deletions even if comments fail
        }

        // Step 3: Delete all stories by this user
        try {
            // Get all stories by this user
            const userStories = await StoryService.findAllByUserId(userIdToDelete);
            console.log(`Found ${userStories.length} stories to delete for user ${userIdToDelete}`);
            
            // Delete each story
            for (const story of userStories) {
                await StoryService.findByIdAndDelete(story.id);
                console.log(`Deleted story ${story.id}`);
            }
        } catch (storiesError) {
            console.error(`Error deleting stories for user ${userIdToDelete}:`, storiesError.message);
            // Continue with user deletion even if stories fail
        }

        await UserService.deleteById(req.params.id);   
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ message: "Server error" });
    }
};


//@desc     Get current user profile
const getCurrentUser  = async (req, res) => {
    try {
        const user = await UserService.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found'});
        }

        const posts = await PostService.findByUserId(req.user.id);
        const postsCount = posts.length;

        // Remove password before sending user
        user.password = undefined;
        user._isPasswordModified = undefined;

        // Create response object with user data and calculated fields
        const userResponse = {
            ...user,
            // Access the getter methods to include the counts
            friendsCount: user.friendsCount,
            friendRequestCount: user.friendRequestCount,
            postsCount: postsCount
        };

        res.status(200).json({msg: "User found: ", user: userResponse});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


//@desc     Get user by username
const getUserByUsername = async (req,res) => {
    try {
        const username = req.params.username;

        const user = await UserService.findByUsername(username);
        if (!user) {
            return res.status(404).json({ msg: 'User not found'});
        }

        const postsCount = await UserService.getPostsCount(req.user.id);

        // remove password
        user.password = undefined;
        user._isPasswordModified = undefined;

        // Create response object with user data and calculated fields
        const userResponse = {
            ...user,
            // Access the getter methods to include the counts
            friendsCount: user.friendsCount,
            friendRequestCount: user.friendRequestCount,
            postsCount: postsCount
        };

        res.status(200).json({msg: "User found: ", user: userResponse});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};


//@desc     Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const userIdToUpdate = req.params.id;
        const currentUserId = req.user.id;

        // Only allow users to update their own profile unless admin
        if (req.user.role !== 'super_admin' && currentUserId !== userIdToUpdate) {
            return res.status(403).json({ message: 'Not authorized to update this user' });
        }
        
        // Don't allow role change unless admin
        if (req.body.role && req.user.role !== 'super_admin') {
            delete req.body.role;
        }
        
        // Hash password if it's being updated
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }

        // update user
        const updatedUser = await UserService.updateById(userIdToUpdate, req.body);

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // remove password
        updatedUser.password = undefined;
        updatedUser._isPasswordModified = undefined;
        
        console.log('Profile updated successfully for user:', req.user.id);
        res.status(201).json({mag:"Profile updated successfully.", user: updatedUser});

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};


//@desc     Update user profile image
const updateUserProfileImage = async (req, res) => {
    try {
        const { profilePicture } = req.body;
        const userIdToUpdate = req.params.id;
        const currentUserId = req.user.id;

        if (currentUserId !== userIdToUpdate) {
            return res.status(403).json({ message: 'Not authorized to update this user' });
        }

        if (!profilePicture) {
            return res.status(400).json({msg: "Profile picture is required"})
        }

        // data object
        const updatedData = { };

        if (profilePicture) {
            try {
                // Make sure cloudinary is properly initialized
                if (!cloudinary || typeof cloudinary.uploader.upload !== 'function') {
                    throw new Error('Cloudinary is not properly configured');
                }
                        
                // Check the type of profile Picture and handle appropriately
                if (Array.isArray(profilePicture)) {
                     // If it's an array of profile Picture files
                    const uploadPromises = profilePicture.map(item => cloudinary.uploader.upload(item.path || item));
                    const uploadResults = await Promise.all(uploadPromises);
                    updatedData.profilePicture = uploadResults.map(result => result.secure_url);
                } else if (typeof profilePicture === 'object' && profilePicture !== null && profilePicture.path) {
                    // If it's a file object from multer
                    const uploadResponse = await cloudinary.uploader.upload(profilePicture.path);
                    updatedData.profilePicture = uploadResponse.secure_url;
                } else if (typeof profilePicture === 'string') {
                    // If it's a base64 string or a URL
                    const uploadResponse = await cloudinary.uploader.upload(profilePicture);
                    updatedData.profilePicture = uploadResponse.secure_url;
                } else {
                    throw new Error('Invalid profile picture format');
                }
            } catch (uploadError) {
                console.error('Profile Picture upload error:', uploadError);
                return res.status(400).json({ 
                    error: "Failed to upload profile picture. Invalid format or Cloudinary configuration issue.",
                    details: uploadError.message
                });
            }
        };

        const updatedUser = await UserService.updateById(userIdToUpdate, updatedData);

        // remove password
        updatedUser.password = undefined;
        updatedUser._isPasswordModified = undefined;

        res.status(201).json({msg: "Profile picture updated successfully", updatedUser})
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};


//@desc     Update user profile image
const updateUserProfileCoverPhoto = async (req, res) => {
    try {
        const { coverPhoto } = req.body;
        const userIdToUpdate = req.params.id;
        const currentUserId = req.user.id;

        if (currentUserId !== userIdToUpdate) {
            return res.status(403).json({ message: 'Not authorized to update this user' });
        }

        if (!coverPhoto) {
            return res.status(400).json({msg: "Cover Photo is required"})
        }

        // data object
        const updatedData = { };

        if (coverPhoto) {
            try {
                // Make sure cloudinary is properly initialized
                if (!cloudinary || typeof cloudinary.uploader.upload !== 'function') {
                    throw new Error('Cloudinary is not properly configured');
                }
                        
                // Check the type of cover Photo and handle appropriately
                if (Array.isArray(coverPhoto)) {
                     // If it's an array of cover Photo files
                    const uploadPromises = coverPhoto.map(item => cloudinary.uploader.upload(item.path || item));
                    const uploadResults = await Promise.all(uploadPromises);
                    updatedData.coverPhoto = uploadResults.map(result => result.secure_url);
                } else if (typeof coverPhoto === 'object' && coverPhoto !== null && coverPhoto.path) {
                    // If it's a file object from multer
                    const uploadResponse = await cloudinary.uploader.upload(coverPhoto.path);
                    updatedData.coverPhoto = uploadResponse.secure_url;
                } else if (typeof coverPhoto === 'string') {
                    // If it's a base64 string or a URL
                    const uploadResponse = await cloudinary.uploader.upload(coverPhoto);
                    updatedData.coverPhoto = uploadResponse.secure_url;
                } else {
                    throw new Error('Invalid cover photo format');
                }
            } catch (uploadError) {
                console.error('Cover Photo upload error:', uploadError);
                return res.status(400).json({ 
                    error: "Failed to upload cover photo. Invalid format or Cloudinary configuration issue.",
                    details: uploadError.message
                });
            }
        };

        const updatedUser = await UserService.updateById(userIdToUpdate, updatedData);

        // remove password
        updatedUser.password = undefined;
        updatedUser._isPasswordModified = undefined;

        res.status(201).json({msg: "Cover Photo updated successfully", updatedUser})
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

module.exports = {
    getAllUsers,
    deleteUser,
    getCurrentUser,
    getUserByUsername,
    updateUserProfile,
    updateUserProfileImage,
    updateUserProfileCoverPhoto
};