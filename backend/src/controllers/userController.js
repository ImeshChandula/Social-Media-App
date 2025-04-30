const User = require('../models/User');
const jwt = require('jsonwebtoken');
const ROLES = require("../enums/roles");
require('dotenv').config();


//@desc    Register user
const registerUser = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, role } = req.body;

        // check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: "User already exists" });
        }

        // create new user
        user = new User({
            username,
            email,
            password,
            firstName,
            lastName,
            role: role || 'user',
        });

        await user.save();

        // create JWT token
        const payload = {
            id: user.id,
            username: user.username,
            role: user.role,
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log("User registered successfully.");
        res.status(201).json({ msg: "User registered successfully", token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};


//@desc     Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`Login attempt for email: ${email}`);

        // check if user exists
        const user = await User.findOne({ email });
        if (!user){
            return res.status(400).json({ msg: 'Invalid credentials (Not a user..!)' });
        }

        console.log(`User found: ${user.id}, checking password...`);

        // validate password
        const isMatch = await user.validatePassword(password);
        if (!isMatch){
            return res.status(400).json({ msg: 'Invalid credentials (Wrong password..!)' });
        }

        // update last login
        user.lastLogin = new Date();
        await user.save();

        // create JWT token
        const payload = {
            id: user.id,
            username: user.username,
            role: user.role,
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token });
    } catch (err) {
        console.error("Login error:", err.message);
        res.status(500).send('Server Error');
    }
};

//@desc     Get All Users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();

        const rolePriority = {
            [ROLES.SUPER_ADMIN]: 3,
            [ROLES.ADMIN]: 2,
            [ROLES.USER]: 1
        };

        const sortedUsers = users.length > 0
        ? users.sort((a, b) => {
            const priorityA = rolePriority[a.role] || 0;
            const priorityB = rolePriority[b.role] || 0;
            return priorityB - priorityA;
            })
        : [];

        res.json(sortedUsers);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Server error" });
    }
};

//@desc     Delete user by ID
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const result = await User.findByIdAndDelete(userId);
        if (result) {
            res.json({ msg: 'User deleted successfully' });
        }
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

        // Remove password before sending user
        const userResponse = { ...user };
        delete userResponse.password;

        res.json(userResponse);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


//@desc     Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const { firstName, lastName, bio, birthday, location, profilePicture, coverPhoto } = req.body;

        // build profile object
        const profileFields = { $set: {} };

        if (firstName) profileFields.$set.firstName = firstName;
        if (lastName) profileFields.$set.lastName = lastName;
        if (bio) profileFields.$set.bio = bio;
        if (location) profileFields.$set.location = location;
        if (profilePicture) profileFields.$set.profilePicture = profilePicture;
        if (coverPhoto) profileFields.$set.coverPhoto = coverPhoto;
        if (birthday) profileFields.$set.birthday = birthday;

        // update user
        const user = await User.findByIdAndUpdate(
            req.user.id,
            profileFields,
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Remove password before sending response
        const userResponse = { ...user };
        delete userResponse.password;
        
        res.json(userResponse);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};




module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    deleteUser,
    getCurrentUser,
    updateUserProfile
};