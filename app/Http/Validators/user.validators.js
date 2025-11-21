const Joi = require('joi');

const createUserSchema = Joi.object({
  firstName: Joi.string().required().trim().min(2).max(50),
  lastName: Joi.string().required().trim().min(2).max(50),
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().required().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .message('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  phone: Joi.string().trim().optional().allow('').pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
    .message('Phone must be a valid international phone number'),
  role: Joi.string().hex().length(24).required()
});

const updateUserSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).optional(),
  lastName: Joi.string().trim().min(2).max(50).optional(),
  email: Joi.string().email().lowercase().trim().optional(),
  phone: Joi.string().trim().optional().allow('').pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
    .message('Phone must be a valid international phone number'),
  isActive: Joi.boolean().optional()
}).min(1);

const queryUsersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().optional().allow(''),
  role: Joi.string().hex().length(24).optional()
});

const changeRoleSchema = Joi.object({
  role: Joi.string().hex().length(24).required()
});

const suspendUserSchema = Joi.object({});

const reactivateUserSchema = Joi.object({});

module.exports = {
  createUserSchema,
  updateUserSchema,
  queryUsersSchema,
  changeRoleSchema,
  suspendUserSchema,
  reactivateUserSchema
};

