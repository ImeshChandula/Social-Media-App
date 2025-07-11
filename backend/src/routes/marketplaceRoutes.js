const express = require('express');
const { validateMarketPlace, validateMarketPlaceUpdate } = require('../middleware/validateData');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');
const marketplaceController = require('../controllers/marketplaceController');

const router = express.Router();

// http://localhost:5000/api/marketplace

router.post('/createItem', validateMarketPlace, authenticateUser, marketplaceController.createItem);
router.get('/getAllItems', authenticateUser, authorizeRoles("super_admin"), marketplaceController.getAllItems);
router.get('/myItems', authenticateUser, marketplaceController.getAllMyItems);
router.get('/activeItems', authenticateUser, marketplaceController.getAllActiveItems);
router.patch('/update/:id', validateMarketPlaceUpdate, authenticateUser, marketplaceController.updateItem);
router.delete('/delete/:id', authenticateUser, marketplaceController.deleteItem);
router.post('/track-interaction', authenticateUser, marketplaceController.trackUserInteraction);

module.exports = router;
