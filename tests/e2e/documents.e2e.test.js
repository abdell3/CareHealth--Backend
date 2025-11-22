const { expect } = require('chai');
const request = require('supertest');
const app = require('../../app');
const User = require('../../app/Models/User');
const Role = require('../../app/Models/Role');
const Patient = require('../../app/Models/Patient');
const MedicalDocument = require('../../app/Models/MedicalDocument');
const { connectDB, closeDB, clearDB } = require('../utils/test-db');
const { clearRedis } = require('../utils/test-redis');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');
const path = require('path');
const fs = require('fs');

describe('Documents E2E Tests', () => {
  let authToken;
  let testRole;
  let testUser;
  let testPatient;
  let testDocument;

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
    await MedicalDocument.deleteMany({});

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

  describe('POST /api/v1/documents', () => {
    it('should upload a document successfully', async () => {
      const fileBuffer = Buffer.from('test PDF content');
      const metadata = JSON.stringify({
        patientId: testPatient._id.toString(),
        category: 'report',
        tags: ['test'],
        metadata: {}
      });

      const res = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', fileBuffer, 'test-document.pdf')
        .field('patientId', testPatient._id.toString())
        .field('category', 'report')
        .field('tags', JSON.stringify(['test']))
        .expect(201);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data.document).to.have.property('fileName');
      expect(res.body.data.document).to.have.property('category', 'report');
    });

    it('should return 400 for invalid file type', async () => {
      const fileBuffer = Buffer.from('test content');

      const res = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', fileBuffer, 'test.txt')
        .field('patientId', testPatient._id.toString())
        .field('category', 'report')
        .expect(400);

      expect(res.body).to.have.property('success', false);
    });
  });

  describe('GET /api/v1/documents', () => {
    beforeEach(async () => {
      testDocument = await MedicalDocument.create({
        patientId: testPatient._id,
        uploaderId: testUser._id,
        fileName: 'test-document.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
        category: 'report',
        tags: ['test'],
        fileUrl: 'test-document.pdf',
        isDeleted: false
      });
    });

    it('should get paginated list of documents', async () => {
      const res = await request(app)
        .get('/api/v1/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.be.an('array');
    });

    it('should filter documents by patient', async () => {
      const res = await request(app)
        .get('/api/v1/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ patientId: testPatient._id.toString() })
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.length).to.be.greaterThan(0);
    });
  });

  describe('GET /api/v1/documents/:id', () => {
    beforeEach(async () => {
      testDocument = await MedicalDocument.create({
        patientId: testPatient._id,
        uploaderId: testUser._id,
        fileName: 'test-document.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
        category: 'report',
        tags: ['test'],
        fileUrl: 'test-document.pdf',
        isDeleted: false
      });
    });

    it('should get document by id with presigned URL', async () => {
      const res = await request(app)
        .get(`/api/v1/documents/${testDocument._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data.document).to.have.property('downloadUrl');
    });
  });
});

