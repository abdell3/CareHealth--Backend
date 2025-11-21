const Joi = require('joi');

const registerSchema = Joi.object({
  firstName: Joi.string().required().trim().min(2).max(50),
  lastName: Joi.string().required().trim().min(2).max(50),
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().required().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .message('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  phone: Joi.string().trim().optional().allow(''),
  role: Joi.string().hex().length(24).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().required()
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required().trim()
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().required().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .message('New password must contain at least one uppercase letter, one lowercase letter, and one number')
});

const requestPasswordResetSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim()
});

const resetPasswordSchema = Joi.object({
  resetToken: Joi.string().required().trim(),
  newPassword: Joi.string().required().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .message('New password must contain at least one uppercase letter, one lowercase letter, and one number')
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  changePasswordSchema,
  requestPasswordResetSchema,
  resetPasswordSchema
};

