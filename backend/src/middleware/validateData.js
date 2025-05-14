const Joi = require('joi');

// Validate user registration
const validateUserData = (req, res, next) => {
  const schema = Joi.object({
    // Optional fields
    profilePicture: Joi.string().uri().optional(), // assuming it's a URL
    coverPhoto: Joi.string().uri().optional(),
    bio: Joi.string().allow('').optional(),
    location: Joi.string().allow('').optional(),
    birthday: Joi.date().iso().allow(null).optional(),

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



module.exports = {validateUserData};