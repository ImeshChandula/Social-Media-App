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


module.exports = {validateUserData, validateMails};