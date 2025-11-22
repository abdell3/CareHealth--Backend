const PharmacyService = require('../../Services/PharmacyService');
const PharmacyRepository = require('../../Repositories/PharmacyRepository');
const {
  createPharmacySchema,
  updatePharmacySchema,
  listPharmaciesQuerySchema,
  pharmacyIdParamSchema,
  assignPrescriptionSchema
} = require('../Validators/pharmacy.validators');

class PharmacyController {
  constructor() {
    const pharmacyRepository = new PharmacyRepository();
    this.pharmacyService = new PharmacyService(pharmacyRepository);
  }

  async createPharmacy(req, res) {
    try {
      const { error, value } = createPharmacySchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const pharmacy = await this.pharmacyService.createPharmacy(value, req.user.id);

      return res.status(201).json({
        success: true,
        message: 'Pharmacy created successfully',
        data: { pharmacy }
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

  async getPharmacies(req, res) {
    try {
      const { error, value } = listPharmaciesQuerySchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const result = await this.pharmacyService.getPharmacies(value);

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

  async getPharmacy(req, res) {
    try {
      const { error: paramError } = pharmacyIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pharmacy ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      const pharmacy = await this.pharmacyService.getPharmacyById(req.params.id);

      return res.status(200).json({
        success: true,
        data: { pharmacy }
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

  async updatePharmacy(req, res) {
    try {
      const { error: paramError } = pharmacyIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pharmacy ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      const { error, value } = updatePharmacySchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const pharmacy = await this.pharmacyService.updatePharmacy(req.params.id, value, req.user.id);

      return res.status(200).json({
        success: true,
        message: 'Pharmacy updated successfully',
        data: { pharmacy }
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

  async deletePharmacy(req, res) {
    try {
      const { error: paramError } = pharmacyIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pharmacy ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      await this.pharmacyService.deletePharmacy(req.params.id, req.user.id);

      return res.status(204).send();
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

  async assignPrescription(req, res) {
    try {
      const { error: paramError } = pharmacyIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pharmacy ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      const { error, value } = assignPrescriptionSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const prescription = await this.pharmacyService.assignPrescriptionToPharmacy(
        value.prescriptionId,
        req.params.id
      );

      return res.status(200).json({
        success: true,
        message: 'Prescription assigned to pharmacy successfully',
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

  async getStatistics(req, res) {
    try {
      const { error: paramError } = pharmacyIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pharmacy ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      const statistics = await this.pharmacyService.getPharmacyStatistics(req.params.id);

      return res.status(200).json({
        success: true,
        data: statistics
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
}

module.exports = PharmacyController;
