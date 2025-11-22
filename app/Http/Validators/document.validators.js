const Joi = require('joi');

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const uploadDocumentSchema = Joi.object({
  patientId: Joi.string().hex().length(24).required(),
  consultationId: Joi.string().hex().length(24).optional().allow('', null),
  labOrderId: Joi.string().hex().length(24).optional().allow('', null),
  fileName: Joi.string().required().trim().min(1),
  fileType: Joi.string().valid('PDF', 'JPEG', 'PNG').required(),
  fileSize: Joi.number().min(0).max(MAX_FILE_SIZE).required(),
  category: Joi.string().valid('imaging', 'report').required(),
  tags: Joi.array().items(Joi.string().trim()).optional().default([]),
  fileUrl: Joi.string().uri().required().trim(),
  metadata: Joi.object().optional()
}).custom((value, helpers) => {
  const allowedMimeTypes = {
    'PDF': ['application/pdf'],
    'JPEG': ['image/jpeg', 'image/jpg'],
    'PNG': ['image/png']
  };

  if (value.fileType && !allowedMimeTypes[value.fileType]) {
    return helpers.error('any.invalid');
  }

  return value;
}, 'File type validation');

const queryDocumentsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().optional().allow(''),
  patientId: Joi.string().hex().length(24).optional(),
  consultationId: Joi.string().hex().length(24).optional(),
  labOrderId: Joi.string().hex().length(24).optional(),
  category: Joi.string().valid('imaging', 'report').optional(),
  fileType: Joi.string().valid('PDF', 'JPEG', 'PNG').optional(),
  tags: Joi.string().trim().optional(),
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional()
});

const documentIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
});

module.exports = {
  uploadDocumentSchema,
  queryDocumentsSchema,
  documentIdParamSchema,
  MAX_FILE_SIZE
};

