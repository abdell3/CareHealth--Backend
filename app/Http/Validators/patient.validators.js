const Joi = require('joi');

const createPatientSchema = Joi.object({
  firstName: Joi.string().required().trim().min(2).max(50),
  lastName: Joi.string().required().trim().min(2).max(50),
  middleName: Joi.string().trim().max(50).optional().allow(''),
  email: Joi.string().email().required().lowercase().trim(),
  phone: Joi.string().required().trim().pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
    .message('Phone must be a valid international phone number'),
  gender: Joi.string().valid('male', 'female', 'other', 'unknown').required().lowercase(),
  dateOfBirth: Joi.date().required().max('now'),
  address: Joi.object({
    line1: Joi.string().trim().optional().allow(''),
    line2: Joi.string().trim().optional().allow(''),
    city: Joi.string().trim().optional().allow(''),
    state: Joi.string().trim().optional().allow(''),
    postalCode: Joi.string().trim().optional().allow(''),
    country: Joi.string().trim().optional().allow('')
  }).optional(),
  emergencyContact: Joi.object({
    name: Joi.string().trim().optional().allow(''),
    phone: Joi.string().trim().optional().allow(''),
    relation: Joi.string().trim().optional().allow('')
  }).optional(),
  medicalData: Joi.object({
    allergies: Joi.array().items(Joi.string().trim()).optional(),
    medications: Joi.array().items(Joi.string().trim()).optional(),
    chronicConditions: Joi.array().items(Joi.string().trim()).optional(),
    bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '').optional().allow(''),
    notes: Joi.string().trim().optional().allow('')
  }).optional()
});

const updatePatientSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).optional(),
  lastName: Joi.string().trim().min(2).max(50).optional(),
  middleName: Joi.string().trim().max(50).optional().allow(''),
  email: Joi.string().email().lowercase().trim().optional(),
  phone: Joi.string().trim().pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
    .message('Phone must be a valid international phone number').optional(),
  gender: Joi.string().valid('male', 'female', 'other', 'unknown').lowercase().optional(),
  dateOfBirth: Joi.date().max('now').optional(),
  address: Joi.object({
    line1: Joi.string().trim().optional().allow(''),
    line2: Joi.string().trim().optional().allow(''),
    city: Joi.string().trim().optional().allow(''),
    state: Joi.string().trim().optional().allow(''),
    postalCode: Joi.string().trim().optional().allow(''),
    country: Joi.string().trim().optional().allow('')
  }).optional(),
  emergencyContact: Joi.object({
    name: Joi.string().trim().optional().allow(''),
    phone: Joi.string().trim().optional().allow(''),
    relation: Joi.string().trim().optional().allow('')
  }).optional(),
  medicalData: Joi.object({
    allergies: Joi.array().items(Joi.string().trim()).optional(),
    medications: Joi.array().items(Joi.string().trim()).optional(),
    chronicConditions: Joi.array().items(Joi.string().trim()).optional(),
    bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '').optional().allow(''),
    notes: Joi.string().trim().optional().allow('')
  }).optional()
}).min(1);

const patientIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
});

const queryPatientsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().optional().allow('')
});

module.exports = {
  createPatientSchema,
  updatePatientSchema,
  patientIdParamSchema,
  queryPatientsSchema
};

