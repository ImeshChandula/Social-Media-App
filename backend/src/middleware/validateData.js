const Joi = require('joi');

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
    
    appealReason: Joi.string().min(10).max(1000).required(),
    additionalInfo: Joi.string().allow('').allow(null).max(2000).optional(),
    
    incidentDate: Joi.date().iso().allow(null),
    contactMethod: Joi.string().valid('email', 'phone').default('email')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};


// Joi validation middleware for MarketPlace
const validateMarketPlace = (req, res, next) => {
    const schema = Joi.object({
        author: Joi.string().required(),
        category: Joi.string().required(),
        title: Joi.string().min(3).max(200).required(),
        description: Joi.string().allow('').max(2000).optional(),
        price: Joi.number().min(0).required(),
        currency: Joi.string().length(3).uppercase().required(),
        contactDetails: Joi.object({
            phone: Joi.string().optional(),
            email: Joi.string().email().optional(),
            whatsapp: Joi.string().optional()
        }).or('phone', 'email', 'whatsapp').required(),
        location: Joi.object({
            city: Joi.string().allow('').optional(),
            state: Joi.string().allow('').optional(),
            country: Joi.string().allow('').optional(),
            postalCode: Joi.string().allow('').optional()
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
        isAccept: Joi.boolean().default(false),
        status: Joi.string().valid('active', 'sold', 'expired', 'removed', 'pending').default('active'),
        expiresAt: Joi.date().allow(null).optional(),
        tags: Joi.array().items(Joi.string().max(50)).max(20).optional()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};


module.exports = {validateUserData, validateMails, validateAppeal, validateMarketPlace};