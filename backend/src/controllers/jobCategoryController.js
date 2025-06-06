const populateAuthor = require('../utils/populateAuthor');
const JobCategoryService = require('../services/jobCategoryService');

const jobCategoryService = new JobCategoryService();

// Get all active job categories (for users)
const getAllActiveCategories = async (req, res) => {
    try {
        const categories = await jobCategoryService.findAllActive();

        if (categories.length === 0) {
            return res.status(200).json({ 
                success: true,
                message: "No Active Categories", 
                data: categories 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "Categories received", 
            data: categories 
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching job categories',
            error: error.message
      });
    }
};

// Get all categories (for admin)
const getAllCategories = async (req, res) => {
    try {
        const categories = await jobCategoryService.findAll();

        const populatedCategories = await populateAuthor(categories);

        res.status(200).json({ 
            success: true, 
            message: "Categories received", 
            data: populatedCategories 
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching job categories',
            error: error.message
      });
    }
};

// Create new job category (admin only)
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Category name is required' });
        }

        const category = await jobCategoryService.findByJobName(name);
        if (category) {
            return res.status(400).json({ success: false, message: 'Category already exists' });
        }

        const categoryData = {
            name: name,
            description: description,
            author: {
                id: req.user.id
            },
        };

        const newCategory = await jobCategoryService.create(categoryData);
        
        res.status(201).json({
            success: true,
            message: 'Job category created successfully',
            data: newCategory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating job category',
            error: error.message
        });
    }
};

// Update job category (admin only)
const updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { name, description, isActive } = req.body;

        const category = await jobCategoryService.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success:false, message: 'Job category not found' });
        }

        const updateData = {};

        if(name !== undefined) updateData.name = name;
        if(description !== undefined) updateData.description = description;
        if(isActive !== undefined) updateData.isActive = isActive;

        const updatedCategory = await jobCategoryService.updateById(categoryId, updateData);
        if (!updatedCategory) {
            return res.status(404).json({ success:false, message: 'Failed to update post' });
        }

        res.status(200).json({
            success: true,
            message: 'Job category updated successfully',
            data: updatedCategory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating job category',
            error: error.message
        });
    }
};

// Delete job category (admin only)
const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;

        const category = await jobCategoryService.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success:false, message: 'Job category not found' });
        }

        await jobCategoryService.deleteById(categoryId);

        res.status(200).json({
            success: true,
            message: 'Job category deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting job category',
            error: error.message
        });
    }
};

module.exports = {
    getAllActiveCategories,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
};