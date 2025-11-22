const PrescriptionService = require('../../Services/PrescriptionService');
const PrescriptionRepository = require('../../Repositories/PrescriptionRepository');
const LoggerService = require('../../Services/LoggerService');
const {
  createPrescriptionSchema,
  updatePrescriptionSchema,
  prescriptionIdParamSchema,
  queryPrescriptionsSchema,
  assignPharmacySchema,
  updateDispensationStatusSchema
} = require('../Validators/prescription.validators');

class PrescriptionController {
  constructor() {
    const prescriptionRepository = new PrescriptionRepository();
    this.prescriptionService = new PrescriptionService(prescriptionRepository);
    this.loggerService = new LoggerService();
  }

  async createPrescription(req, res) {
    try {
      const { error, value } = createPrescriptionSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const prescription = await this.prescriptionService.createPrescription(value, req.user.id);

      this.loggerService.logAudit('CREATE_PRESCRIPTION', req.user.id, 'Prescription', {
        prescriptionId: prescription._id,
        patientId: prescription.patientId,
        doctorId: prescription.doctorId
      });

      return res.status(201).json({
        success: true,
        message: 'Prescription created successfully',
        data: { prescription }
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

  async getPrescriptions(req, res) {
    try {
      const { error, value } = queryPrescriptionsSchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const result = await this.prescriptionService.getPrescriptions(value);

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

  async getPrescription(req, res) {
    try {
      const { error: paramError } = prescriptionIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid prescription ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      const prescription = await this.prescriptionService.getPrescriptionById(req.params.id);

      return res.status(200).json({
        success: true,
        data: { prescription }
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

  async updatePrescription(req, res) {
    try {
      const { error: paramError } = prescriptionIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid prescription ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      const { error, value } = updatePrescriptionSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const prescription = await this.prescriptionService.updatePrescription(
        req.params.id,
        value,
        req.user.id
      );

      return res.status(200).json({
        success: true,
        message: 'Prescription updated successfully',
        data: { prescription }
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

  async deletePrescription(req, res) {
    try {
      const { error: paramError } = prescriptionIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid prescription ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      await this.prescriptionService.deletePrescription(req.params.id, req.user.id, req.user.role);

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

  async assignPharmacy(req, res) {
    try {
      const { error: paramError } = prescriptionIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid prescription ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      const { error, value } = assignPharmacySchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const prescription = await this.prescriptionService.assignPharmacy(req.params.id, value.pharmacyId);

      this.loggerService.logAudit('ASSIGN_PHARMACY_TO_PRESCRIPTION', req.user.id, 'Prescription', {
        prescriptionId: prescription._id,
        pharmacyId: value.pharmacyId
      });

      return res.status(200).json({
        success: true,
        message: 'Pharmacy assigned to prescription successfully',
        data: { prescription }
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

  async markReady(req, res) {
    try {
      const { error: paramError } = prescriptionIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid prescription ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      const { error, value } = updateDispensationStatusSchema.validate({
        status: 'ready',
        notes: req.body.notes
      });
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const prescription = await this.prescriptionService.markPrescriptionReady(
        req.params.id,
        value.notes
      );

      return res.status(200).json({
        success: true,
        message: 'Prescription marked as ready',
        data: { prescription }
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

  async markUnavailable(req, res) {
    try {
      const { error: paramError } = prescriptionIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid prescription ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      const { error, value } = updateDispensationStatusSchema.validate({
        status: 'unavailable',
        notes: req.body.notes
      });
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const prescription = await this.prescriptionService.markPrescriptionUnavailable(
        req.params.id,
        value.notes
      );

      return res.status(200).json({
        success: true,
        message: 'Prescription marked as unavailable',
        data: { prescription }
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

  async markDispensed(req, res) {
    try {
      const { error: paramError } = prescriptionIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid prescription ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      const { error, value } = updateDispensationStatusSchema.validate({
        status: 'dispensed',
        notes: req.body.notes
      });
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const prescription = await this.prescriptionService.markPrescriptionDispensed(
        req.params.id,
        req.user.id,
        value.notes
      );

      this.loggerService.logAudit('DISPENSE_PRESCRIPTION', req.user.id, 'Prescription', {
        prescriptionId: prescription._id,
        pharmacyId: prescription.pharmacyId
      });

      return res.status(200).json({
        success: true,
        message: 'Prescription marked as dispensed',
        data: { prescription }
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

module.exports = PrescriptionController;
