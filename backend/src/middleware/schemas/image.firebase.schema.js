const Joi = require('joi');

// Common image validation schema for single or multiple images
const imageSchema = Joi.alternatives().try(
    Joi.string().uri(),
    Joi.string().pattern(/^data:.*;base64,.*/),
    Joi.object({
        buffer: Joi.binary().required(),
        mimetype: Joi.string().valid(
            'image/jpeg', 
            'image/jpg', 
            'image/png', 
            'image/gif', 
            'image/webp'
        ).required(),
        originalname: Joi.string().required(),
        size: Joi.number().max(5 * 1024 * 1024).optional()
    }),
    Joi.array().items(
        Joi.alternatives().try(
            Joi.string().uri(),
            Joi.string().pattern(/^data:.*;base64,.*/),
            Joi.object({
                buffer: Joi.binary().required(),
                mimetype: Joi.string().valid(
                    'image/jpeg', 
                    'image/jpg', 
                    'image/png', 
                    'image/gif', 
                    'image/webp'
                ).required(),
                originalname: Joi.string().required(),
                size: Joi.number().max(5 * 1024 * 1024).optional()
            })
        )
    ).max(10)
);

const defaultNullImageSchema = imageSchema.default(null);
const defaultArrayImageSchema = imageSchema.default([]);
const requiredImageSchema = imageSchema.required();
const optionalImageSchema = imageSchema.optional();

// Simple image schema for updates (only URI or null)
const updateImageSchema = Joi.string().uri().allow(null).optional();

module.exports = {
    imageSchema,
    defaultNullImageSchema,
    defaultArrayImageSchema,
    requiredImageSchema,
    optionalImageSchema,
    updateImageSchema
};