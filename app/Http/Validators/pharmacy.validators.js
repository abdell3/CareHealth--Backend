const Joi = require('joi');

const createPharmacySchema = Joi.object({
  name: Joi.string().required().trim().min(1),
  address: Joi.string().required().trim().min(1),
  phone: Joi.string().trim().optional().allow(''),
  email: Joi.string().email().trim().lowercase().optional().allow(''),
  openingHours: Joi.object().optional(),
  status: Joi.string().valid('active', 'inactive').default('active').optional()
});

const updatePharmacySchema = Joi.object({
  name: Joi.string().trim().min(1).optional(),
  address: Joi.string().trim().min(1).optional(),
  phone: Joi.string().trim().optional().allow(''),
  email: Joi.string().email().trim().lowercase().optional().allow(''),
  openingHours: Joi.object().optional(),
  status: Joi.string().valid('active', 'inactive').optional()
}).min(1);

const listPharmaciesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().optional().allow(''),
  status: Joi.string().valid('active', 'inactive').optional()
});

const pharmacyIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
});

const assignPrescriptionSchema = Joi.object({
  prescriptionId: Joi.string().hex().length(24).required()
});

module.exports = {
  createPharmacySchema,
  updatePharmacySchema,
  listPharmaciesQuerySchema,
  pharmacyIdParamSchema,
  assignPrescriptionSchema
};

