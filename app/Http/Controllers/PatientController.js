const PatientService = require('../../Services/PatientService');
const PatientRepository = require('../../Repositories/PatientRepository');
const {
  createPatientSchema,
  updatePatientSchema,
  patientIdParamSchema,
  queryPatientsSchema
} = require('../Validators/patient.validators');

class PatientController {
  constructor() {
    const patientRepository = new PatientRepository();
    this.patientService = new PatientService(patientRepository);
  }

  async createPatient(req, res) {
    try {
      const { error, value } = createPatientSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const patient = await this.patientService.createPatient(value, req.user.id);

      return res.status(201).json({
        success: true,
        message: 'Patient created successfully',
        data: { patient }
      });
    } catch (err) {
      if (err.statusCode === 409) {
        return res.status(409).json({
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

  async getPatients(req, res) {
    try {
      const { error, value } = queryPatientsSchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const result = await this.patientService.getPatients(value);

      return res.status(200).json({
        success: true,
        data: result.items,
        meta: result.pagination
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }

  async getPatient(req, res) {
    try {
      const { error: paramError } = patientIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid patient ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      const patient = await this.patientService.getPatientById(req.params.id);

      return res.status(200).json({
        success: true,
        data: { patient }
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

  async updatePatient(req, res) {
    try {
      const { error: paramError } = patientIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid patient ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      const { error, value } = updatePatientSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const patient = await this.patientService.updatePatient(req.params.id, value, req.user.id);

      return res.status(200).json({
        success: true,
        message: 'Patient updated successfully',
        data: { patient }
      });
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 409 || err.statusCode === 400) {
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

  async deletePatient(req, res) {
    try {
      const { error: paramError } = patientIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid patient ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      await this.patientService.deletePatient(req.params.id, req.user.id);

      return res.status(204).send();
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

module.exports = PatientController;
