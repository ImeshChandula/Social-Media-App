const express = require('express');
const { authenticateUser, authorizeRoles, checkAccountStatus } = require('../middleware/authMiddleware');
const jobCategoryController = require('../controllers/jobCategoryController');
const { validateJobCategory } = require("../middleware/validator");

const router = express.Router();

// http://localhost:5000/api/jobCategories

// Public routes
router.get('/active', authenticateUser, jobCategoryController.getAllActiveCategories);

// Admin routes
router.post('/create', validateJobCategory, authenticateUser, checkAccountStatus, authorizeRoles("admin", "super_admin"), jobCategoryController.createCategory);
router.get('/getAll', authenticateUser, checkAccountStatus, authorizeRoles("admin", "super_admin"), jobCategoryController.getAllCategories);
router.patch('/update/:id', authenticateUser, checkAccountStatus, authorizeRoles("admin", "super_admin"), jobCategoryController.updateCategory);
router.delete('/delete/:id', authenticateUser, checkAccountStatus, authorizeRoles("admin", "super_admin"), jobCategoryController.deleteCategory);


module.exports = router;