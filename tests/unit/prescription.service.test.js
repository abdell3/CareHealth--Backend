const { expect } = require('chai');
const sinon = require('sinon');
const PrescriptionService = require('../../app/Services/PrescriptionService');
const { mockPrescription, mockPatient, mockUser, mockAppointment } = require('../utils/mock-data');

describe('PrescriptionService', () => {
  let prescriptionService;
  let prescriptionRepository;
  let patientRepository;
  let userRepository;
  let appointmentRepository;

  beforeEach(() => {
    prescriptionRepository = {
      create: sinon.stub(),
      findById: sinon.stub(),
      findAll: sinon.stub(),
      update: sinon.stub(),
      delete: sinon.stub()
    };

    patientRepository = {
      findById: sinon.stub()
    };

    userRepository = {
      findById: sinon.stub()
    };

    appointmentRepository = {
      findById: sinon.stub()
    };

    prescriptionService = new PrescriptionService(prescriptionRepository);
    prescriptionService.patientRepository = patientRepository;
    prescriptionService.userRepository = userRepository;
    prescriptionService.appointmentRepository = appointmentRepository;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('createPrescription', () => {
    it('should create a prescription successfully', async () => {
      patientRepository.findById.resolves(mockPatient);
      userRepository.findById.resolves({ ...mockUser, role: { name: 'doctor' } });
      appointmentRepository.findById.resolves(mockAppointment);
      prescriptionRepository.create.resolves({
        ...mockPrescription,
        toObject: () => mockPrescription
      });

      const prescriptionData = {
        patientId: mockPatient._id.toString(),
        doctorId: mockUser._id.toString(),
        appointmentId: mockAppointment._id.toString(),
        medications: [
          {
            name: 'Paracetamol',
            dosage: '500mg',
            frequency: 'Every 6 hours',
            duration: '7 days'
          }
        ]
      };

      const result = await prescriptionService.createPrescription(prescriptionData, mockUser._id);

      expect(result).to.have.property('medications');
      expect(result.medications).to.be.an('array');
      expect(patientRepository.findById).to.have.been.calledOnce;
      expect(userRepository.findById).to.have.been.calledOnce;
    });

    it('should throw error if patient not found', async () => {
      patientRepository.findById.resolves(null);

      try {
        await prescriptionService.createPrescription(
          { patientId: mockPatient._id.toString() },
          mockUser._id
        );
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.equal('Patient not found');
        expect(error.statusCode).to.equal(404);
      }
    });
  });

  describe('assignPharmacy', () => {
    it('should assign pharmacy to prescription successfully', async () => {
      const pharmacyId = require('../utils/mock-data').mockPharmacy._id.toString();
      prescriptionRepository.findById.resolves({
        ...mockPrescription,
        toObject: () => mockPrescription
      });
      prescriptionRepository.update.resolves({
        ...mockPrescription,
        pharmacyId: pharmacyId,
        toObject: () => ({ ...mockPrescription, pharmacyId: pharmacyId })
      });

      const result = await prescriptionService.assignPharmacy(
        mockPrescription._id.toString(),
        pharmacyId
      );

      expect(result).to.have.property('pharmacyId', pharmacyId);
      expect(prescriptionRepository.update).to.have.been.calledOnce;
    });
  });

  describe('markPrescriptionDispensed', () => {
    it('should mark prescription as dispensed successfully', async () => {
      const pharmacyId = require('../utils/mock-data').mockPharmacy._id.toString();
      prescriptionRepository.findById.resolves({
        ...mockPrescription,
        pharmacyId: pharmacyId,
        toObject: () => ({ ...mockPrescription, pharmacyId: pharmacyId })
      });
      prescriptionRepository.update.resolves({
        ...mockPrescription,
        dispensation: { status: 'dispensed', dispensedAt: new Date() },
        toObject: () => ({
          ...mockPrescription,
          dispensation: { status: 'dispensed', dispensedAt: new Date() }
        })
      });

      const result = await prescriptionService.markPrescriptionDispensed(
        mockPrescription._id.toString(),
        mockUser._id,
        'Dispensed'
      );

      expect(result.dispensation).to.have.property('status', 'dispensed');
      expect(prescriptionRepository.update).to.have.been.calledOnce;
    });
  });
});

