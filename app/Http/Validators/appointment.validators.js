const Joi = require('joi');

const createAppointmentSchema = Joi.object({
  patientId: Joi.string().hex().length(24).required(),
  doctorId: Joi.string().hex().length(24).required(),
  startAt: Joi.date().iso().required(),
  endAt: Joi.date().iso().required(),
  reason: Joi.string().trim().optional().allow(''),
  location: Joi.string().trim().optional().allow('')
});

const updateAppointmentSchema = Joi.object({
  startAt: Joi.date().iso().optional(),
  endAt: Joi.date().iso().optional(),
  reason: Joi.string().trim().optional().allow(''),
  location: Joi.string().trim().optional().allow(''),
  status: Joi.string().valid('scheduled', 'completed', 'cancelled').lowercase().optional()
}).min(1);

const appointmentIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
});

const availabilityQuerySchema = Joi.object({
  doctorId: Joi.string().hex().length(24).required(),
  date: Joi.date().iso().required()
});

const queryAppointmentsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().optional().allow(''),
  doctorId: Joi.string().hex().length(24).optional(),
  patientId: Joi.string().hex().length(24).optional(),
  status: Joi.string().valid('scheduled', 'completed', 'cancelled').lowercase().optional(),
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional()
});

module.exports = {
  createAppointmentSchema,
  updateAppointmentSchema,
  appointmentIdParamSchema,
  availabilityQuerySchema,
  queryAppointmentsSchema
};

