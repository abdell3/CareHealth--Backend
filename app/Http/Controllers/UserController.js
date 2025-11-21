const UserService = require('../../Services/UserService');
const UserRepository = require('../../Repositories/UserRepository');
const {
  createUserSchema,
  updateUserSchema,
  queryUsersSchema,
  changeRoleSchema,
  suspendUserSchema,
  reactivateUserSchema
} = require('../Validators/user.validators');

class UserController {
  constructor() {
    const userRepository = new UserRepository();
    this.userService = new UserService(userRepository);
  }

  async createUser(req, res) {
    try {
      const { error, value } = createUserSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const user = await this.userService.createUser(value);

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { user }
      });
    } catch (err) {
      if (err.statusCode === 409 || err.statusCode === 400) {
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

  async getUsers(req, res) {
    try {
      const { error, value } = queryUsersSchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const result = await this.userService.getUsers(value);

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }

  async getUser(req, res) {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

      return res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (err) {
      if (err.statusCode === 404) {
        return res.status(404).json({
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

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = updateUserSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      if (value.role !== undefined || value.isActive !== undefined) {
        return res.status(403).json({
          success: false,
          message: 'Role and isActive cannot be updated via this endpoint. Use dedicated endpoints instead.'
        });
      }

      if (req.user.id !== id) {
        const Role = require('../../Models/Role');
        const adminRole = await Role.findOne({ name: 'admin' });
        if (!adminRole || req.user.role.toString() !== adminRole._id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'You can only update your own profile'
          });
        }
      }

      const user = await this.userService.updateUser(id, value);

      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: { user }
      });
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 409) {
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

  async changeRole(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = changeRoleSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      if (req.user.id === id) {
        return res.status(403).json({
          success: false,
          message: 'You cannot change your own role'
        });
      }

      const user = await this.userService.changeRole(id, value.role);

      return res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        data: { user }
      });
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 400) {
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

  async suspendUser(req, res) {
    try {
      const { id } = req.params;
      const { error } = suspendUserSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      if (req.user.id === id) {
        return res.status(403).json({
          success: false,
          message: 'You cannot suspend yourself'
        });
      }

      const user = await this.userService.suspendUser(id);

      return res.status(200).json({
        success: true,
        message: 'User suspended successfully',
        data: { user }
      });
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 400) {
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

  async reactivateUser(req, res) {
    try {
      const { id } = req.params;
      const { error } = reactivateUserSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const user = await this.userService.reactivateUser(id);

      return res.status(200).json({
        success: true,
        message: 'User reactivated successfully',
        data: { user }
      });
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 400) {
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

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      if (req.user.id === id) {
        return res.status(403).json({
          success: false,
          message: 'You cannot delete yourself'
        });
      }

      await this.userService.deleteUser(id);

      return res.status(204).send();
    } catch (err) {
      if (err.statusCode === 404) {
        return res.status(404).json({
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

module.exports = UserController;
