const redis = require('redis');

const redisConfig = {
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    connectTimeout: 10000
  },
  password: process.env.REDIS_PASSWORD || undefined,
  database: parseInt(process.env.REDIS_DB) || 0
};

let redisClient = null;

const initializeRedis = async () => {
  try {
    redisClient = redis.createClient(redisConfig);

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });

    redisClient.on('ready', () => {
      console.log('Redis Client Ready');
    });

    redisClient.on('end', () => {
      console.log('Redis Client Disconnected');
    });

    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    return redisClient;
  } catch (error) {
    console.error('Redis initialization error:', error);
    return null;
  }
};

const getRedisClient = () => {
  return redisClient;
};

const REFRESH_TOKEN_TTL = parseInt(process.env.REFRESH_TOKEN_TTL) || 7 * 24 * 60 * 60;

module.exports = {
  initializeRedis,
  getRedisClient,
  redisConfig,
  REFRESH_TOKEN_TTL
};
