const Joi = require('joi');

// Validate user registration
const validateUser = (req, res, next) => {
  const schema = Joi.object({
    // Required fields
    username: Joi.string().required(),
    email: Joi.string().email().trim().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().required(),

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



// Validate post creation
const validatePost = (req, res, next) => {
  const schema = Joi.object({
    author: Joi.string().required(), // typically user ID
    content: Joi.string().optional(),
    media: Joi.array().items(Joi.string().uri()).optional(),
    mediaType: Joi.string().valid('photo', 'video').optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    privacy: Joi.string().valid('public', 'private', 'friends').default('public'),
    location: Joi.string().allow('', null).optional(),

    // Optional but structured
    likes: Joi.array().items(Joi.string()).optional(),
    comments: Joi.array().items(Joi.object()).optional(),
    shares: Joi.array().items(Joi.string()).optional(),

    isEdited: Joi.boolean().optional(),
    editHistory: Joi.array().items(Joi.object()).optional(),

    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};



// Validate comment creation
const validateComment = (req, res, next) => {
  const schema = Joi.object({
    post: Joi.string().required(),              // ID of the post the comment belongs to
    user: Joi.string().required(),              // ID of the user making the comment
    text: Joi.string().required(),              // Text content of the comment
    media: Joi.string().uri().allow(null, ''),  // Optional media (URL)
    likes: Joi.array().items(Joi.string()).optional(),     // Array of user IDs who liked
    replies: Joi.array().items(Joi.object()).optional(),   // Array of replies (optional objects)
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};



module.exports = {validateUser, validatePost, validateComment};