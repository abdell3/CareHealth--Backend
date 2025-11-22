require('dotenv').config();
const express = require('express');
const routes = require('./routes/index');
const { initializeRedis } = require('./config/redis');
const LoggingMiddleware = require('./app/Http/Middlewares/LoggingMiddleware');
const ErrorMiddleware = require('./app/Http/Middlewares/ErrorMiddleware');
const logger = require('./config/logger');

const app = express();

initializeRedis().catch((err) => {
  logger.error('Redis initialization error:', { error: err.message, stack: err.stack });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(LoggingMiddleware.logRequest());

app.use('/api', routes);

app.use(ErrorMiddleware.handleNotFound);
app.use(ErrorMiddleware.handleError);

module.exports = app;


