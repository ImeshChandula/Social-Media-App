const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (payload, res) => {
    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    res.cookie("jwt", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000, 
        httpOnly: true, // prevent XSS attacks cross-site scripting attacks 
        sameSite: "strict", // CSRF attacks cross-site request forgery attacks
        secure: process.env.NODE_ENV != "development"
    });

    return token;
};

module.exports = {generateToken};