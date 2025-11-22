const { expect } = require('chai');
const sinon = require('sinon');
const LoggerService = require('../../app/Services/LoggerService');
const logger = require('../../config/logger');

describe('LoggerService', () => {
  let loggerService;
  let loggerStub;

  beforeEach(() => {
    loggerService = new LoggerService();
    loggerStub = sinon.stub(logger);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('logInfo', () => {
    it('should log info message', () => {
      loggerService.logInfo('Test info message', { key: 'value' });

      expect(loggerStub.info).to.have.been.calledOnce;
      const callArgs = loggerStub.info.getCall(0).args;
      expect(callArgs[0]).to.equal('Test info message');
      expect(callArgs[1]).to.have.property('key', 'value');
      expect(callArgs[1]).to.have.property('level', 'info');
    });
  });

  describe('logWarn', () => {
    it('should log warning message', () => {
      loggerService.logWarn('Test warning message', { key: 'value' });

      expect(loggerStub.warn).to.have.been.calledOnce;
      const callArgs = loggerStub.warn.getCall(0).args;
      expect(callArgs[0]).to.equal('Test warning message');
      expect(callArgs[1]).to.have.property('key', 'value');
    });
  });

  describe('logError', () => {
    it('should log error message with stack trace', () => {
      const error = new Error('Test error');
      loggerService.logError('Test error message', { error: error });

      expect(loggerStub.error).to.have.been.calledOnce;
      const callArgs = loggerStub.error.getCall(0).args;
      expect(callArgs[0]).to.equal('Test error message');
      expect(callArgs[1]).to.have.property('stack');
    });
  });

  describe('logAudit', () => {
    it('should log audit action with metadata', () => {
      const userId = '507f1f77bcf86cd799439011';
      loggerService.logAudit('CREATE_PATIENT', userId, 'Patient', {
        patientId: '507f1f77bcf86cd799439012'
      });

      expect(loggerStub.log).to.have.been.calledOnce;
      const callArgs = loggerStub.log.getCall(0).args[0];
      expect(callArgs.message).to.include('AUDIT: CREATE_PATIENT');
      expect(callArgs.action).to.equal('CREATE_PATIENT');
      expect(callArgs.userId).to.equal(userId);
      expect(callArgs.resource).to.equal('Patient');
      expect(callArgs.details).to.have.property('patientId');
    });
  });

  describe('logHTTPRequest', () => {
    it('should log HTTP request with response time', () => {
      const req = {
        method: 'GET',
        originalUrl: '/api/v1/patients',
        ip: '127.0.0.1',
        get: sinon.stub().returns('test-agent'),
        user: { id: '507f1f77bcf86cd799439011' }
      };
      const res = {
        statusCode: 200
      };

      loggerService.logHTTPRequest(req, res, 150);

      expect(loggerStub.info).to.have.been.calledOnce;
      const callArgs = loggerStub.info.getCall(0).args[1];
      expect(callArgs.method).to.equal('GET');
      expect(callArgs.url).to.equal('/api/v1/patients');
      expect(callArgs.statusCode).to.equal(200);
      expect(callArgs.responseTime).to.equal('150ms');
    });

    it('should log as error for 5xx status codes', () => {
      const req = {
        method: 'GET',
        originalUrl: '/api/v1/patients',
        ip: '127.0.0.1',
        get: sinon.stub().returns('test-agent')
      };
      const res = {
        statusCode: 500
      };

      loggerService.logHTTPRequest(req, res, 200);

      expect(loggerStub.error).to.have.been.calledOnce;
    });
  });

  describe('logHTTPError', () => {
    it('should log HTTP error with full context', () => {
      const error = new Error('Test error');
      const req = {
        method: 'POST',
        originalUrl: '/api/v1/patients',
        ip: '127.0.0.1',
        body: { test: 'data' },
        query: {},
        params: { id: '123' },
        user: { id: '507f1f77bcf86cd799439011' }
      };

      loggerService.logHTTPError(error, req);

      expect(loggerStub.error).to.have.been.calledOnce;
      const callArgs = loggerStub.error.getCall(0).args[1];
      expect(callArgs.message).to.equal('Test error');
      expect(callArgs.method).to.equal('POST');
      expect(callArgs.url).to.equal('/api/v1/patients');
      expect(callArgs.body).to.deep.equal({ test: 'data' });
    });
  });
});

