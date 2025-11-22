const AppointmentService = require('../../Services/AppointmentService');
const AppointmentRepository = require('../../Repositories/AppointmentRepository');
const {
  createAppointmentSchema,
  updateAppointmentSchema,
  appointmentIdParamSchema,
  availabilityQuerySchema,
  queryAppointmentsSchema
} = require('../Validators/appointment.validators');

class AppointmentController {
  constructor() {
    const appointmentRepository = new AppointmentRepository();
    this.appointmentService = new AppointmentService(appointmentRepository);
  }

  async createAppointment(req, res) {
    try {
      const { error, value } = createAppointmentSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const appointment = await this.appointmentService.createAppointment(value, req.user.id);

      return res.status(201).json({
        success: true,
        message: 'Appointment created successfully',
        data: { appointment }
      });
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 400 || err.statusCode === 409) {
        return res.status(err.statusCode).json({
          success: false,
          message: err.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }

  async getAppointments(req, res) {
    try {
      const { error, value } = queryAppointmentsSchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const result = await this.appointmentService.getAppointments(value);

      return res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }

  async getAppointment(req, res) {
    try {
      const { error: paramError } = appointmentIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid appointment ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      const appointment = await this.appointmentService.getAppointmentById(req.params.id);

      return res.status(200).json({
        success: true,
        data: { appointment }
      });
    } catch (err) {
      if (err.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: err.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }

  async updateAppointment(req, res) {
    try {
      const { error: paramError } = appointmentIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid appointment ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      const { error, value } = updateAppointmentSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const appointment = await this.appointmentService.updateAppointment(
        req.params.id,
        value,
        req.user.id
      );

      return res.status(200).json({
        success: true,
        message: 'Appointment updated successfully',
        data: { appointment }
      });
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 400 || err.statusCode === 409) {
        return res.status(err.statusCode).json({
          success: false,
          message: err.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }

  async deleteAppointment(req, res) {
    try {
      const { error: paramError } = appointmentIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid appointment ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      await this.appointmentService.deleteAppointment(req.params.id, req.user.id, req.user.role);

      return res.status(204).send();
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 403) {
        return res.status(err.statusCode).json({
          success: false,
          message: err.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }

  async getAvailability(req, res) {
    try {
      const { error, value } = availabilityQuerySchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const availability = await this.appointmentService.getAvailability(value.doctorId, value.date);

      return res.status(200).json({
        success: true,
        data: availability
      });
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 400) {
        return res.status(err.statusCode).json({
          success: false,
          message: err.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
}

module.exports = AppointmentController;
