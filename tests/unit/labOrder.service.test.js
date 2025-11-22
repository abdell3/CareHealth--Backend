const { expect } = require('chai');
const sinon = require('sinon');
const LabOrderService = require('../../app/Services/LabOrderService');
const { mockLabOrder, mockPatient, mockUser, mockConsultation } = require('../utils/mock-data');

describe('LabOrderService', () => {
  let labOrderService;
  let labOrderRepository;
  let patientRepository;
  let userRepository;
  let consultationRepository;

  beforeEach(() => {
    labOrderRepository = {
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

    consultationRepository = {
      findById: sinon.stub()
    };

    labOrderService = new LabOrderService(labOrderRepository);
    labOrderService.patientRepository = patientRepository;
    labOrderService.userRepository = userRepository;
    labOrderService.consultationRepository = consultationRepository;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('createOrder', () => {
    it('should create lab order successfully', async () => {
      patientRepository.findById.resolves(mockPatient);
      userRepository.findById.resolves({ ...mockUser, role: { name: 'doctor' } });
      consultationRepository.findById.resolves(mockConsultation);
      labOrderRepository.create.resolves({
        ...mockLabOrder,
        toObject: () => mockLabOrder
      });

      const orderData = {
        patientId: mockPatient._id.toString(),
        doctorId: mockUser._id.toString(),
        consultationId: mockConsultation._id.toString(),
        tests: ['Blood Test', 'Urine Test']
      };

      const result = await labOrderService.createOrder(orderData, mockUser._id);

      expect(result).to.have.property('tests');
      expect(result.tests).to.be.an('array');
      expect(result.status).to.equal('ordered');
      expect(patientRepository.findById).to.have.been.calledOnce;
    });

    it('should throw error if patient not found', async () => {
      patientRepository.findById.resolves(null);

      try {
        await labOrderService.createOrder(
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

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      labOrderRepository.findById.resolves({
        ...mockLabOrder,
        toObject: () => mockLabOrder
      });
      labOrderRepository.update.resolves({
        ...mockLabOrder,
        status: 'received',
        toObject: () => ({ ...mockLabOrder, status: 'received' })
      });

      const result = await labOrderService.updateOrderStatus(
        mockLabOrder._id.toString(),
        { status: 'received' }
      );

      expect(result.status).to.equal('received');
      expect(labOrderRepository.update).to.have.been.calledOnce;
    });
  });
});

