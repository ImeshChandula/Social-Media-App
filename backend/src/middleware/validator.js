const Joi = require('joi');

// Validate user registration
const validateUser = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().required().trim(),
    lastName: Joi.string().required().trim(),
    role: Joi.string().valid('user', 'admin', 'super_admin')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};



module.exports = {validateUser};