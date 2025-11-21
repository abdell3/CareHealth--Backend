const AuthService = require('../../Services/AuthService');
const UserRepository = require('../../Repositories/UserRepository');
const {
  registerSchema,
  loginSchema,
  refreshSchema,
  changePasswordSchema,
  requestPasswordResetSchema,
  resetPasswordSchema
} = require('../Validators/auth.validators');

class AuthController {
  constructor() {
    const userRepository = new UserRepository();
    this.authService = new AuthService(userRepository);
  }

  async register(req, res) {
    try {
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const user = await this.authService.register(value);

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user }
      });
    } catch (err) {
      if (err.statusCode === 409) {
        return res.status(409).json({
          success: false,
          message: err.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }

  async login(req, res) {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const result = await this.authService.login(value.email, value.password);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (err) {
      if (err.statusCode === 401 || err.statusCode === 403) {
        return res.status(err.statusCode).json({
          success: false,
          message: err.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }

  async refresh(req, res) {
    try {
      const { error, value } = refreshSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const result = await this.authService.refreshToken(value.refreshToken);

      return res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result
      });
    } catch (err) {
      if (err.statusCode === 401) {
        return res.status(401).json({
          success: false,
          message: err.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }

  async logout(req, res) {
    try {
      await this.authService.logout(req.user.id);

      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }

  async changePassword(req, res) {
    try {
      const { error, value } = changePasswordSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      await this.authService.changePassword(
        req.user.id,
        value.oldPassword,
        value.newPassword
      );

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (err) {
      if (err.statusCode === 400 || err.statusCode === 404) {
        return res.status(err.statusCode).json({
          success: false,
          message: err.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }

  async requestPasswordReset(req, res) {
    try {
      const { error, value } = requestPasswordResetSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      await this.authService.requestPasswordReset(value.email);

      return res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { error, value } = resetPasswordSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      await this.authService.resetPassword(value.resetToken, value.newPassword);

      return res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (err) {
      if (err.statusCode === 400) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
}

module.exports = AuthController;
