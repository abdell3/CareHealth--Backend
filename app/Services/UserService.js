const bcrypt = require('bcrypt');
const Role = require('../Models/Role');
const EmailService = require('./EmailService');

const ALLOWED_ROLES = ['admin', 'doctor', 'nurse', 'receptionist', 'patient'];

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
    this.emailService = new EmailService();
  }

  async createUser(data) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      const error = new Error('Email already registered');
      error.statusCode = 409;
      throw error;
    }

    const roleExists = await Role.findById(data.role);
    if (!roleExists) {
      const error = new Error('Invalid role');
      error.statusCode = 400;
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
    delete userObject.passwordResetToken;

    return userObject;
  }

  async getUsers({ search, role, page, limit }) {
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search: search || '',
      role: role || null
    };

    const result = await this.userRepository.findAll({}, options);

    return {
      items: result.items,
      pagination: result.pagination
    };
  }

  async getUserById(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  async updateUser(id, data) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (data.email) {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser && existingUser._id.toString() !== id) {
        const error = new Error('Email already registered');
        error.statusCode = 409;
        throw error;
      }
      data.email = data.email.toLowerCase().trim();
    }

    if (data.role) {
      delete data.role;
    }

    const updatedUser = await this.userRepository.update(id, data);
    if (!updatedUser) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return updatedUser;
  }

  async updateUserRole(id, roleName, adminId) {
    if (!ALLOWED_ROLES.includes(roleName.toLowerCase())) {
      const error = new Error('Invalid role');
      error.statusCode = 400;
      throw error;
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const role = await Role.findOne({ name: roleName.toLowerCase() });
    if (!role) {
      const error = new Error('Role not found');
      error.statusCode = 404;
      throw error;
    }

    const updatedUser = await this.userRepository.updateRole(id, role._id);
    if (!updatedUser) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return updatedUser;
  }

  async suspendUser(id, adminId) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (user._id.toString() === adminId) {
      const error = new Error('You cannot suspend yourself');
      error.statusCode = 403;
      throw error;
    }

    if (user.isSuspended) {
      const error = new Error('User is already suspended');
      error.statusCode = 400;
      throw error;
    }

    const suspendedUser = await this.userRepository.suspendUser(id, adminId);
    if (!suspendedUser) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    try {
      await this.emailService.sendAccountSuspendedEmail(user.email, user.firstName);
    } catch (error) {
      const logger = require('winston') || console;
      if (logger.error) {
        logger.error('Failed to send account suspended email:', {
          email: user.email,
          userId: id,
          error: error.message
        });
      } else {
        console.error('Failed to send suspension email:', error);
      }
    }

    return suspendedUser;
  }

  async activateUser(id, adminId) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (!user.isSuspended && user.isActive) {
      const error = new Error('User is already active');
      error.statusCode = 400;
      throw error;
    }

    const activatedUser = await this.userRepository.activateUser(id, adminId);
    if (!activatedUser) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    try {
      await this.emailService.sendAccountActivatedEmail(user.email, user.firstName);
    } catch (error) {
      const logger = require('winston') || console;
      if (logger.error) {
        logger.error('Failed to send account activated email:', {
          email: user.email,
          userId: id,
          error: error.message
        });
      } else {
        console.error('Failed to send activation email:', error);
      }
    }

    return activatedUser;
  }

  async deleteUser(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    await this.userRepository.delete(id);
    return true;
  }
}

module.exports = UserService;
