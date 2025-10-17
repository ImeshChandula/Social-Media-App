const Joi = require('joi');
const { optionalImageSchema } = require('./schemas/image.firebase.schema');

// Valid review types
const VALID_REVIEW_TYPES = ['text', 'image', 'video', 'image_text', 'video_text'];

const reviewValidators = {
    createReview: Joi.object({
        rating: Joi.number().integer().min(1).max(5).required().messages({
            'number.min': 'Rating must be at least 1',
            'number.max': 'Rating cannot exceed 5',
            'any.required': 'Rating is required'
        }),
        reviewType: Joi.string().valid(...VALID_REVIEW_TYPES).required().messages({
            'any.only': `Review type must be one of: ${VALID_REVIEW_TYPES.join(', ')}`,
            'any.required': 'Review type is required'
        }),
        content: Joi.string().max(1000).optional().allow('').messages({
            'string.max': 'Content cannot exceed 1000 characters'
        }),
        media: Joi.array().items(Joi.string()).max(6).optional().messages({
            'array.max': 'Maximum 6 media items allowed'
        }),
        mediaType: Joi.string().valid('image', 'video').optional().messages({
            'any.only': 'Media type must be either image or video'
        })
    }),

    updateReview: Joi.object({
        rating: Joi.number().integer().min(1).max(5).optional().messages({
            'number.min': 'Rating must be at least 1',
            'number.max': 'Rating cannot exceed 5'
        }),
        content: Joi.string().max(1000).optional().allow('').messages({
            'string.max': 'Content cannot exceed 1000 characters'
        }),
        media: Joi.array().items(Joi.string()).max(6).optional().messages({
            'array.max': 'Maximum 6 media items allowed'
        }),
        mediaType: Joi.string().valid('image', 'video').optional().messages({
            'any.only': 'Media type must be either image or video'
        })
    }),

    reply: Joi.object({
        content: Joi.string().min(1).max(500).required().messages({
            'string.min': 'Reply content cannot be empty',
            'string.max': 'Reply content cannot exceed 500 characters',
            'any.required': 'Reply content is required'
        })
    })
};

// Validation middleware functions
const validateCreateReview = (req, res, next) => {
    const { error } = reviewValidators.createReview.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    next();
};

const validateUpdateReview = (req, res, next) => {
    const { error } = reviewValidators.updateReview.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    next();
};

const validateReply = (req, res, next) => {
    const { error } = reviewValidators.reply.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    next();
};

module.exports = {
    reviewValidators,
    validateCreateReview,
    validateUpdateReview,
    validateReply
};