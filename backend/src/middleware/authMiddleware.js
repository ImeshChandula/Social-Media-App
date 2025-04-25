const jwt = require("jsonwebtoken");
const { admin } = require('../config/firebase');
require('dotenv').config();

const authenticateUser = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")){
    return res.status(401).json({ message: "No token, Authorization Access Denied" });
  } 

  const token = authHeader.split(" ")[1]; // Extract token after "Bearer"

  try {
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




const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access Forbidden" });
    }
    next();
  };
};

module.exports = { authenticateUser, authorizeRoles };
