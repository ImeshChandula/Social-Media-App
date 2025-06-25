const Joi = require('joi');
const { APPEAL_STATUS, APPEAL_PRIORITY } = require('../enums/appeal');

// Validate user registration
const validateUserData = (req, res, next) => {
  const schema = Joi.object({
    // User basic info - now included for profile updates
    username: Joi.string().min(3).max(30).optional(),
    firstName: Joi.string().min(1).max(50).optional(),
    lastName: Joi.string().min(1).max(50).optional(),
    phone: Joi.string().pattern(/^(?:\+?\d{9,15})$/).min(9).trim().optional(),

    // Profile fields
    profilePicture: Joi.string().uri().optional(), // assuming it's a URL
    coverPhoto: Joi.string().uri().optional(),
    bio: Joi.string().allow('').optional(),
    location: Joi.string().allow('').optional(),
    birthday: Joi.date().iso().allow(null).optional(),
    jobCategory: Joi.string().optional(),
    
    friends: Joi.array().items(Joi.string()).optional(),
    friendRequests: Joi.array().items(Joi.string()).optional(),

    isActive: Joi.boolean().optional(),
    lastLogin: Joi.date().iso().optional(),

    role: Joi.string().valid('user', 'admin', 'super_admin').optional(),

    accountStatus: Joi.string().valid('active', 'inactive', 'banned').optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};


// Validate support mails
const validateMails = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(1).required(), 
    email: Joi.string().email().required(),
    subject: Joi.string().min(1).required(),
    message: Joi.string().min(1).required(),
    author: Joi.string().min(1).required(),
    isRead: Joi.boolean().optional(),
    createdAt: Joi.string().isoDate().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};


// Validate support mails
const validateAppeal = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    author: Joi.string().optional(),
    
    appealReason: Joi.string().min(10).max(1000).required(),
    additionalInfo: Joi.string().allow('').max(2000).default(null),
    incidentDate: Joi.date().iso().allow('', null).default(null),
    contactMethod: Joi.string().valid('email', 'phone').default('email'),

    adminNotes: Joi.string().allow('').max(2000).default(''),
    reviewedAt: Joi.date().iso().allow(null).default(null),
    responseMessage: Joi.string().allow('').max(2000).default(''),

    appealNumber: Joi.string().default(''),
    
    communications: Joi.array().items(Joi.object()).default([]),

    status: Joi.string().valid(...Object.values(APPEAL_STATUS)).default(APPEAL_STATUS.PENDING),
    priority: Joi.string().valid(...Object.values(APPEAL_PRIORITY)).default(APPEAL_PRIORITY.MEDIUM),

  });

  const { error, value } = schema.validate(req.body, {
        allowUnknown: false,
        stripUnknown: true,
        abortEarly: false
    });

    if (error) {
        return res.status(400).json({ 
            success: false,
            message: error.details[0].message,
            errors: error.details.map(detail => ({
              field: detail.path.join('.'),
              message: detail.message
            }))
        });
    }

    req.body = value;
    next();
};


// Validate support mails
const validateAppealUpdate = (req, res, next) => {
  const schema = Joi.object({
    status: Joi.string().valid(...Object.values(APPEAL_STATUS)).optional(),
    priority: Joi.string().valid(...Object.values(APPEAL_PRIORITY)).optional(),
    adminNotes: Joi.string().max(2000).required(),
    responseMessage: Joi.string().max(2000).required(),
    reviewedAt: Joi.date().iso().optional()
  });

  const { error, value } = schema.validate(req.body, {
    allowUnknown: false,
    stripUnknown: true,
    abortEarly: false
  });

  if (error) {
    return res.status(400).json({ 
      success: false,
      message: error.details[0].message,
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  req.body = value;
  next();
};

// CREATE VALIDATOR - With defaults
const validateMarketPlace = (req, res, next) => {
    const schema = Joi.object({
        author: Joi.string().optional(),
        category: Joi.string().required(),
        title: Joi.string().min(3).max(200).required(),
        description: Joi.string().allow('').max(2000).default(''),
        price: Joi.number().min(0).required(),
        currency: Joi.string().length(3).uppercase().required(),
        contactDetails: Joi.object({
            phone: Joi.string().optional(),
            email: Joi.string().email().optional(),
            whatsapp: Joi.string().optional()
        }).or('phone', 'email', 'whatsapp').required(),
        location: Joi.object({
            city: Joi.string().allow('').default(''),
            state: Joi.string().allow('').default(''),
            country: Joi.string().allow('').default(''),
            postalCode: Joi.string().allow('').default('')
        }).optional(),
        conditionType: Joi.string().valid('new', 'like_new', 'good', 'fair', 'poor').default('new'),
        images: Joi.alternatives().try(
              Joi.string().uri(),                         // media link
              Joi.string().pattern(/^data:.*;base64,.*/), // base64 image/video
              Joi.array().items(
                Joi.alternatives().try(
                  Joi.string().uri(),                         // media URL in array
                  Joi.string().pattern(/^data:.*;base64,.*/), // base64 in array
                  Joi.object({                                // file object from multer
                    path: Joi.string().required()
                  })
                )
              ),
              Joi.valid(null)
            ).optional(),
        quantity: Joi.number().integer().min(1).default(1),
        isNegotiable: Joi.boolean().default(false),
        isAvailable: Joi.boolean().default(true),
        isAccept: Joi.boolean().default(true),
        status: Joi.string().valid('active', 'sold', 'expired', 'removed', 'pending').default('active'),
        expiresAt: Joi.date().iso().default(() => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()),
        tags: Joi.array().items(Joi.string().max(50)).max(20).default([])
    });

    // THE KEY CHANGE: Use the validated value with defaults applied
    const { error, value } = schema.validate(req.body, {
        allowUnknown: false,
        stripUnknown: true,
        abortEarly: false
    });

    if (error) {
        return res.status(400).json({ 
            success: false,
            message: error.details[0].message,
            errors: error.details.map(detail => ({
              field: detail.path.join('.'),
              message: detail.message
            }))
        });
    }

    // Replace req.body with the validated value that includes defaults
    req.body = value;
    next();
};


// UPDATE VALIDATOR - NO defaults, all fields optional
const validateMarketPlaceUpdate = (req, res, next) => {
    const schema = Joi.object({
        category: Joi.string().optional(),
        title: Joi.string().min(3).max(200).optional(),
        description: Joi.string().allow('').max(2000).optional(),
        price: Joi.number().min(0).optional(),
        currency: Joi.string().length(3).uppercase().optional(),
        contactDetails: Joi.object({
            phone: Joi.string().allow('').optional(),
            email: Joi.string().email().allow('').optional(),
            whatsapp: Joi.string().allow('').optional()
        }).optional(),
        location: Joi.object({
            city: Joi.string().allow('').optional(),
            state: Joi.string().allow('').optional(),
            country: Joi.string().allow('').optional(),
            postalCode: Joi.string().allow('').optional()
        }).optional(),
        conditionType: Joi.string().valid('new', 'like_new', 'good', 'fair', 'poor').optional(),
        images: Joi.alternatives().try(
            Joi.string().uri(),
            Joi.array().items(Joi.string().uri()),
            Joi.valid(null)
        ).optional(),
        quantity: Joi.number().integer().min(1).optional(),
        isNegotiable: Joi.boolean().optional(),
        isAvailable: Joi.boolean().optional(),
        isAccept: Joi.boolean().optional(),
        status: Joi.string().valid('active', 'sold', 'expired', 'removed', 'pending').optional(),
        expiresAt: Joi.date().iso().optional(),
        tags: Joi.array().items(Joi.string().max(50)).max(20).optional()
    })
    .min(1) // Require at least one field to update
    .unknown(false);

    const { error, value } = schema.validate(req.body, {
        allowUnknown: false,
        stripUnknown: true,
        abortEarly: false
    });

    if (error) {
        return res.status(400).json({ 
            success: false,
            message: error.details[0].message,
            errors: error.details.map(detail => ({
              field: detail.path.join('.'),
              message: detail.message
            }))
        });
    }

    req.body = value;
    next();
};


module.exports = {validateUserData, validateMails, validateAppeal, validateAppealUpdate, validateMarketPlace, validateMarketPlaceUpdate};