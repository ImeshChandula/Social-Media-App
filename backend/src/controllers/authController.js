const UserService = require('../services/userService');
const { generateToken } = require("../utils/jwtToken");
require('dotenv').config();

//@desc    Register user
const registerUser = async (req, res) => {
    try {
        const { username, email, phone, password, firstName, lastName, role } = req.body;

        // check if user already exists
        let user = await UserService.findByEmail(email);
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        const checkPhone = await UserService.findByPhone(phone);
        if (checkPhone) {
            return res.status(400).json({ message: "Phone number already exists" });
        }

        const lowercaseUsername = username.toLowerCase();

        // generate a num between 1-100
        const index = Math.floor(Math.random() * 100) + 1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${index}.png`;
        const defaultCover = process.env.DEFAULT_COVER_PHOTO || "https://static.cognitoforms.com/website/assets/default-video-cover-photo.Djn4Ebbl.png";
        
        // create new user
        const userData = {
            username: lowercaseUsername,
            email,
            phone,
            password,
            firstName,
            lastName,
            role: role || 'user',
            profilePicture: randomAvatar,
            coverPhoto: defaultCover,
            isActive: true,
            lastLogin : new Date().toISOString(),
        };

        const newUser = await UserService.create(userData);

        // create JWT token
        const payload = {
            id: newUser.id,
            username: newUser.username,
            role: newUser.role,
        };

        generateToken(payload, res);
        newUser.password = undefined;
        newUser._isPasswordModified = undefined;

        res.status(201).json({success: true, message: "User registered successfully", newUser });
        console.log("User registered successfully.");
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};


//@desc     Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // check if user exists
        const existingUser = await UserService.findByEmail(email);
        if (!existingUser){
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // validate password
        const isMatch = await UserService.comparePassword(password, existingUser.password);
        if (!isMatch){
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // update last login
        const updateData = {
            isActive: true,
            lastLogin : new Date().toISOString(),
        };
        
        const user = await UserService.updateById(existingUser.id, updateData);

        // create JWT token
        const payload = {
            id: user.id,
            username: user.username,
            role: user.role,
            accountStatus: user.accountStatus,
        };

        generateToken(payload, res);
        user.password = undefined;
        user._isPasswordModified = undefined;

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
    user._isPasswordModified = undefined;
    
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

        await UserService.updateById(req.user.id, updateData);

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