const { expect } = require('chai');
const sinon = require('sinon');
const MedicalDocumentService = require('../../app/Services/MedicalDocumentService');
const { mockMedicalDocument, mockPatient, mockUser } = require('../utils/mock-data');
const MockMinIO = require('../utils/test-minio');

describe('MedicalDocumentService', () => {
  let documentService;
  let documentRepository;
  let patientRepository;
  let mockMinio;

  beforeEach(() => {
    documentRepository = {
      create: sinon.stub(),
      findById: sinon.stub(),
      findAll: sinon.stub(),
      delete: sinon.stub()
    };

    patientRepository = {
      findById: sinon.stub()
    };

    documentService = new MedicalDocumentService(documentRepository);
    documentService.patientRepository = patientRepository;

    mockMinio = new MockMinIO();
    const storage = require('../../config/storage');
    storage.minioClient = mockMinio;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('uploadDocument', () => {
    it('should upload document successfully', async () => {
      patientRepository.findById.resolves(mockPatient);
      documentRepository.create.resolves({
        ...mockMedicalDocument,
        toObject: () => mockMedicalDocument
      });

      const fileBuffer = Buffer.from('test file content');
      const payload = {
        patientId: mockPatient._id.toString(),
        fileName: 'test-document.pdf',
        fileType: 'application/pdf',
        fileSize: fileBuffer.length,
        category: 'report',
        tags: ['test']
      };

      const result = await documentService.uploadDocument(
        payload,
        fileBuffer,
        mockUser._id.toString()
      );

      expect(result).to.have.property('fileName', payload.fileName);
      expect(mockMinio.putObjectStub).to.have.been.calledOnce;
      expect(documentRepository.create).to.have.been.calledOnce;
    });

    it('should throw error if file size exceeds limit', async () => {
      const largeBuffer = Buffer.alloc(21 * 1024 * 1024);
      const payload = {
        patientId: mockPatient._id.toString(),
        fileName: 'large-file.pdf',
        fileType: 'application/pdf',
        fileSize: largeBuffer.length,
        category: 'report'
      };

      try {
        await documentService.uploadDocument(
          payload,
          largeBuffer,
          mockUser._id.toString()
        );
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.include('File size exceeds');
        expect(error.statusCode).to.equal(400);
      }
    });

    it('should throw error if invalid MIME type', async () => {
      const payload = {
        patientId: mockPatient._id.toString(),
        fileName: 'test.txt',
        fileType: 'text/plain',
        fileSize: 1024,
        category: 'report'
      };

      try {
        await documentService.uploadDocument(
          payload,
          Buffer.from('test'),
          mockUser._id.toString()
        );
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.include('Invalid file type');
        expect(error.statusCode).to.equal(400);
      }
    });
  });

  describe('getPresignedUrl', () => {
    it('should generate presigned URL successfully', async () => {
      documentRepository.findById.resolves({
        ...mockMedicalDocument,
        fileUrl: 'test-document.pdf',
        toObject: () => mockMedicalDocument
      });

      const url = await documentService.getPresignedUrl(mockMedicalDocument._id.toString());

      expect(url).to.be.a('string');
      expect(mockMinio.presignedGetObjectStub).to.have.been.calledOnce;
    });
  });

  describe('deleteDocument', () => {
    it('should soft delete document successfully', async () => {
      documentRepository.findById.resolves({
        ...mockMedicalDocument,
        uploaderId: mockUser._id,
        toObject: () => mockMedicalDocument
      });
      documentRepository.delete.resolves(true);

      await documentService.deleteDocument(
        mockMedicalDocument._id.toString(),
        mockUser._id.toString()
      );

      expect(documentRepository.delete).to.have.been.calledOnce;
    });
  });
});

