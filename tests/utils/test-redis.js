const { getRedisClient } = require('../../config/redis');

const clearRedis = async () => {
  const client = getRedisClient();
  if (client && client.isOpen) {
    try {
      const keys = await client.keys('*');
      if (keys && keys.length > 0) {
        await client.del(keys);
      }
    } catch (error) {
      console.error('Error clearing Redis:', error);
    }
  }
};

const disconnectRedis = async () => {
  const client = getRedisClient();
  if (client && client.isOpen) {
    try {
      await client.quit();
    } catch (error) {
      console.error('Error disconnecting Redis:', error);
    }
  }
};

module.exports = {
  clearRedis,
  disconnectRedis
};

