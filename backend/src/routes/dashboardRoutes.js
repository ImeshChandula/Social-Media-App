const express = require('express');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

// http://localhost:5000/api/dashboard

router.get('/userSummery', authenticateUser, authorizeRoles("admin", "super_admin"), dashboardController.userSummery);
router.get('/appealSummery', authenticateUser, authorizeRoles("admin", "super_admin"), dashboardController.appealSummery);
router.get('/messageSummery', authenticateUser, authorizeRoles("admin", "super_admin"), dashboardController.messageSummary);
router.get('/categorySummery', authenticateUser, authorizeRoles("admin", "super_admin"), dashboardController.categorySummery);
router.get('/profileReportSummary', authenticateUser, authorizeRoles("admin", "super_admin"), dashboardController.profileReportSummary);

module.exports = router;
