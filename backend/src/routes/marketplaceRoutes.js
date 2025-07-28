const express = require('express');
const { validateMarketPlace, validateMarketPlaceUpdate } = require('../middleware/validateData');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');
const marketplaceController = require('../controllers/marketplaceController');
const { logMarketplaceCreate, logActivity} = require('../middleware/activityLogger'); // Import activity logging middleware

const router = express.Router();

// http://localhost:5000/api/marketplace

router.post('/createItem', validateMarketPlace, authenticateUser, logMarketplaceCreate, marketplaceController.createItem); // added activity logging
router.get('/getAllItems', authenticateUser, authorizeRoles("super_admin"), marketplaceController.getAllItems);
router.get('/myItems', authenticateUser, marketplaceController.getAllMyItems);
router.get('/activeItems', authenticateUser, marketplaceController.getAllActiveItems);
router.patch('/update/:id', validateMarketPlaceUpdate, authenticateUser, logActivity('marketplace_item_update', (req) => ({ itemId: req.params.id, fieldsUpdate: Object.keys(req.body) }) ), marketplaceController.updateItem); // added activity logging
router.delete('/delete/:id', authenticateUser, logActivity('marketplace_item_delete', (req) => ({ itemId: req.params.id }) ), marketplaceController.deleteItem); // added activity logging
router.post('/track-interaction', authenticateUser, marketplaceController.trackUserInteraction);

module.exports = router;
