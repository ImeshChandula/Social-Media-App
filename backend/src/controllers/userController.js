const User = require('../models/User');
const ROLES = require("../enums/roles");
const bcrypt = require('bcrypt');
const cloudinary =  require("../config/cloudinary");
require('dotenv').config();


//@desc     Get All Users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();

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

        if (userIdToDelete === currentUserId) {
            return res.status(403).json({success: false, message: 'You cannot delete your own account'});
        }

        const userToDelete = await User.findById(userIdToDelete);
        if (!userToDelete) {
            return res.status(404).json({success: false, message: 'User not found'});
        }

        await User.deleteById(req.params.id);   
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ message: "Server error" });
    }
};


//@desc     Get current user profile
const getCurrentUser  = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found'});
        }

        const postsCount = await User.getPostsCount(req.user.id);

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

        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(404).json({ msg: 'User not found'});
        }

        const postsCount = await User.getPostsCount(req.user.id);

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
        if (currentUserId !== 'super_admin' && currentUserId !== userIdToUpdate) {
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
        const updatedUser = await User.updateById(userIdToUpdate, req.body);

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

        const uploadResponse = await cloudinary.uploader.upload(profilePicture);
        const updatedData = {
            profilePicture: uploadResponse.secure_url,
        };

        const updatedUser = await User.updateById(userIdToUpdate, updatedData);

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

        const uploadResponse = await cloudinary.uploader.upload(coverPhoto);
        const updatedData = {
            coverPhoto: uploadResponse.secure_url,
        };

        const updatedUser = await User.updateById(userIdToUpdate, updatedData);

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