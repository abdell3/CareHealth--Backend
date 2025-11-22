const express = require('express');
const router = express.Router();
const AppointmentController = require('../app/Http/Controllers/AppointmentController');
const AuthMiddleware = require('../app/Http/Middlewares/AuthMiddleware');
const Role = require('../app/Models/Role');

const controller = new AppointmentController();

const getAllowedRolesForAppointments = async (req, res, next) => {
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

const getRolesForCreateUpdate = async (req, res, next) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Authentication required'
      });
    }

    const roles = await Role.find({
      name: { $in: ['admin', 'doctor', 'receptionist'] }
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

router.post('/', AuthMiddleware.verifyAuth, getRolesForCreateUpdate, controller.createAppointment.bind(controller));
router.get('/', AuthMiddleware.verifyAuth, getAllowedRolesForAppointments, controller.getAppointments.bind(controller));
router.get('/availability', AuthMiddleware.verifyAuth, getAllowedRolesForAppointments, controller.getAvailability.bind(controller));
router.get('/:id', AuthMiddleware.verifyAuth, getAllowedRolesForAppointments, controller.getAppointment.bind(controller));
router.put('/:id', AuthMiddleware.verifyAuth, getRolesForCreateUpdate, controller.updateAppointment.bind(controller));
router.delete('/:id', AuthMiddleware.verifyAuth, AuthMiddleware.requireAdmin(), controller.deleteAppointment.bind(controller));

module.exports = router;
