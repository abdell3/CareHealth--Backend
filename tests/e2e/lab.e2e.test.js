const { expect } = require('chai');
const request = require('supertest');
const app = require('../../app');
const User = require('../../app/Models/User');
const Role = require('../../app/Models/Role');
const Patient = require('../../app/Models/Patient');
const LabOrder = require('../../app/Models/LabOrder');
const LabResult = require('../../app/Models/LabResult');
const { connectDB, closeDB, clearDB } = require('../utils/test-db');
const { clearRedis } = require('../utils/test-redis');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');

describe('Laboratory E2E Tests', () => {
  let authToken;
  let testRole;
  let testUser;
  let testPatient;
  let testLabOrder;
  let testLabResult;

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
    await LabOrder.deleteMany({});
    await LabResult.deleteMany({});

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
  });

  after(async () => {
    await clearDB();
    await closeDB();
  });

  describe('POST /api/v1/laboratory/orders', () => {
    it('should create a lab order successfully', async () => {
      const orderData = {
        patientId: testPatient._id.toString(),
        doctorId: testUser._id.toString(),
        tests: ['Blood Test', 'Urine Test']
      };

      const res = await request(app)
        .post('/api/v1/laboratory/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(201);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data.labOrder).to.have.property('tests');
      expect(res.body.data.labOrder.tests).to.be.an('array');
      expect(res.body.data.labOrder.status).to.equal('ordered');
    });
  });

  describe('POST /api/v1/laboratory/results', () => {
    beforeEach(async () => {
      testLabOrder = await LabOrder.create({
        patientId: testPatient._id,
        doctorId: testUser._id,
        tests: ['Blood Test'],
        status: 'ordered'
      });
    });

    it('should upload lab result successfully', async () => {
      const resultData = {
        labOrderId: testLabOrder._id.toString(),
        fileUrl: 'test-result.pdf',
        notes: 'Test result notes'
      };

      const res = await request(app)
        .post('/api/v1/laboratory/results')
        .set('Authorization', `Bearer ${authToken}`)
        .send(resultData)
        .expect(201);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data.labResult).to.have.property('labOrderId');
      expect(res.body.data.labResult).to.have.property('fileUrl');
    });
  });

  describe('PUT /api/v1/laboratory/results/:id/validate', () => {
    beforeEach(async () => {
      testLabOrder = await LabOrder.create({
        patientId: testPatient._id,
        doctorId: testUser._id,
        tests: ['Blood Test'],
        status: 'ordered'
      });

      testLabResult = await LabResult.create({
        labOrderId: testLabOrder._id,
        fileUrl: 'test-result.pdf',
        uploaderId: testUser._id,
        uploadedAt: new Date(),
        validatedAt: null,
        isDeleted: false
      });
    });

    it('should validate lab result successfully', async () => {
      const res = await request(app)
        .put(`/api/v1/laboratory/results/${testLabResult._id}/validate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data.labResult).to.have.property('validatedAt');
    });
  });
});

