const express = require('express');
const { authenticateUser, checkAccountStatus } = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

// http://localhost:5000/api/dashboard

router.get('/userSummery', authenticateUser, checkAccountStatus, dashboardController.userSummery);

module.exports = router;