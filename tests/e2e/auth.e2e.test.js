const { expect } = require('chai');
const request = require('supertest');
const app = require('../../app');
const User = require('../../app/Models/User');
const Role = require('../../app/Models/Role');
const { connectDB, closeDB, clearDB } = require('../utils/test-db');
const { clearRedis } = require('../utils/test-redis');
const bcrypt = require('bcrypt');

describe('Auth E2E Tests', () => {
  let authToken;
  let refreshToken;
  let testRole;
  let testUser;

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
  });

  after(async () => {
    await clearDB();
    await closeDB();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@test.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        phone: '0987654321',
        role: testRole._id
      };

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data.user).to.have.property('email', userData.email);
      expect(res.body.data.user).to.not.have.property('password');
    });

    it('should return 409 if email already exists', async () => {
      const userData = {
        email: 'doctortest@test.com',
        password: 'password123',
        firstName: 'Duplicate',
        lastName: 'User'
      };

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(409);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('already registered');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'doctortest@test.com',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.have.property('accessToken');
      expect(res.body.data).to.have.property('refreshToken');
      expect(res.body.data).to.have.property('user');

      authToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
    });

    it('should return 401 with invalid credentials', async () => {
      const loginData = {
        email: 'doctortest@test.com',
        password: 'wrongpassword'
      };

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('Invalid');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      if (!refreshToken) {
        const loginRes = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: 'doctortest@test.com',
            password: 'password123'
          });
        refreshToken = loginRes.body.data.refreshToken;
      }

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('accessToken');
      expect(res.body.data).to.have.property('refreshToken');
    });

    it('should return 401 with invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(res.body).to.have.property('success', false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      if (!authToken) {
        const loginRes = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: 'doctortest@test.com',
            password: 'password123'
          });
        authToken = loginRes.body.data.accessToken;
        refreshToken = loginRes.body.data.refreshToken;
      }

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ refreshToken })
        .expect(204);

      expect(res.body).to.be.empty;
    });
  });
});

