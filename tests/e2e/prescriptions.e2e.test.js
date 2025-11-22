const { expect } = require('chai');
const request = require('supertest');
const app = require('../../app');
const User = require('../../app/Models/User');
const Role = require('../../app/Models/Role');
const Patient = require('../../app/Models/Patient');
const Prescription = require('../../app/Models/Prescription');
const Pharmacy = require('../../app/Models/Pharmacy');
const { connectDB, closeDB, clearDB } = require('../utils/test-db');
const { clearRedis } = require('../utils/test-redis');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');

describe('Prescriptions E2E Tests', () => {
  let authToken;
  let testRole;
  let testUser;
  let testPatient;
  let testPharmacy;
  let testPrescription;

  before(async () => {
    await connectDB();
    await clearRedis();

    testRole = await Role.create({
      name: 'doctor',
      description: 'Doctor role'
    });

    const hashedPassword = await bcrypt.hash('password123', 10);
    testUser = await User.create({
      email: 'doctortest@test.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'Doctor',
      phone: '1234567890',
      role: testRole._id,
      isActive: true,
      isSuspended: false
    });

    authToken = jwt.sign(
      {
        userId: testUser._id.toString(),
        email: testUser.email,
        role: testRole._id.toString()
      },
      authConfig.accessTokenSecret,
      { expiresIn: '15m' }
    );
  });

  beforeEach(async () => {
    await clearDB();
    await Patient.deleteMany({});
    await Prescription.deleteMany({});
    await Pharmacy.deleteMany({});

    testPatient = await Patient.create({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@test.com',
      phone: '0987654321',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'female',
      createdBy: testUser._id,
      isDeleted: false
    });

    testPharmacy = await Pharmacy.create({
      name: 'Test Pharmacy',
      address: '456 Pharmacy St',
      phone: '1112223333',
      email: 'pharmacy@test.com',
      status: 'active',
      isDeleted: false
    });
  });

  after(async () => {
    await clearDB();
    await closeDB();
  });

  describe('POST /api/v1/prescriptions', () => {
    it('should create a prescription successfully', async () => {
      const prescriptionData = {
        patientId: testPatient._id.toString(),
        doctorId: testUser._id.toString(),
        medications: [
          {
            name: 'Paracetamol',
            dosage: '500mg',
            frequency: 'Every 6 hours',
            duration: '7 days'
          }
        ],
        category: 'medication'
      };

      const res = await request(app)
        .post('/api/v1/prescriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(prescriptionData)
        .expect(201);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data.prescription).to.have.property('medications');
      expect(res.body.data.prescription.medications).to.be.an('array');
    });
  });

  describe('POST /api/v1/prescriptions/:id/assign-pharmacy', () => {
    beforeEach(async () => {
      testPrescription = await Prescription.create({
        patientId: testPatient._id,
        doctorId: testUser._id,
        medications: [
          {
            name: 'Paracetamol',
            dosage: '500mg',
            frequency: 'Every 6 hours',
            duration: '7 days'
          }
        ],
        issuedAt: new Date()
      });
    });

    it('should assign pharmacy to prescription successfully', async () => {
      const res = await request(app)
        .post(`/api/v1/prescriptions/${testPrescription._id}/assign-pharmacy`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ pharmacyId: testPharmacy._id.toString() })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data.prescription).to.have.property('pharmacyId');
    });
  });

  describe('POST /api/v1/prescriptions/:id/mark-dispensed', () => {
    beforeEach(async () => {
      testPrescription = await Prescription.create({
        patientId: testPatient._id,
        doctorId: testUser._id,
        pharmacyId: testPharmacy._id,
        medications: [
          {
            name: 'Paracetamol',
            dosage: '500mg',
            frequency: 'Every 6 hours',
            duration: '7 days'
          }
        ],
        issuedAt: new Date()
      });
    });

    it('should mark prescription as dispensed successfully', async () => {
      const res = await request(app)
        .post(`/api/v1/prescriptions/${testPrescription._id}/mark-dispensed`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: 'Dispensed successfully' })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data.prescription.dispensation).to.have.property('status', 'dispensed');
    });
  });
});

