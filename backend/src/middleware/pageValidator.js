const Joi = require('joi');

const pageValidators = {
  createPage: Joi.object({
    name: Joi.string().min(3).max(100).required().messages({
      'string.min': 'Page name must be at least 3 characters',
      'string.max': 'Page name cannot exceed 100 characters',
      'any.required': 'Page name is required'
    }),
    description: Joi.string().min(10).max(500).required().messages({
      'string.min': 'Description must be at least 10 characters',
      'string.max': 'Description cannot exceed 500 characters',
      'any.required': 'Description is required'
    }),
    category: Joi.string().valid(
      'Business', 'Entertainment', 'Education', 'Sports', 
      'Technology', 'Health', 'Travel', 'Food', 'Other'
    ).required().messages({
      'any.only': 'Invalid category selected',
      'any.required': 'Category is required'
    }),
    coverPhoto: Joi.string().uri().optional().allow(''),
    profilePicture: Joi.string().uri().optional().allow(''),
    website: Joi.string().uri().optional().allow(''),
    phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional().allow('').messages({
      'string.pattern.base': 'Invalid phone number format'
    }),
    email: Joi.string().email().optional().allow(''),
    address: Joi.string().max(200).optional().allow('')
  }),

  updatePage: Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    description: Joi.string().min(10).max(500).optional(),
    category: Joi.string().valid(
      'Business', 'Entertainment', 'Education', 'Sports', 
      'Technology', 'Health', 'Travel', 'Food', 'Other'
    ).optional(),
    coverPhoto: Joi.string().uri().optional().allow(''),
    profilePicture: Joi.string().uri().optional().allow(''),
    website: Joi.string().uri().optional().allow(''),
    phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional().allow(''),
    email: Joi.string().email().optional().allow(''),
    address: Joi.string().max(200).optional().allow(''),
    isPublished: Joi.boolean().optional()
  }),

  pageQuery: Joi.object({
    category: Joi.string().valid(
      'Business', 'Entertainment', 'Education', 'Sports', 
      'Technology', 'Health', 'Travel', 'Food', 'Other'
    ).optional(),
    search: Joi.string().min(1).max(50).optional(),
    limit: Joi.number().integer().min(1).max(50).default(10),
    page: Joi.number().integer().min(1).default(1),
    sortBy: Joi.string().valid('name', 'createdAt', 'followers').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc')
  })
};

module.exports = pageValidators;