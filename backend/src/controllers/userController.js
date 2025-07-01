const UserService = require('../services/userService');
const PostService = require('../services/postService');
const { performUserDeletion } = require('../services/userDeletionService');
const {uploadImage} = require('../utils/uploadMedia');
const { generateToken } = require("../utils/jwtToken");
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

        // Get posts count for each user and prepare sanitized response
        const sanitizedUsers = await Promise.all(sortedUsers.map(async (user) => {
            try {
                // Get posts count for this user
                const userPosts = await PostService.findByUserId(user.id);
                const postsCount = userPosts.length;

                // Create sanitized user object with counts
                return {
                    ...user,
                    friendsCount: user.friendsCount,           // Using getter from User model
                    friendRequestCount: user.friendRequestCount, // Using getter from User model
                    postsCount: postsCount,
                    // Remove sensitive data
                    password: undefined,
                    _isPasswordModified: undefined,
                    resetOtp: undefined,
                    resetOtpExpiredAt: undefined
                };
            } catch (error) {
                console.error(`Error getting posts count for user ${user.id}:`, error);
                // Return user with 0 posts count if there's an error
                return {
                    ...user,
                    friendsCount: user.friendsCount,
                    friendRequestCount: user.friendRequestCount,
                    postsCount: 0,
                    password: undefined,
                    _isPasswordModified: undefined,
                    resetOtp: undefined,
                    resetOtpExpiredAt: undefined
                };
            }
        }));

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

        // Only allow users to delete their own profile unless admin
        if (req.user.role !== 'super_admin' && currentUserId !== userIdToDelete) {
            return res.status(403).json({ message: 'Not authorized to delete this user' });
        }

        const userToDelete = await UserService.findById(userIdToDelete);
        if (!userToDelete) {
            return res.status(404).json({success: false, message: 'User not found'});
        }

        // Call the external service to handle the entire deletion process
        await performUserDeletion(userToDelete.id);
        
        return res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        console.error("Error deleting user:", err);
        return res.status(500).json({ message: "Server error" });
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


//@desc     Get user by id
const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        //const currentUserId = req.user.id;  // Add this line
        //const currentUserRole = req.user.role;  // Add this line

        const user = await UserService.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found'});
        }

        const posts = await PostService.findByUserId(req.user.id); 
        const postsCount = posts.length;

        // Remove password before sending user
        user.password = undefined;
        user._isPasswordModified = undefined;
        user.resetOtp = undefined;
        user.resetOtpExpiredAt = undefined;

    //     //newly added privacy feature
    //     // Check if profile is private and user is not a friend or super admin
    //     const isProfileOwner = currentUserId === userId;
    //     const isSuperAdmin = currentUserRole === 'super_admin';
    //     const isFriend = user.friends && user.friends.includes(currentUserId);
    
    //     let userResponse;

    //     if (!user.isPublic && !isProfileOwner && !isSuperAdmin && !isFriend) {
    //   // Return limited profile information for private profiles
    //   // Only show profile picture, username, and limited photos
    //   const limitedPhotos = posts.slice(0, 5).map(post => ({
    //     id: post.id,
    //     image: post.image || null
    //   })).filter(post => post.image);

    //   userResponse = {
    //     id: user.id,
    //     username: user.username,
    //     firstName: user.firstName,
    //     lastName: user.lastName,
    //     profilePicture: user.profilePicture,
    //     isPublic: user.isPublic,
    //     friendsCount: user.friendsCount,
    //     limitedPhotos: limitedPhotos,
    //     isPrivateProfile: true
    //   };
    // } else {
    //     // Return full profile information
    //   userResponse = {
    //     ...user,
    //     friendsCount: user.friendsCount,
    //     friendRequestCount: user.friendRequestCount,
    //     postsCount: postsCount,
    //     isPrivateProfile: false
    //   };
    // } 


        // Create response object with user data and calculated fields
        const userResponse = {
            ...user,
            // Access the getter methods to include the counts
            friendsCount: user.friendsCount,
            friendRequestCount: user.friendRequestCount,
            postsCount: postsCount
        };

        res.status(200).json({success: true, message: "User found: ", user: userResponse});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


//@desc     Search user by username
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

        let isUpdatingTokenValue = false;
        if ((req.body.role || req.body.accountStatus) && currentUserId === userIdToUpdate) {
            isUpdatingTokenValue = true;
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

        if (isUpdatingTokenValue) {
            const payload = {
                id: updatedUser.id,
                username: updatedUser.username,
                role: updatedUser.role,
                accountStatus: updatedUser.accountStatus,
                isPublic: updatedUser.isPublic
            };

            generateToken(payload, res);
            console.log("New token created")
        }
        
        // remove password
        updatedUser.password = undefined;
        updatedUser._isPasswordModified = undefined;
        updatedUser.resetOtp = undefined;
        updatedUser.resetOtpExpiredAt = undefined;
        
        console.log('Profile updated successfully for user:', req.user.id);
        res.status(201).json({ success: true, message:"Profile updated successfully.", user: updatedUser});
        console.log('Updating user with data:', req.body);// added for debugging of privacy feature

    } catch (err) {
        console.error(err.message);
        res.status(500).send({success: true, message:'Server error'});
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
        updatedUser.resetOtp = undefined;
        updatedUser.resetOtpExpiredAt = undefined;

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
        updatedUser.resetOtp = undefined;
        updatedUser.resetOtpExpiredAt = undefined;

        res.status(201).json({msg: "Cover Photo updated successfully", updatedUser})
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// // 2. Add a new middleware function to check profile visibility for posts
// const checkProfileAccess = async (req, res, next) => {
//   try {
//     const profileUserId = req.params.userId || req.params.id;
//     const currentUserId = req.user.id;
//     const currentUserRole = req.user.role;

//     // If it's the profile owner or super admin, allow access
//     if (currentUserId === profileUserId || currentUserRole === 'super_admin') {
//       return next();
//     }

//     // Get the profile user
//     const profileUser = await UserService.findById(profileUserId);
//     if (!profileUser) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     // If profile is public, allow access
//     if (profileUser.isPublic) {
//       return next();
//     }

//     // If profile is private, check if current user is a friend
//     const isFriend = profileUser.friends && profileUser.friends.includes(currentUserId);
//     if (!isFriend) {
//       return res.status(403).json({ 
//         success: false, 
//         message: 'This profile is private. You need to be friends to view this content.',
//         isPrivateProfile: true
//       });
//     }

//     next();
//   } catch (error) {
//     console.error('Profile access check error:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

module.exports = {
    getAllUsers,
    deleteUser,
    getUserById,
    getCurrentUser,
    searchUsersByUsername,
    updateUserProfile,
    updateUserProfileImage,
    updateUserProfileCoverPhoto,
    //checkProfileAccess
};