const express = require('express');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');
const jobCategoryController = require('../controllers/jobCategoryController');
const { validateJobCategory } = require("../middleware/validator");

const router = express.Router();

// http://localhost:5000/api/jobCategories

// Public routes
router.get('/active', authenticateUser, jobCategoryController.getAllActiveCategories);

// Admin routes
router.post('/create', validateJobCategory, authenticateUser, authorizeRoles("admin", "super_admin"), jobCategoryController.createCategory);
router.get('/getAll', authenticateUser, authorizeRoles("admin", "super_admin"), jobCategoryController.getAllCategories);
router.patch('/update/:id', authenticateUser, authorizeRoles("admin", "super_admin"), jobCategoryController.updateCategory);
router.get('/delete/:id', authenticateUser, authorizeRoles("admin", "super_admin"), jobCategoryController.deleteCategory);


module.exports = router;