const { getRedisClient } = require('../../config/redis');
const crypto = require('crypto');

class RefreshTokenRepository {
  constructor() {
    this.redisClient = getRedisClient();
    this.prefix = 'refresh_token:';
  }

  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  getKey(userId, token = null) {
    if (token) {
      const hashedToken = this.hashToken(token);
      return `${this.prefix}${userId}:${hashedToken}`;
    }
    return `${this.prefix}${userId}:*`;
  }

  async saveToken(userId, token, ttl) {
    try {
      if (!this.redisClient || !this.redisClient.isOpen) {
        throw new Error('Redis client not available');
      }

      const key = this.getKey(userId, token);
      const value = JSON.stringify({
        userId: userId.toString(),
        token: this.hashToken(token),
        createdAt: new Date().toISOString()
      });

      await this.redisClient.setEx(key, ttl, value);
      return true;
    } catch (error) {
      console.error('Error saving refresh token:', error);
      throw error;
    }
  }

  async findToken(userId, token) {
    try {
      if (!this.redisClient || !this.redisClient.isOpen) {
        return null;
      }

      const key = this.getKey(userId, token);
      const value = await this.redisClient.get(key);

      if (!value) {
        return null;
      }

      return JSON.parse(value);
    } catch (error) {
      console.error('Error finding refresh token:', error);
      return null;
    }
  }

  async findAllUserTokens(userId) {
    try {
      if (!this.redisClient || !this.redisClient.isOpen) {
        return [];
      }

      const pattern = `${this.prefix}${userId}:*`;
      const keys = await this.redisClient.keys(pattern);

      if (!keys || keys.length === 0) {
        return [];
      }

      const tokens = [];
      for (const key of keys) {
        const value = await this.redisClient.get(key);
        if (value) {
          const tokenData = JSON.parse(value);
          tokens.push({
            key,
            ...tokenData
          });
        }
      }

      return tokens;
    } catch (error) {
      console.error('Error finding all user tokens:', error);
      return [];
    }
  }

  async deleteToken(userId, token) {
    try {
      if (!this.redisClient || !this.redisClient.isOpen) {
        return false;
      }

      const key = this.getKey(userId, token);
      const result = await this.redisClient.del(key);
      return result > 0;
    } catch (error) {
      console.error('Error deleting refresh token:', error);
      return false;
    }
  }

  async deleteAllTokens(userId) {
    try {
      if (!this.redisClient || !this.redisClient.isOpen) {
        return false;
      }

      const pattern = `${this.prefix}${userId}:*`;
      const keys = await this.redisClient.keys(pattern);

      if (!keys || keys.length === 0) {
        return true;
      }

      const result = await this.redisClient.del(keys);
      return result > 0;
    } catch (error) {
      console.error('Error deleting all user tokens:', error);
      return false;
    }
  }
}

module.exports = RefreshTokenRepository;

