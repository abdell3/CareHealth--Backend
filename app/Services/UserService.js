const bcrypt = require('bcrypt');
const Role = require('../Models/Role');

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
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

  async changeRole(id, newRoleId) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const roleExists = await Role.findById(newRoleId);
    if (!roleExists) {
      const error = new Error('Invalid role');
      error.statusCode = 400;
      throw error;
    }

    const updatedUser = await this.userRepository.changeRole(id, newRoleId);
    if (!updatedUser) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return updatedUser;
  }

  async suspendUser(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('User is already suspended');
      error.statusCode = 400;
      throw error;
    }

    const suspendedUser = await this.userRepository.suspendUser(id);
    if (!suspendedUser) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return suspendedUser;
  }

  async reactivateUser(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (user.isActive) {
      const error = new Error('User is already active');
      error.statusCode = 400;
      throw error;
    }

    const reactivatedUser = await this.userRepository.reactivateUser(id);
    if (!reactivatedUser) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return reactivatedUser;
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
