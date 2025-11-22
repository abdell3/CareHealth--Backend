const LoggerService = require('../../Services/LoggerService');

const loggerService = new LoggerService();

class LoggingMiddleware {
  logRequest() {
    return (req, res, next) => {
      const startTime = Date.now();

      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        loggerService.logHTTPRequest(req, res, responseTime);
      });

      next();
    };
  }
}

module.exports = new LoggingMiddleware();

