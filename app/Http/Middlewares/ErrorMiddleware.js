const LoggerService = require('../../Services/LoggerService');

const loggerService = new LoggerService();

class ErrorMiddleware {
  handleError(err, req, res, next) {
    loggerService.logError('HTTP Error', { error: err, req: req });

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    const response = {
      success: false,
      message: message
    };

    if (process.env.NODE_ENV === 'development') {
      response.error = err.stack;
      response.details = {
        name: err.name,
        statusCode: err.statusCode
      };
    }

    res.status(statusCode).json(response);
  }

  handleNotFound(req, res, next) {
    const error = new Error('Route not found');
    error.statusCode = 404;
    loggerService.logWarn('Route not found', {
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || req.connection.remoteAddress
    });
    next(error);
  }
}

module.exports = new ErrorMiddleware();
