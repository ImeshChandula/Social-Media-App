const express = require('express');
const { validateAppeal } = require('../middleware/validateData');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');
const appealController = require('../controllers/appealController');

const router = express.Router();

// http://localhost:5000/api/appeal

router.post('/create', validateAppeal, authenticateUser, appealController.createAppeal);
router.get('/getAll', authenticateUser, authorizeRoles("super_admin", "admin"), appealController.getAllAppeals);
router.delete('/delete/:id', authenticateUser, authorizeRoles("super_admin"), appealController.deleteAppeal);

module.exports = router;