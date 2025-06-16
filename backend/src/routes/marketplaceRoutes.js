const express = require('express');
const { validateMarketPlace } = require('../middleware/validateData');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');
const marketplaceController = require('../controllers/marketplaceController');

const router = express.Router();

// http://localhost:5000/api/marketplace

router.post('/createItem', validateMarketPlace, authenticateUser, marketplaceController.createItem);

 
module.exports = router;