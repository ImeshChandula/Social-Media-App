const User = require('../models/User');
const jwt = require('jsonwebtoken');
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
            _isPasswordModified: true, // Internal flag to trigger password hashing
        });

        await user.save();

        // create JWT token
        const payload = {
            id: user.id,
            role: user.role
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

        console.log("User registered successfully.");
        res.status(201).json({ msg: "User registered successfully" });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};


//@desc     Login user
const loginUser = async (req, res) => {

};


//@desc     Get current user profile
const getCurrentUser  = async (req, res) => {

};




module.exports = {
    registerUser,
    loginUser,
    getCurrentUser
};