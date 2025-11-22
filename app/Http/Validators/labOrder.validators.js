const Joi = require('joi');

const createLabOrderSchema = Joi.object({
  patientId: Joi.string().hex().length(24).required(),
  doctorId: Joi.string().hex().length(24).required(),
  consultationId: Joi.string().hex().length(24).optional().allow('', null),
  tests: Joi.array().items(Joi.string().trim().min(1)).min(1).required(),
  status: Joi.string().valid('ordered', 'received', 'validated').default('ordered').optional()
});

const updateLabOrderSchema = Joi.object({
  consultationId: Joi.string().hex().length(24).optional().allow('', null),
  tests: Joi.array().items(Joi.string().trim().min(1)).min(1).optional(),
  status: Joi.string().valid('ordered', 'received', 'validated').optional()
}).min(1);

const updateLabOrderStatusSchema = Joi.object({
  status: Joi.string().valid('ordered', 'received', 'validated').required()
});

const queryLabOrdersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().optional().allow(''),
  patientId: Joi.string().hex().length(24).optional(),
  doctorId: Joi.string().hex().length(24).optional(),
  consultationId: Joi.string().hex().length(24).optional(),
  status: Joi.string().valid('ordered', 'received', 'validated').optional()
});

const labOrderIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
});

module.exports = {
  createLabOrderSchema,
  updateLabOrderSchema,
  updateLabOrderStatusSchema,
  queryLabOrdersSchema,
  labOrderIdParamSchema
};

