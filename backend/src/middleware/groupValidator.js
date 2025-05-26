// validators/groupValidator.js
const groupValidators = {
  createGroup: Joi.object({
    name: Joi.string().min(3).max(100).required().messages({
      'string.min': 'Group name must be at least 3 characters',
      'string.max': 'Group name cannot exceed 100 characters',
      'any.required': 'Group name is required'
    }),
    description: Joi.string().min(10).max(1000).required().messages({
      'string.min': 'Description must be at least 10 characters',
      'string.max': 'Description cannot exceed 1000 characters',
      'any.required': 'Description is required'
    }),
    privacy: Joi.string().valid('Public', 'Private', 'Secret').default('Public'),
    coverPhoto: Joi.string().uri().optional().allow(''),
    profilePicture: Joi.string().uri().optional().allow(''),
    rules: Joi.array().items(Joi.string().max(200)).max(10).optional(),
    tags: Joi.array().items(Joi.string().max(30)).max(5).optional(),
    location: Joi.string().max(100).optional().allow('')
  }),

  updateGroup: Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    description: Joi.string().min(10).max(1000).optional(),
    privacy: Joi.string().valid('Public', 'Private', 'Secret').optional(),
    coverPhoto: Joi.string().uri().optional().allow(''),
    profilePicture: Joi.string().uri().optional().allow(''),
    rules: Joi.array().items(Joi.string().max(200)).max(10).optional(),
    tags: Joi.array().items(Joi.string().max(30)).max(5).optional(),
    location: Joi.string().max(100).optional().allow(''),
    isActive: Joi.boolean().optional()
  }),

  groupQuery: Joi.object({
    privacy: Joi.string().valid('Public', 'Private').optional(),
    search: Joi.string().min(1).max(50).optional(),
    tags: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ).optional(),
    limit: Joi.number().integer().min(1).max(50).default(10),
    page: Joi.number().integer().min(1).default(1),
    sortBy: Joi.string().valid('name', 'createdAt', 'memberCount').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),

  memberAction: Joi.object({
    userId: Joi.string().required(),
    action: Joi.string().valid('approve', 'reject', 'remove', 'promote', 'demote').required(),
    role: Joi.string().valid('member', 'moderator', 'admin').optional()
  })
};

module.exports = groupValidators;