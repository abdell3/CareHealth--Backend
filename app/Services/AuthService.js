const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authConfig = require('../../config/auth');
const EmailWorker = require('../../worker/emailWorker');

class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
    this.emailWorker = new EmailWorker();
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
    const expiresAt = new Date(Date.now() + authConfig.resetTokenExpiryMinutes * 60 * 1000);

    await this.userRepository.setResetToken(user._id, hashedToken, expiresAt);

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    await this.emailWorker.sendEmail({
      to: user.email,
      subject: 'Password Reset Request - CareFlow EHR',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${user.firstName},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in ${authConfig.resetTokenExpiryMinutes} minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
      text: `
        Password Reset Request
        Hello ${user.firstName},
        You requested a password reset. Visit this link to reset your password:
        ${resetUrl}
        This link will expire in ${authConfig.resetTokenExpiryMinutes} minutes.
        If you did not request this, please ignore this email.
      `
    });

    return true;
  }

  async resetPassword(resetToken, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const user = await this.userRepository.findByResetToken(hashedToken);

    if (!user) {
      const error = new Error('Invalid or expired reset token');
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(user._id, { password: hashedPassword });
    await this.userRepository.clearResetToken(user._id);

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
