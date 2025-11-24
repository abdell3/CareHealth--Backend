require('dotenv').config();
const app = require('./app');
const { initializeDatabase } = require('./config/database');
const logger = require('./config/logger');
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development'
      });
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

startServer();

