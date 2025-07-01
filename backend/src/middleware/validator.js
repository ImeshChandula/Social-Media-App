const Joi = require('joi');

// Validate user registration
const validateUser = (req, res, next) => {
  const schema = Joi.object({
    // Required fields
    username: Joi.string().required(),
    email: Joi.string().email().trim().required(),
    phone: Joi.string().pattern(/^(?:\+?\d{9,15})$/).min(9).trim().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().required(),

    // Optional fields
    profilePicture: Joi.string().uri().optional(), // assuming it's a URL
    coverPhoto: Joi.string().uri().optional(),
    bio: Joi.string().allow('').optional(),
    location: Joi.string().allow('').optional(),
    birthday: Joi.date().iso().allow(null).optional(),
    jobCategory: Joi.string().optional(),

    friends: Joi.array().items(Joi.string()).optional(),
    friendRequests: Joi.array().items(Joi.string()).optional(),

    isActive: Joi.boolean().default(true),
    isPublic: Joi.boolean().default(true), // Profile visibility
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
    author: Joi.string().optional(), // typically user ID
    content: Joi.string().optional(),
    // Accept base64 string OR URL OR null
    media: Joi.alternatives().try(
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
    mediaType: Joi.when('media', {
      is: Joi.exist().not(null),
      then: Joi.string().valid('image', 'video').required(),
      otherwise: Joi.string().valid('text', 'image', 'video').optional()
    }),
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
    post: Joi.string().optional(),              // ID of the post the comment belongs to
    user: Joi.string().optional(),              // ID of the user making the comment
    text: Joi.string().optional().allow(null, ''),              // Text content of the comment
    media: Joi.string().uri().allow(null, ''),  // Optional media (URL)
    //     likes: Joi.array().items(Joi.string()).optional(),     // Array of user IDs who liked
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


// Validate story creation
const validateStory = (req, res, next) => {
  const schema = Joi.object({
    // Content validation - at least one of content or media is required
    content: Joi.string().allow('', null).optional(),
    
    // Media validation - supports multiple formats for Cloudinary upload
    media: Joi.alternatives().try(
      Joi.string().uri(),                         // media link
      Joi.string().pattern(/^data:.;base64,./), // base64 image/video
      Joi.object({ path: Joi.string().required() }), // multer-style file
      Joi.valid(null),
      Joi.array().items(
        Joi.alternatives().try(
          Joi.string(),
          Joi.object({ path: Joi.string().required() })
        )
      )
    ).optional(),

    type: Joi.when('media', {
      is: Joi.exist().not(null),
      then: Joi.string().valid('image', 'video').required(),
      otherwise: Joi.string().valid('text', 'image', 'video').optional()
    }),
    // Story styling options
    caption: Joi.string().allow('').max(500).optional(),
    
    // Privacy settings
    privacy: Joi.string().valid('public', 'friends', 'private').default('friends'),

    // Auto-generated fields (optional for validation but will be set by server)
    userId: Joi.string().optional(),
    viewers: Joi.array().items(Joi.string()).optional(),
    viewCount: Joi.number().integer().min(0).optional(),
    isActive: Joi.boolean().default(true),
    
  }).custom((value, helpers) => {
    // Custom validation: ensure at least content or media is provided
    if (!value.content && !value.media) {
      return helpers.error('any.custom', { message: 'Either content or media is required for a story' });
    }
    return value;
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}; 



// Validate comment creation
const validateCategory = (req, res, next) => {
  const schema = Joi.object({
    categoryFor: Joi.string().valid('job_role', 'marketplace', 'other').required(),
    name: Joi.string().required(),
    description: Joi.string().allow('').optional(),
    author: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};



module.exports = {validateUser, validatePost, validateComment, validateStory, validateCategory };