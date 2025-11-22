const express = require('express');
const router = express.Router();
const UserController = require('../app/Http/Controllers/UserController');
const AuthMiddleware = require('../app/Http/Middlewares/AuthMiddleware');
const Role = require('../app/Models/Role');

const controller = new UserController();

const getAllowedRolesForView = async (req, res, next) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Authentication required'
      });
    }

    const roles = await Role.find({
      name: { $in: ['admin', 'doctor', 'nurse', 'receptionist'] }
    });
    
    if (!roles || roles.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Roles not found in database'
      });
    }

    const allowedRoleIds = roles.map(role => role._id.toString());
    const userRoleId = req.user.role.toString();

    if (allowedRoleIds.includes(userRoleId)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied: Insufficient permissions'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

router.post('/', AuthMiddleware.verifyAuth, AuthMiddleware.requireAdmin(), controller.createUser.bind(controller));
router.get('/', AuthMiddleware.verifyAuth, AuthMiddleware.requireAdmin(), controller.getUsers.bind(controller));
router.get('/:id', AuthMiddleware.verifyAuth, getAllowedRolesForView, controller.getUser.bind(controller));
router.put('/:id', AuthMiddleware.verifyAuth, controller.updateUser.bind(controller));
router.put('/:id/role', AuthMiddleware.verifyAuth, AuthMiddleware.requireAdmin(), controller.updateRole.bind(controller));
router.patch('/:id/role', AuthMiddleware.verifyAuth, AuthMiddleware.requireAdmin(), controller.changeRole.bind(controller));
router.put('/:id/suspend', AuthMiddleware.verifyAuth, AuthMiddleware.requireAdmin(), controller.suspendUser.bind(controller));
router.put('/:id/activate', AuthMiddleware.verifyAuth, AuthMiddleware.requireAdmin(), controller.activateUser.bind(controller));
router.patch('/:id/suspend', AuthMiddleware.verifyAuth, AuthMiddleware.requireAdmin(), controller.suspendUser.bind(controller));
router.patch('/:id/reactivate', AuthMiddleware.verifyAuth, AuthMiddleware.requireAdmin(), controller.reactivateUser.bind(controller));
router.delete('/:id', AuthMiddleware.verifyAuth, AuthMiddleware.requireAdmin(), controller.deleteUser.bind(controller));

module.exports = router;
