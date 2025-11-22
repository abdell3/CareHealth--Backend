const Joi = require('joi');

const createPatientSchema = Joi.object({
  firstName: Joi.string().required().trim().min(2).max(50),
  lastName: Joi.string().required().trim().min(2).max(50),
  dateOfBirth: Joi.date().required().max('now'),
  gender: Joi.string().valid('male', 'female', 'other').required().lowercase(),
  phone: Joi.string().required().trim(),
  email: Joi.string().email().lowercase().trim().optional().allow('', null),
  address: Joi.string().trim().optional().allow(''),
  city: Joi.string().trim().optional().allow(''),
  insuranceProvider: Joi.string().trim().optional().allow(''),
  insuranceNumber: Joi.string().trim().optional().allow(''),
  emergencyContactName: Joi.string().trim().optional().allow(''),
  emergencyContactPhone: Joi.string().trim().optional().allow(''),
  allergies: Joi.array().items(Joi.string().trim()).optional(),
  medicalHistory: Joi.array().items(Joi.string().trim()).optional(),
  notes: Joi.string().trim().optional().allow('')
});

const updatePatientSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).optional(),
  lastName: Joi.string().trim().min(2).max(50).optional(),
  dateOfBirth: Joi.date().max('now').optional(),
  gender: Joi.string().valid('male', 'female', 'other').lowercase().optional(),
  phone: Joi.string().trim().optional(),
  email: Joi.string().email().lowercase().trim().optional().allow('', null),
  address: Joi.string().trim().optional().allow(''),
  city: Joi.string().trim().optional().allow(''),
  insuranceProvider: Joi.string().trim().optional().allow(''),
  insuranceNumber: Joi.string().trim().optional().allow(''),
  emergencyContactName: Joi.string().trim().optional().allow(''),
  emergencyContactPhone: Joi.string().trim().optional().allow(''),
  allergies: Joi.array().items(Joi.string().trim()).optional(),
  medicalHistory: Joi.array().items(Joi.string().trim()).optional(),
  notes: Joi.string().trim().optional().allow('')
}).min(1);

const patientIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
});

const queryPatientsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().optional().allow(''),
  gender: Joi.string().valid('male', 'female', 'other').lowercase().optional(),
  city: Joi.string().trim().optional(),
  isDeleted: Joi.boolean().optional()
});

module.exports = {
  createPatientSchema,
  updatePatientSchema,
  patientIdParamSchema,
  queryPatientsSchema
};
