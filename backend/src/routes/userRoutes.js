const express = require('express');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');
const {

} = require('../controllers/userController');


const router = express.Router();

// Routes
// http://localhost:5000/api/users


module.exports = router;