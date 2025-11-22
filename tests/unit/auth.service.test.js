const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AuthService = require('../../app/Services/AuthService');
const RefreshTokenService = require('../../app/Services/RefreshTokenService');
const { mockUser, mockRole } = require('../utils/mock-data');

describe('AuthService', () => {
  let authService;
  let userRepository;
  let refreshTokenService;
  let refreshTokenServiceStub;

  beforeEach(() => {
    refreshTokenService = new RefreshTokenService();
    refreshTokenServiceStub = sinon.stub(refreshTokenService);
    refreshTokenServiceStub.createRefreshToken.resolves('mock-refresh-token');
    refreshTokenServiceStub.verifyRefreshToken.resolves(true);
    refreshTokenServiceStub.revokeRefreshToken.resolves(true);
    refreshTokenServiceStub.revokeAllUserTokens.resolves(true);

    userRepository = {
      findByEmail: sinon.stub(),
      findById: sinon.stub(),
      create: sinon.stub(),
      update: sinon.stub(),
      findByIdWithPassword: sinon.stub()
    };

    authService = new AuthService(userRepository);
    authService.refreshTokenService = refreshTokenServiceStub;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      userRepository.findByEmail.resolves(null);
      userRepository.create.resolves({
        ...mockUser,
        toObject: () => mockUser
      });

      const userData = {
        email: 'newuser@test.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User'
      };

      const result = await authService.register(userData);

      expect(result).to.have.property('email', userData.email);
      expect(result).to.not.have.property('password');
      expect(userRepository.findByEmail).to.have.been.calledWith(userData.email);
      expect(userRepository.create).to.have.been.calledOnce;
    });

    it('should throw error if email already exists', async () => {
      userRepository.findByEmail.resolves(mockUser);

      const userData = {
        email: 'existing@test.com',
        password: 'password123'
      };

      try {
        await authService.register(userData);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.equal('Email already registered');
        expect(error.statusCode).to.equal(409);
      }
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      userRepository.findByEmail.resolves({
        ...mockUser,
        password: hashedPassword,
        toObject: () => mockUser
      });

      const result = await authService.login('doctor@test.com', 'password123');

      expect(result).to.have.property('user');
      expect(result).to.have.property('accessToken');
      expect(result).to.have.property('refreshToken');
      expect(result.user).to.not.have.property('password');
      expect(refreshTokenServiceStub.createRefreshToken).to.have.been.calledOnce;
    });

    it('should throw error with invalid credentials', async () => {
      userRepository.findByEmail.resolves(null);

      try {
        await authService.login('wrong@test.com', 'wrongpass');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.equal('Invalid email or password');
        expect(error.statusCode).to.equal(401);
      }
    });

    it('should throw error if account is deactivated', async () => {
      userRepository.findByEmail.resolves({
        ...mockUser,
        isActive: false
      });

      try {
        await authService.login('doctor@test.com', 'password123');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.equal('Account is deactivated');
        expect(error.statusCode).to.equal(403);
      }
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = jwt.sign(
        { userId: mockUser._id.toString(), type: 'refresh' },
        process.env.JWT_REFRESH_SECRET || 'test-secret'
      );

      refreshTokenServiceStub.verifyRefreshToken.resolves(true);
      userRepository.findById.resolves({
        ...mockUser,
        isActive: true,
        isSuspended: false
      });

      const result = await authService.refreshToken(refreshToken);

      expect(result).to.have.property('accessToken');
      expect(result).to.have.property('refreshToken');
      expect(refreshTokenServiceStub.verifyRefreshToken).to.have.been.calledOnce;
      expect(refreshTokenServiceStub.createRefreshToken).to.have.been.calledOnce;
      expect(refreshTokenServiceStub.revokeRefreshToken).to.have.been.calledOnce;
    });

    it('should throw error with invalid refresh token', async () => {
      refreshTokenServiceStub.verifyRefreshToken.resolves(false);

      try {
        await authService.refreshToken('invalid-token');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.equal('Invalid or expired refresh token');
        expect(error.statusCode).to.equal(401);
      }
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const result = await authService.logout(mockUser._id.toString(), 'token');

      expect(result).to.be.true;
      expect(refreshTokenServiceStub.revokeRefreshToken).to.have.been.calledOnce;
    });

    it('should revoke all tokens if no token provided', async () => {
      const result = await authService.logout(mockUser._id.toString());

      expect(result).to.be.true;
      expect(refreshTokenServiceStub.revokeAllUserTokens).to.have.been.calledOnce;
    });
  });
});

