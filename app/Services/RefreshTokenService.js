const RefreshTokenRepository = require('../Repositories/RefreshTokenRepository');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');
const { REFRESH_TOKEN_TTL } = require('../../config/redis');

class RefreshTokenService {
  constructor() {
    this.refreshTokenRepository = new RefreshTokenRepository();
  }

  async createRefreshToken(userId) {
    try {
      const token = jwt.sign(
        { userId, type: 'refresh' },
        authConfig.refreshTokenSecret,
        { expiresIn: authConfig.refreshTokenExpiry }
      );

      await this.refreshTokenRepository.saveToken(userId, token, REFRESH_TOKEN_TTL);

      return token;
    } catch (error) {
      console.error('Error creating refresh token:', error);
      throw error;
    }
  }

  async verifyRefreshToken(userId, token) {
    try {
      if (!token) {
        return false;
      }

      const decoded = jwt.verify(token, authConfig.refreshTokenSecret);

      if (decoded.type !== 'refresh' || decoded.userId !== userId) {
        return false;
      }

      const storedToken = await this.refreshTokenRepository.findToken(userId, token);

      if (!storedToken) {
        return false;
      }

      return true;
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return false;
      }
      console.error('Error verifying refresh token:', error);
      return false;
    }
  }

  async revokeRefreshToken(userId, token) {
    try {
      const deleted = await this.refreshTokenRepository.deleteToken(userId, token);
      return deleted;
    } catch (error) {
      console.error('Error revoking refresh token:', error);
      return false;
    }
  }

  async revokeAllUserTokens(userId) {
    try {
      const deleted = await this.refreshTokenRepository.deleteAllTokens(userId);
      return deleted;
    } catch (error) {
      console.error('Error revoking all user tokens:', error);
      return false;
    }
  }

  async getAllUserTokens(userId) {
    try {
      const tokens = await this.refreshTokenRepository.findAllUserTokens(userId);
      return tokens;
    } catch (error) {
      console.error('Error getting all user tokens:', error);
      return [];
    }
  }
}

module.exports = RefreshTokenService;

