const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
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

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // create new user
        user = new User({
            username,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: role || 'user',
        });

        await user.save();

        console.log("User registered successfully.");
        res.status(201).json({ msg: "User registered successfully" });

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

        // For debugging - DO NOT keep in production code
        console.log(`Stored password hash: ${user.password.substring(0, 20)}...`);

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
        const users = await User.find({}, "-password");

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


//@desc     Get current user profile
const getCurrentUser  = async (req, res) => {

};




module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    getCurrentUser
};