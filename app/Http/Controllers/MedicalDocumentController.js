const MedicalDocumentService = require('../../Services/MedicalDocumentService');
const MedicalDocumentRepository = require('../../Repositories/MedicalDocumentRepository');
const multer = require('multer');
const {
  uploadDocumentSchema,
  queryDocumentsSchema,
  documentIdParamSchema
} = require('../Validators/document.validators');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024
  }
});

class MedicalDocumentController {
  constructor() {
    const medicalDocumentRepository = new MedicalDocumentRepository();
    this.medicalDocumentService = new MedicalDocumentService(medicalDocumentRepository);
  }

  uploadMiddleware() {
    return upload.single('file');
  }

  async uploadDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'File is required'
        });
      }

      const fileType = this.getFileTypeFromMime(req.file.mimetype);
      if (!fileType) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Only PDF, JPEG, and PNG are allowed'
        });
      }

      const payload = {
        patientId: req.body.patientId,
        consultationId: req.body.consultationId || undefined,
        labOrderId: req.body.labOrderId || undefined,
        fileName: req.file.originalname || req.file.fieldname,
        fileType: fileType,
        fileSize: req.file.size,
        category: req.body.category,
        tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : JSON.parse(req.body.tags)) : [],
        metadata: req.body.metadata ? (typeof req.body.metadata === 'string' ? JSON.parse(req.body.metadata) : req.body.metadata) : undefined
      };

      const { error, value } = uploadDocumentSchema.validate(payload);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const document = await this.medicalDocumentService.uploadDocument(
        value,
        req.file.buffer,
        req.user.id
      );

      return res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: { document }
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

  async getDocuments(req, res) {
    try {
      const { error, value } = queryDocumentsSchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const result = await this.medicalDocumentService.getDocuments(value);

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

  async getDocument(req, res) {
    try {
      const { error: paramError } = documentIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid document ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      const document = await this.medicalDocumentService.getDocumentById(req.params.id);

      return res.status(200).json({
        success: true,
        data: { document }
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

  async deleteDocument(req, res) {
    try {
      const { error: paramError } = documentIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid document ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      await this.medicalDocumentService.deleteDocument(req.params.id, req.user.id);

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

  getFileTypeFromMime(mimetype) {
    const mimeMap = {
      'application/pdf': 'PDF',
      'image/jpeg': 'JPEG',
      'image/jpg': 'JPEG',
      'image/png': 'PNG'
    };
    return mimeMap[mimetype];
  }
}

module.exports = MedicalDocumentController;

