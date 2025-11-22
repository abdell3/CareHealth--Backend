const MedicalDocumentRepository = require('../Repositories/MedicalDocumentRepository');
const PatientRepository = require('../Repositories/PatientRepository');
const UserRepository = require('../Repositories/UserRepository');
const { minioClient, bucketName, PRESIGNED_URL_EXPIRY } = require('../../config/storage');
const crypto = require('crypto');
const path = require('path');

class MedicalDocumentService {
  constructor(medicalDocumentRepository) {
    this.medicalDocumentRepository = medicalDocumentRepository;
    this.patientRepository = new PatientRepository();
    this.userRepository = new UserRepository();
  }

  async validateFileTypeAndSize(fileType, fileSize) {
    const allowedTypes = ['PDF', 'JPEG', 'PNG'];
    if (!allowedTypes.includes(fileType)) {
      const error = new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed');
      error.statusCode = 400;
      throw error;
    }

    const MAX_FILE_SIZE = 20 * 1024 * 1024;
    if (fileSize > MAX_FILE_SIZE) {
      const error = new Error('File size exceeds maximum allowed size of 20 MB');
      error.statusCode = 400;
      throw error;
    }

    return true;
  }

  async uploadToStorage(fileName, fileBuffer, fileType) {
    if (!minioClient) {
      const error = new Error('Storage client not initialized');
      error.statusCode = 500;
      throw error;
    }

    const fileExtension = path.extname(fileName);
    const uniqueFileName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
    const objectName = `documents/${Date.now()}/${uniqueFileName}`;

    try {
      const exists = await minioClient.bucketExists(bucketName);
      if (!exists) {
        await minioClient.makeBucket(bucketName);
      }

      await minioClient.putObject(bucketName, objectName, fileBuffer, fileBuffer.length, {
        'Content-Type': this.getMimeType(fileType)
      });

      return objectName;
    } catch (error) {
      const uploadError = new Error(`Failed to upload file to storage: ${error.message}`);
      uploadError.statusCode = 500;
      throw uploadError;
    }
  }

  getMimeType(fileType) {
    const mimeTypes = {
      'PDF': 'application/pdf',
      'JPEG': 'image/jpeg',
      'PNG': 'image/png'
    };
    return mimeTypes[fileType] || 'application/octet-stream';
  }

  async generatePresignedUrl(objectName) {
    if (!minioClient) {
      const error = new Error('Storage client not initialized');
      error.statusCode = 500;
      throw error;
    }

    try {
      const url = await minioClient.presignedGetObject(bucketName, objectName, PRESIGNED_URL_EXPIRY);
      return url;
    } catch (error) {
      const urlError = new Error(`Failed to generate presigned URL: ${error.message}`);
      urlError.statusCode = 500;
      throw urlError;
    }
  }

  async uploadDocument(payload, fileBuffer, userId) {
    await this.validateFileTypeAndSize(payload.fileType, payload.fileSize);

    const patient = await this.patientRepository.findById(payload.patientId);
    if (!patient) {
      const error = new Error('Patient not found');
      error.statusCode = 404;
      throw error;
    }

    if (patient.isDeleted) {
      const error = new Error('Patient is deleted');
      error.statusCode = 400;
      throw error;
    }

    const uploader = await this.userRepository.findByIdWithPassword(userId);
    if (!uploader) {
      const error = new Error('Uploader not found');
      error.statusCode = 404;
      throw error;
    }

    const objectName = await this.uploadToStorage(payload.fileName, fileBuffer, payload.fileType);

    const documentData = {
      patientId: payload.patientId,
      consultationId: payload.consultationId || undefined,
      labOrderId: payload.labOrderId || undefined,
      uploaderId: userId,
      fileName: payload.fileName.trim(),
      fileType: payload.fileType,
      fileSize: payload.fileSize,
      category: payload.category,
      tags: payload.tags ? payload.tags.map(tag => tag.trim()) : [],
      fileUrl: objectName,
      uploadedAt: new Date(),
      metadata: payload.metadata || undefined,
      createdBy: userId,
      isDeleted: false
    };

    const document = await this.medicalDocumentRepository.create(documentData);

    try {
      document.presignedUrl = await this.generatePresignedUrl(objectName);
    } catch (error) {
      console.error('Failed to generate presigned URL:', error);
    }

    return document;
  }

  async getDocuments(query) {
    const {
      page = 1,
      limit = 10,
      search = '',
      patientId,
      consultationId,
      labOrderId,
      category,
      fileType,
      tags,
      from,
      to
    } = query;

    const result = await this.medicalDocumentRepository.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      search: search.trim(),
      patientId,
      consultationId,
      labOrderId,
      category,
      fileType,
      tags,
      from,
      to
    });

    const docsWithPresignedUrls = await Promise.all(
      result.docs.map(async (doc) => {
        try {
          const presignedUrl = await this.generatePresignedUrl(doc.fileUrl);
          return {
            ...doc.toObject(),
            presignedUrl
          };
        } catch (error) {
          console.error(`Failed to generate presigned URL for document ${doc._id}:`, error);
          return doc.toObject();
        }
      })
    );

    return {
      data: docsWithPresignedUrls,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      }
    };
  }

  async getDocumentById(id) {
    const document = await this.medicalDocumentRepository.findById(id);
    if (!document || document.isDeleted) {
      const error = new Error('Document not found');
      error.statusCode = 404;
      throw error;
    }

    try {
      const presignedUrl = await this.generatePresignedUrl(document.fileUrl);
      const docObject = document.toObject();
      docObject.presignedUrl = presignedUrl;
      return docObject;
    } catch (error) {
      console.error('Failed to generate presigned URL:', error);
      return document.toObject();
    }
  }

  async deleteDocument(id, userId) {
    const document = await this.medicalDocumentRepository.findById(id);
    if (!document || document.isDeleted) {
      const error = new Error('Document not found');
      error.statusCode = 404;
      throw error;
    }

    await this.medicalDocumentRepository.delete(id, userId);
    return true;
  }
}

module.exports = MedicalDocumentService;

