const User = require('../models/User');
const { generateToken } = require("../utils/jwtToken");
require('dotenv').config();

//@desc    Register user
const registerUser = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, role } = req.body;

        // check if user already exists
        let user = await User.findByEmail(email);
        if (user) {
            return res.status(400).json({ msg: "User already exists" });
        }

        // create new user
        const newUser = {
            username,
            email,
            password,
            firstName,
            lastName,
            role: role || 'user',
        };

        await User.create(newUser);

        // create JWT token
        const payload = {
            id: newUser.id,
            username: newUser.username,
            role: newUser.role,
        };

        generateToken(payload, res);
        newUser.password = undefined;

        res.status(201).json({ msg: "User registered successfully", newUser });
        console.log("User registered successfully.");
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};


//@desc     Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // check if user exists
        const user = await User.findByEmail(email);
        if (!user){
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // validate password
        const isMatch = await User.comparePassword(password, user.password);
        if (!isMatch){
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // update last login
        const updateData = {
            isActive: true,
            lastLogin : new Date().toISOString(),
        };
        
        await User.updateById(user.id, updateData);

        // create JWT token
        const payload = {
            id: user.id,
            username: user.firstName + ' ' + user.lastName || user.username,
            role: user.role,
            accountStatus: user.accountStatus,
        };

        generateToken(payload, res);
        user.password = undefined;

        res.status(200).json({message: 'Login successful', user });
    } catch (err) {
        console.error("Login error:", err.message);
        res.status(500).send('Server Error');
    }
};


// Get current user profile
const checkCurrent = async (req, res) => {
  try {
    const user = req.user;
    user.password = undefined;
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


const logout = async (req, res) => {
    try {
        const updateData = {
            isActive: false,
        };

        await User.updateById(req.user.id, updateData);

        res.cookie("jwt", "", {maxAge: 0});
        res.status(200).json({
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {registerUser, loginUser, checkCurrent, logout};