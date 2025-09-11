const Joi = require('joi');
const CategoryService = require('../services/categoryService');

// Initialize category service
const categoryService = new CategoryService();

// Helper function to get valid page categories
const getValidPageCategories = async () => {
    try {
        const categories = await categoryService.findAllActiveByField('pages');
        return categories.map(cat => cat.name.toLowerCase());
    } catch (error) {
        console.error('Error fetching page categories for validation:', error);
        // Fallback to hardcoded categories if database fetch fails
        return ['education', 'music', 'fashion', 'entertainment'];
    }
};

// Dynamic validation schema creation
const createPageValidationSchema = async () => {
    const validCategories = await getValidPageCategories();
    
    return Joi.object({
        pageName: Joi.string().min(3).max(100).required().messages({
            'string.min': 'Page name must be at least 3 characters',
            'string.max': 'Page name cannot exceed 100 characters',
            'any.required': 'Page name is required'
        }),
        username: Joi.string().min(3).max(30).alphanum().optional().allow('').messages({
            'string.min': 'Username must be at least 3 characters',
            'string.max': 'Username cannot exceed 30 characters',
            'string.alphanum': 'Username must contain only alphanumeric characters'
        }),
        description: Joi.string().min(10).max(500).required().messages({
            'string.min': 'Description must be at least 10 characters',
            'string.max': 'Description cannot exceed 500 characters',
            'any.required': 'Description is required'
        }),
        category: Joi.string().valid(...validCategories).required().messages({
            'any.only': `Invalid category selected. Valid categories are: ${validCategories.join(', ')}`,
            'any.required': 'Category is required'
        }),
        // All contact fields are required
        phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).required().messages({
            'string.pattern.base': 'Invalid phone number format',
            'any.required': 'Phone number is required'
        }),
        email: Joi.string().email().required().messages({
            'string.email': 'Invalid email format',
            'any.required': 'Email address is required'
        }),
        address: Joi.string().min(5).max(200).required().messages({
            'string.min': 'Address must be at least 5 characters',
            'string.max': 'Address cannot exceed 200 characters',
            'any.required': 'Business address is required'
        }),
        // Profile picture is required
        profilePicture: Joi.string().required().messages({
            'any.required': 'Profile picture is required'
        })
    });
};

const createUpdatePageValidationSchema = async () => {
    const validCategories = await getValidPageCategories();
    
    return Joi.object({
        pageName: Joi.string().min(3).max(100).optional(),
        username: Joi.string().min(3).max(30).alphanum().optional().allow(''),
        description: Joi.string().min(10).max(500).optional(),
        category: Joi.string().valid(...validCategories).optional(),
        coverPhoto: Joi.string().optional().allow(''),
        profilePicture: Joi.string().optional().allow(''),
        phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional().allow(''),
        email: Joi.string().email().optional().allow(''),
        address: Joi.string().max(200).optional().allow('')
    });
};

// Static validation schemas (non-category dependent)
const pageValidators = {
    updatePageProfile: Joi.object({
        description: Joi.string().min(10).max(500).optional().messages({
            'string.min': 'Description must be at least 10 characters',
            'string.max': 'Description cannot exceed 500 characters'
        }),
        profilePicture: Joi.string().optional().allow(''),
        coverPhoto: Joi.string().optional().allow('')
    }),

    pageQuery: Joi.object({
        search: Joi.string().min(1).max(50).optional(),
        limit: Joi.number().integer().min(1).max(50).default(20),
        page: Joi.number().integer().min(1).default(1)
    }),

    adminReview: Joi.object({
        reviewNote: Joi.string().max(500).optional().allow('')
    }),

    pageBan: Joi.object({
        banReason: Joi.string().min(5).max(500).optional().messages({
            'string.min': 'Ban reason must be at least 5 characters if provided',
            'string.max': 'Ban reason cannot exceed 500 characters'
        })
    })
};

// Dynamic validation middleware
const validatePage = async (req, res, next) => {
    try {
        let schema;
        if (req.method === 'POST') {
            schema = await createPageValidationSchema();
        } else {
            schema = await createUpdatePageValidationSchema();
        }
        
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        next();
    } catch (err) {
        console.error('Error in page validation:', err);
        return res.status(500).json({
            success: false,
            message: 'Validation error'
        });
    }
};

const validatePageQuery = (req, res, next) => {
    const { error } = pageValidators.pageQuery.validate(req.query);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    next();
};

const validateAdminReview = (req, res, next) => {
    const { error } = pageValidators.adminReview.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    next();
};

const validatePageBan = (req, res, next) => {
    const { error } = pageValidators.pageBan.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    next();
};

const updatePageProfileValidator = Joi.object({
    description: Joi.string().min(10).max(500).required().messages({
        'string.min': 'Description must be at least 10 characters',
        'string.max': 'Description cannot exceed 500 characters',
        'any.required': 'Description is required'
    }),
    profilePicture: Joi.string().optional().allow('').messages({
        'string.base': 'Profile picture must be a valid image'
    }),
    coverPhoto: Joi.string().optional().allow('').messages({
        'string.base': 'Cover photo must be a valid image'
    })
});

const validatePageProfile = (req, res, next) => {
    console.log('Validating page profile update:', {
        ...req.body,
        profilePicture: req.body.profilePicture ? 'Present' : 'Not provided',
        coverPhoto: req.body.coverPhoto ? 'Present' : 'Not provided'
    });

    const { error } = updatePageProfileValidator.validate(req.body);
    if (error) {
        console.log('Validation error:', error.details[0].message);
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    
    console.log('Page profile validation passed');
    next();
};

module.exports = {
    pageValidators,
    validatePage,
    validatePageQuery,
    validateAdminReview,
    validatePageBan,
    validatePageProfile,
    updatePageProfileValidator,
    getValidPageCategories
};