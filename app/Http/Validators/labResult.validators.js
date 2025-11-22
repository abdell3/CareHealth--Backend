const Joi = require('joi');

const uploadLabResultSchema = Joi.object({
  labOrderId: Joi.string().hex().length(24).required(),
  fileUrl: Joi.string().uri().required().trim(),
  notes: Joi.string().trim().optional().allow('')
});

const updateLabResultSchema = Joi.object({
  fileUrl: Joi.string().uri().optional().trim(),
  notes: Joi.string().trim().optional().allow('')
}).min(1);

const queryLabResultsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().optional().allow(''),
  labOrderId: Joi.string().hex().length(24).optional(),
  patientId: Joi.string().hex().length(24).optional(),
  consultationId: Joi.string().hex().length(24).optional()
});

const labResultIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
});

module.exports = {
  uploadLabResultSchema,
  updateLabResultSchema,
  queryLabResultsSchema,
  labResultIdParamSchema
};

