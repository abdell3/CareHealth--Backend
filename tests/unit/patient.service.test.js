const { expect } = require('chai');
const sinon = require('sinon');
const PatientService = require('../../app/Services/PatientService');
const { mockPatient, mockUser } = require('../utils/mock-data');
const { connectDB, closeDB, clearDB } = require('../utils/test-db');

describe('PatientService', () => {
  before(async () => {
    await connectDB();
  });

  after(async () => {
    await clearDB();
    await closeDB();
  });
  let patientService;
  let patientRepository;

  beforeEach(() => {
    patientRepository = {
      create: sinon.stub(),
      findById: sinon.stub(),
      findAll: sinon.stub(),
      update: sinon.stub(),
      delete: sinon.stub(),
      findByEmail: sinon.stub()
    };

    patientService = new PatientService(patientRepository);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('createPatient', () => {
    it('should create a patient successfully', async () => {
      patientRepository.findByEmail.resolves(null);
      patientRepository.create.resolves({
        ...mockPatient,
        toObject: () => mockPatient
      });

      const patientData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@test.com',
        phone: '1234567890',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'female'
      };

      const result = await patientService.createPatient(patientData, mockUser._id);

      expect(result).to.have.property('firstName', patientData.firstName);
      expect(result).to.have.property('email', patientData.email);
      expect(patientRepository.create).to.have.been.calledOnce;
    });

    it('should throw error if email already exists', async () => {
      patientRepository.findByEmail.resolves(mockPatient);

      const patientData = {
        email: 'existing@test.com'
      };

      try {
        await patientService.createPatient(patientData, mockUser._id);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.equal('Patient with this email already exists');
        expect(error.statusCode).to.equal(409);
      }
    });
  });

  describe('getPatients', () => {
    it('should return paginated patients', async () => {
      const mockPatients = [mockPatient];
      patientRepository.findAll.resolves({
        docs: mockPatients,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });

      const result = await patientService.getPatients({ page: 1, limit: 10 });

      expect(result).to.have.property('items');
      expect(result).to.have.property('pagination');
      expect(result.items).to.be.an('array');
      expect(result.pagination.total).to.equal(1);
    });
  });

  describe('getPatientById', () => {
    it('should return a patient by id', async () => {
      patientRepository.findById.resolves({
        ...mockPatient,
        toObject: () => mockPatient
      });

      const result = await patientService.getPatientById(mockPatient._id.toString());

      expect(result).to.have.property('_id');
      expect(patientRepository.findById).to.have.been.calledWith(mockPatient._id.toString());
    });

    it('should throw error if patient not found', async () => {
      patientRepository.findById.resolves(null);

      try {
        await patientService.getPatientById(mockPatient._id.toString());
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.equal('Patient not found');
        expect(error.statusCode).to.equal(404);
      }
    });
  });

  describe('updatePatient', () => {
    it('should update a patient successfully', async () => {
      patientRepository.findById.resolves({
        ...mockPatient,
        toObject: () => mockPatient
      });
      patientRepository.findByEmail.resolves(null);
      patientRepository.update.resolves({
        ...mockPatient,
        firstName: 'Updated',
        toObject: () => ({ ...mockPatient, firstName: 'Updated' })
      });

      const updateData = { firstName: 'Updated' };
      const result = await patientService.updatePatient(
        mockPatient._id.toString(),
        updateData,
        mockUser._id
      );

      expect(result).to.have.property('firstName', 'Updated');
      expect(patientRepository.update).to.have.been.calledOnce;
    });
  });

  describe('deletePatient', () => {
    it('should soft delete a patient successfully', async () => {
      patientRepository.findById.resolves({
        ...mockPatient,
        toObject: () => mockPatient
      });
      patientRepository.delete.resolves(true);

      await patientService.deletePatient(mockPatient._id.toString(), mockUser._id);

      expect(patientRepository.delete).to.have.been.calledOnce;
    });
  });
});

