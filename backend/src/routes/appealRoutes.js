const express = require('express');
const { validateAppeal } = require('../middleware/validateData');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');
const appealController = require('../controllers/appealController');

const router = express.Router();

// http://localhost:5000/api/appeal

router.post('/create', validateAppeal, authenticateUser, appealController.createAppeal);

module.exports = router;