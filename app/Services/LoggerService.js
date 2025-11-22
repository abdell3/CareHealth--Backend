const logger = require('../../config/logger');

class LoggerService {
  logInfo(message, meta = {}) {
    logger.info(message, {
      ...meta,
      level: 'info',
      timestamp: new Date().toISOString()
    });
  }

  logWarn(message, meta = {}) {
    logger.warn(message, {
      ...meta,
      level: 'warn',
      timestamp: new Date().toISOString()
    });
  }

  logError(message, meta = {}) {
    logger.error(message, {
      ...meta,
      level: 'error',
      timestamp: new Date().toISOString(),
      stack: meta.error?.stack || meta.stack
    });
  }

  logAudit(action, userId, resource, details = {}) {
    logger.log({
      level: 'info',
      message: `AUDIT: ${action}`,
      audit: true,
      action,
      userId: userId?.toString() || null,
      resource,
      details,
      timestamp: new Date().toISOString()
    });
  }

  logHTTPRequest(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      userId: req.user?.id || null,
      timestamp: new Date().toISOString()
    };

    if (res.statusCode >= 500) {
      logger.error('HTTP Request Error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP Request Warning', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  }

  logHTTPError(err, req) {
    logger.error('HTTP Error', {
      message: err.message,
      stack: err.stack,
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id || null,
      body: req.body,
      query: req.query,
      params: req.params,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = LoggerService;

