const express = require('express');
const { validateMarketPlace } = require('../middleware/validateData');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');
const marketplaceController = require('../controllers/marketplaceController');

const router = express.Router();

// http://localhost:5000/api/marketplace

router.post('/createItem', validateMarketPlace, authenticateUser, marketplaceController.createItem);
router.get('/getAllItems', authenticateUser, authorizeRoles("super_admin"), marketplaceController.getAllItems);
router.get('/myItems', authenticateUser, marketplaceController.getAllMyItems);
router.get('/activeItems', authenticateUser, marketplaceController.getAllActiveItems);
router.delete('/delete/:id', authenticateUser, marketplaceController.deleteItem);


module.exports = router;
