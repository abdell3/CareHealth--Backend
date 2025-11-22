const Joi = require('joi');

const createPrescriptionSchema = Joi.object({
  patientId: Joi.string().hex().length(24).required(),
  doctorId: Joi.string().hex().length(24).required(),
  appointmentId: Joi.string().hex().length(24).optional().allow('', null),
  medications: Joi.array().items(
    Joi.object({
      name: Joi.string().required().trim().min(1),
      dosage: Joi.string().required().trim().min(1),
      frequency: Joi.string().required().trim().min(1),
      duration: Joi.string().required().trim().min(1),
      notes: Joi.string().trim().optional().allow('')
    })
  ).min(1).required(),
  notes: Joi.string().trim().optional().allow('')
});

const updatePrescriptionSchema = Joi.object({
  patientId: Joi.string().hex().length(24).optional(),
  doctorId: Joi.string().hex().length(24).optional(),
  appointmentId: Joi.string().hex().length(24).optional().allow('', null),
  medications: Joi.array().items(
    Joi.object({
      name: Joi.string().trim().min(1),
      dosage: Joi.string().trim().min(1),
      frequency: Joi.string().trim().min(1),
      duration: Joi.string().trim().min(1),
      notes: Joi.string().trim().optional().allow('')
    })
  ).min(1).optional(),
  notes: Joi.string().trim().optional().allow('')
}).min(1);

const queryPrescriptionsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().optional().allow(''),
  patientId: Joi.string().hex().length(24).optional(),
  doctorId: Joi.string().hex().length(24).optional(),
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional()
});

const prescriptionIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
});

const assignPharmacySchema = Joi.object({
  pharmacyId: Joi.string().hex().length(24).required()
});

const updateDispensationStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'ready', 'unavailable', 'dispensed').required(),
  notes: Joi.string().trim().optional().allow('')
});

module.exports = {
  createPrescriptionSchema,
  updatePrescriptionSchema,
  queryPrescriptionsSchema,
  prescriptionIdParamSchema,
  assignPharmacySchema,
  updateDispensationStatusSchema
};

