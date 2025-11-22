const LabResultService = require('../../Services/LabResultService');
const LabResultRepository = require('../../Repositories/LabResultRepository');
const LoggerService = require('../../Services/LoggerService');
const {
  uploadLabResultSchema,
  updateLabResultSchema,
  queryLabResultsSchema,
  labResultIdParamSchema
} = require('../Validators/labResult.validators');
const { labOrderIdParamSchema } = require('../Validators/labOrder.validators');

class LabResultController {
  constructor() {
    const labResultRepository = new LabResultRepository();
    this.labResultService = new LabResultService(labResultRepository);
    this.loggerService = new LoggerService();
  }

  async uploadResult(req, res) {
    try {
      const { error, value } = uploadLabResultSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const labResult = await this.labResultService.uploadResult(value, req.user.id);

      this.loggerService.logAudit('UPLOAD_LAB_RESULT', req.user.id, 'LabResult', {
        labResultId: labResult._id,
        labOrderId: labResult.labOrderId,
        fileUrl: labResult.fileUrl
      });

      return res.status(201).json({
        success: true,
        message: 'Lab result uploaded successfully',
        data: { labResult }
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

  async getResults(req, res) {
    try {
      const { error, value } = queryLabResultsSchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const result = await this.labResultService.getResults(value);

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

  async getResultsByOrder(req, res) {
    try {
      const { error: paramError } = labOrderIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid lab order ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      const results = await this.labResultService.getResultsByOrder(req.params.id);

      return res.status(200).json({
        success: true,
        data: { results }
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

  async getResult(req, res) {
    try {
      const { error: paramError } = labResultIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid lab result ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      const labResult = await this.labResultService.getResultById(req.params.id);

      return res.status(200).json({
        success: true,
        data: { labResult }
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

  async validateResult(req, res) {
    try {
      const { error: paramError } = labResultIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid lab result ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      const labResult = await this.labResultService.validateResult(req.params.id, req.user.id);

      this.loggerService.logAudit('VALIDATE_LAB_RESULT', req.user.id, 'LabResult', {
        labResultId: labResult._id,
        labOrderId: labResult.labOrderId
      });

      return res.status(200).json({
        success: true,
        message: 'Lab result validated successfully',
        data: { labResult }
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

  async updateResult(req, res) {
    try {
      const { error: paramError } = labResultIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid lab result ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      const { error, value } = updateLabResultSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const labResult = await this.labResultService.updateResult(
        req.params.id,
        value,
        req.user.id
      );

      return res.status(200).json({
        success: true,
        message: 'Lab result updated successfully',
        data: { labResult }
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

  async deleteResult(req, res) {
    try {
      const { error: paramError } = labResultIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid lab result ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      await this.labResultService.deleteResult(req.params.id, req.user.id);

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
}

module.exports = LabResultController;

