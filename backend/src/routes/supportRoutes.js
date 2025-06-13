const express = require('express');
const { validateMails } = require('../middleware/validateData');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');
const supportController = require('../controllers/supportController');

const router = express.Router();

// http://localhost:5000/api/support

router.post('/sendMail', validateMails, authenticateUser, supportController.sendMail);
router.get('/getAllMails', authenticateUser, authorizeRoles("admin", "super_admin"), supportController.getAllMails);
router.patch('/markAsRead/:id', authenticateUser, authorizeRoles("admin", "super_admin"), supportController.markAsRead);

module.exports = router;