const { expect } = require('chai');
const request = require('supertest');
const app = require('../../app');
const User = require('../../app/Models/User');
const Role = require('../../app/Models/Role');
const Patient = require('../../app/Models/Patient');
const { connectDB, closeDB, clearDB } = require('../utils/test-db');
const { clearRedis } = require('../utils/test-redis');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');

describe('Patients E2E Tests', () => {
  let authToken;
  let testRole;
  let testUser;
  let testPatient;

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
  });

  after(async () => {
    await clearDB();
    await closeDB();
  });

  describe('POST /api/v1/patients', () => {
    it('should create a patient successfully', async () => {
      const patientData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@test.com',
        phone: '0987654321',
        dateOfBirth: '1990-01-01',
        gender: 'female',
        address: {
          street: '123 Main St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country'
        }
      };

      const res = await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(patientData)
        .expect(201);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data.patient).to.have.property('firstName', patientData.firstName);
      expect(res.body.data.patient).to.have.property('email', patientData.email);
    });

    it('should return 400 with invalid data', async () => {
      const invalidData = {
        firstName: '',
        email: 'invalid-email'
      };

      const res = await request(app)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(res.body).to.have.property('success', false);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/v1/patients')
        .send({ firstName: 'Test' })
        .expect(401);
    });
  });

  describe('GET /api/v1/patients', () => {
    beforeEach(async () => {
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

    it('should get paginated list of patients', async () => {
      const res = await request(app)
        .get('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body).to.have.property('meta');
      expect(res.body.data).to.be.an('array');
    });

    it('should filter patients by search query', async () => {
      const res = await request(app)
        .get('/api/v1/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ search: 'Jane' })
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.length).to.be.greaterThan(0);
    });
  });

  describe('GET /api/v1/patients/:id', () => {
    beforeEach(async () => {
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

    it('should get a patient by id', async () => {
      const res = await request(app)
        .get(`/api/v1/patients/${testPatient._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data.patient).to.have.property('_id', testPatient._id.toString());
    });

    it('should return 404 if patient not found', async () => {
      const fakeId = require('mongoose').Types.ObjectId();
      const res = await request(app)
        .get(`/api/v1/patients/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(res.body).to.have.property('success', false);
    });
  });

  describe('PUT /api/v1/patients/:id', () => {
    beforeEach(async () => {
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

    it('should update a patient successfully', async () => {
      const updateData = {
        firstName: 'Updated'
      };

      const res = await request(app)
        .put(`/api/v1/patients/${testPatient._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data.patient).to.have.property('firstName', 'Updated');
    });
  });

  describe('DELETE /api/v1/patients/:id', () => {
    beforeEach(async () => {
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

    it('should soft delete a patient successfully', async () => {
      const res = await request(app)
        .delete(`/api/v1/patients/${testPatient._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      expect(res.body).to.be.empty;

      const deletedPatient = await Patient.findById(testPatient._id);
      expect(deletedPatient.isDeleted).to.be.true;
    });
  });
});

