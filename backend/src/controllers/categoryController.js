const populateAuthor = require('../utils/populateAuthor');
const CategoryService = require('../services/categoryService');

const jobCategoryService = new CategoryService();


// Create new category (admin only)
const createCategory = async (req, res) => {
    try {
        const { categoryFor, name, description } = req.body;

        if (!name || !categoryFor) {
            return res.status(400).json({ success: false, message: 'Enter required fields' });
        }

        const category = await jobCategoryService.findByNameAndField(name, categoryFor);
        if (category) {
            return res.status(400).json({ success: false, message: 'Category already exists' });
        }

        const categoryData = {
            categoryFor: categoryFor,
            name: name,
            author: req.user.id,
            isActive: true
        };

        if (description !== undefined && description !== null) {
            categoryData.description = description;
        }

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


// Get all active categories (for users)
const getAllActiveCategories = async (req, res) => {
    try {
        const field = req.params.fieldName;
        if (field !== "job_role" && field !== "marketplace" && field !== "pages"){
            return res.status(400).json({success: false, message: "Invalid field name"});
        }

        const categories = await jobCategoryService.findAllActiveByField(field);
        if (!categories) {
            return res.status(400).json({success: false, message: "Error in getting active categories"});
        }

        if (categories.length === 0) {
            return res.status(200).json({ 
                success: true,
                message: "No Active Categories", 
                data: [] 
            });
        }

        // Return minimal data - just id and name
        const simplifiedCategories = categories.map(category => ({
            id: category.id,
            name: category.name
        }));

        res.status(200).json({ 
            success: true, 
            message: "Categories received", 
            count: simplifiedCategories.length,
            data: simplifiedCategories 
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
      });
    }
};


// Get all categories (for admin)
const getAllCategories = async (req, res) => {
    try {
        const field = req.params.fieldName;
        if (field !== "job_role" && field !== "marketplace" && field !== "pages"){
            return res.status(400).json({success: false, message: "Invalid field name"});
        }

        const allCategories = await jobCategoryService.findAll();

        const categories = await jobCategoryService.findAllByField(field);
        if (!categories) {
            return res.status(400).json({success: false, message: "Error in getting all categories"});
        }

        const populatedCategories = await populateAuthor(categories);

        res.status(200).json({ 
            success: true, 
            message: `'${field}' Categories received`, 
            allCategoriesCount: allCategories.length,
            count: populatedCategories.length,
            data: populatedCategories 
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
      });
    }
};

// Update category (admin only)
const updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { categoryFor, name, description, isActive } = req.body;

        const category = await jobCategoryService.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success:false, message: 'Job category not found' });
        }

        const updateData = {};

        if(categoryFor !== undefined) updateData.categoryFor = categoryFor;
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

// Delete category (admin only)
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