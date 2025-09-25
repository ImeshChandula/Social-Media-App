const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (payload, res) => {
    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    const isDevelopment = process.env.NODE_ENV === 'development';
    const cookieDomain = process.env.PRODUCTION_COOKIE_DOMAIN;

    const cookieOptions = {
        maxAge: 1 * 24 * 60 * 60 * 1000, // MS
        // prevent XSS attacks cross-site scripting attacks
        httpOnly: true,  
        // CSRF attacks cross-site request forgery attacks
        // Allow cross-origin in production
        sameSite: isDevelopment ? "strict" : "none", 
        secure: !isDevelopment,
        domain: isDevelopment ? undefined : cookieDomain,
        path: '/'
    };

    res.cookie("jwt", token, cookieOptions);

    return token;
};

const removeToken = (res) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const cookieDomain = process.env.PRODUCTION_COOKIE_DOMAIN;

    const cookieOptions = {
        maxAge: 0,
        httpOnly: true,
        sameSite: isDevelopment ? "strict" : "none",
        secure: !isDevelopment,
        domain: isDevelopment ? undefined : cookieDomain,
        path: '/'
    };

    // Clear cookie with domain (for production)
    res.cookie("jwt", "", cookieOptions);

    // Clear cookie without domain (fallback)
    if (!isDevelopment) {
        res.cookie("jwt", "", {
            ...cookieOptions,
            domain: undefined
        });
    }
};

module.exports = { generateToken, removeToken };