const mongoose = require('mongoose');
const logger = require('./logger');

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/carehealth-dev';

const initializeDatabase = async () => {
  try {
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully', {
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        database: mongoose.connection.name
      });
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', {
        error: err.message,
        stack: err.stack
      });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });

    logger.info('MongoDB connection initialized', {
      uri: mongoUri.replace(/\/\/.*@/, '//***:***@'),
      readyState: mongoose.connection.readyState
    });

    return mongoose.connection;
  } catch (error) {
    logger.error('MongoDB initialization error', {
      error: error.message,
      stack: error.stack,
      uri: mongoUri.replace(/\/\/.*@/, '//***:***@')
    });
    throw error;
  }
};

const closeDatabase = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error('Error closing MongoDB connection', {
      error: error.message
    });
  }
};

module.exports = {
  initializeDatabase,
  closeDatabase,
  mongoose
};
