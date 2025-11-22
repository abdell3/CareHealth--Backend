const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authConfig = require('../../config/auth');
const EmailService = require('./EmailService');

class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
    this.emailService = new EmailService();
  }

  async register(data) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      const error = new Error('Email already registered');
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const userData = {
      ...data,
      password: hashedPassword,
      email: data.email.toLowerCase().trim()
    };

    const user = await this.userRepository.create(userData);
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.refreshToken;
    delete userObject.resetToken;

    return userObject;
  }

  async login(email, password) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('Account is deactivated');
      error.statusCode = 403;
      throw error;
    }

    if (user.isSuspended) {
      const error = new Error('Account is suspended');
      error.statusCode = 403;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    await this.userRepository.storeRefreshToken(user._id, refreshToken);

    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.refreshToken;
    delete userObject.resetToken;

    return {
      user: userObject,
      accessToken,
      refreshToken
    };
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, authConfig.refreshTokenSecret);
      const user = await this.userRepository.findById(decoded.userId);

      if (!user || !user.isActive) {
        const error = new Error('Invalid refresh token');
        error.statusCode = 401;
        throw error;
      }

      const storedUser = await this.userRepository.findByEmail(user.email);
      if (!storedUser || storedUser.refreshToken !== refreshToken) {
        const error = new Error('Refresh token mismatch');
        error.statusCode = 401;
        throw error;
      }

      const newAccessToken = this.generateAccessToken(storedUser);
      const newRefreshToken = this.generateRefreshToken(storedUser);

      await this.userRepository.storeRefreshToken(storedUser._id, newRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        error.statusCode = 401;
        error.message = 'Invalid or expired refresh token';
      }
      throw error;
    }
  }

  async logout(userId) {
    await this.userRepository.removeRefreshToken(userId);
    return true;
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await this.userRepository.findByIdWithPassword(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('Account is deactivated');
      error.statusCode = 403;
      throw error;
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      const error = new Error('Current password is incorrect');
      error.statusCode = 400;
      throw error;
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(userId, { password: hashedNewPassword });

    return true;
  }

  async requestPasswordReset(email) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return true;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.userRepository.savePasswordResetToken(user._id, hashedToken, expiresAt);

    try {
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      const logger = require('winston') || console;
      if (logger.error) {
        logger.error('Failed to send password reset email:', {
          email: user.email,
          error: error.message
        });
      } else {
        console.error('Failed to send password reset email:', error);
      }
    }

    return true;
  }

  async resetPassword(resetToken, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const user = await this.userRepository.findByPasswordResetToken(hashedToken);

    if (!user) {
      const error = new Error('Invalid or expired reset token');
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.updatePasswordById(user._id, hashedPassword);

    return true;
  }

  generateAccessToken(user) {
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role?._id?.toString() || user.role?.toString()
    };

    return jwt.sign(payload, authConfig.accessTokenSecret, {
      expiresIn: authConfig.accessTokenExpiry
    });
  }

  generateRefreshToken(user) {
    const payload = {
      userId: user._id.toString()
    };

    return jwt.sign(payload, authConfig.refreshTokenSecret, {
      expiresIn: authConfig.refreshTokenExpiry
    });
  }
}

module.exports = AuthService;
