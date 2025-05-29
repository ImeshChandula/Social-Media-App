const UserService = require('../services/userService');
const PostService = require('../services/postService');
const { performUserDeletion } = require('../services/userDeletionService');
const {uploadImage} = require('../utils/uploadMedia');
const ROLES = require("../enums/roles");
const bcrypt = require('bcrypt');
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

        // Call the external service to handle the entire deletion process
        await performUserDeletion(userToDelete);
        
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
const searchUsersByUsername = async (req,res) => {
    try {
        const { q: searchTerm, limit = 10 } = req.query;

        if (!searchTerm || searchTerm.trim().length === 0) {
            return res.status(400).json({ 
                msg: 'Search term is required',
                users: []
            });
        }

        // Use the comprehensive search function
        const users = await UserService.searchUsers(searchTerm, parseInt(limit));

        // Remove sensitive information from all users
        const sanitizedUsers = users.map(user => {
            user.password = undefined;
            user._isPasswordModified = undefined;
            user.resetOtp = undefined;
            user.resetOtpExpiredAt = undefined;
            
            return {
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                profilePicture: user.profilePicture,
                bio: user.bio,
                location: user.location,
                friendsCount: user.friendsCount,
                // Add any other fields you want to show in search results
            };
        });

        res.status(200).json({
            msg: `Found ${sanitizedUsers.length} users`,
            users: sanitizedUsers,
            searchTerm: searchTerm
        });

    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ 
            msg: 'Server Error',
            users: []
        });
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

        try {
            const imageUrl = await uploadImage(profilePicture);
            updatedData.profilePicture = imageUrl;
        } catch (error) {
            return res.status(400).json({error: "Failed to upload profile picture", message: error.message});
        }

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

        try {
            const imageUrl = await uploadImage(coverPhoto);
            updatedData.coverPhoto = imageUrl;
        } catch (error) {
            return res.status(400).json({error: "Failed to upload coverPhoto", message: error.message});
        }

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
    searchUsersByUsername,
    updateUserProfile,
    updateUserProfileImage,
    updateUserProfileCoverPhoto
};