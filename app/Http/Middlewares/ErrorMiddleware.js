class ErrorMiddleware {
  async handleError(err, req, res, next) {}

  async notFound(req, res, next) {}
}

module.exports = ErrorMiddleware;

