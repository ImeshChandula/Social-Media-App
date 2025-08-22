const Joi = require('joi');

const pageValidators = {
  createPage: Joi.object({
    pageName: Joi.string().min(3).max(100).required().messages({
      'string.min': 'Page name must be at least 3 characters',
      'string.max': 'Page name cannot exceed 100 characters',
      'any.required': 'Page name is required'
    }),
    username: Joi.string().min(3).max(30).alphanum().optional().messages({
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username cannot exceed 30 characters',
      'string.alphanum': 'Username must contain only alphanumeric characters'
    }),
    description: Joi.string().min(10).max(500).required().messages({
      'string.min': 'Description must be at least 10 characters',
      'string.max': 'Description cannot exceed 500 characters',
      'any.required': 'Description is required'
    }),
    category: Joi.string().valid('education', 'music', 'fashion', 'entertainment').required().messages({
      'any.only': 'Invalid category selected',
      'any.required': 'Category is required'
    }),
    phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional().allow('').messages({
      'string.pattern.base': 'Invalid phone number format'
    }),
    email: Joi.string().email().optional().allow(''),
    address: Joi.string().max(200).optional().allow('')
  }),

  updatePage: Joi.object({
    pageName: Joi.string().min(3).max(100).optional(),
    username: Joi.string().min(3).max(30).alphanum().optional(),
    description: Joi.string().min(10).max(500).optional(),
    category: Joi.string().valid('education', 'music', 'fashion', 'entertainment').optional(),
    coverPhoto: Joi.string().optional().allow(''),
    profilePicture: Joi.string().optional().allow(''),
    phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional().allow(''),
    email: Joi.string().email().optional().allow(''),
    address: Joi.string().max(200).optional().allow('')
  }),

  pageQuery: Joi.object({
    category: Joi.string().valid('education', 'music', 'fashion', 'entertainment').optional(),
    search: Joi.string().min(1).max(50).optional(),
    limit: Joi.number().integer().min(1).max(50).default(20),
    page: Joi.number().integer().min(1).default(1)
  }),

  adminReview: Joi.object({
    reviewNote: Joi.string().max(500).optional().allow('')
  }),

  // Ban validation
  pageBan: Joi.object({
    banReason: Joi.string().min(5).max(500).optional().messages({
      'string.min': 'Ban reason must be at least 5 characters if provided',
      'string.max': 'Ban reason cannot exceed 500 characters'
    })
  })
};

// Validation middleware functions
const validatePage = (req, res, next) => {
    const schema = req.method === 'POST' ? pageValidators.createPage : pageValidators.updatePage;
    
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    next();
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

//Ban validation middleware
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

module.exports = {
    pageValidators,
    validatePage,
    validatePageQuery,
    validateAdminReview,
    validatePageBan
}; 