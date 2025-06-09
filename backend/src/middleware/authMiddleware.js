const jwt = require("jsonwebtoken");
require('dotenv').config();

const authenticateUser = (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      console.log("Authenticated User:", req.user);

      next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(400).json({ message: "Invalid Token" });
  }
};


const checkAccountStatus = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "User not authenticated" });
  }
  
  if (req.user.accountStatus !== 'active') {
    return res.status(403).json({ 
      success: false,
      message: "Account is inactive or banned. Please contact support." 
    });
  }
  
  next();
};


const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access Forbidden" });
    }
    next();
  };
};

module.exports = { authenticateUser, authorizeRoles, checkAccountStatus };
