const express = require('express');
const router = express.Router();
const PatientController = require('../app/Http/Controllers/PatientController');
const AuthMiddleware = require('../app/Http/Middlewares/AuthMiddleware');
const Role = require('../app/Models/Role');

const controller = new PatientController();

const getAllowedRolesForPatients = async (req, res, next) => {
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

const requireAdminForDelete = async (req, res, next) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Authentication required'
      });
    }

    const adminRole = await Role.findOne({ name: 'admin' });

    if (!adminRole) {
      return res.status(500).json({
        success: false,
        message: 'Admin role not found in database'
      });
    }

    const userRoleId = req.user.role.toString();
    const adminRoleId = adminRole._id.toString();

    if (userRoleId === adminRoleId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied: Admin privileges required for deletion'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

router.post('/', AuthMiddleware.verifyAuth, getAllowedRolesForPatients, controller.createPatient.bind(controller));
router.get('/', AuthMiddleware.verifyAuth, getAllowedRolesForPatients, controller.getPatients.bind(controller));
router.get('/:id', AuthMiddleware.verifyAuth, getAllowedRolesForPatients, controller.getPatient.bind(controller));
router.put('/:id', AuthMiddleware.verifyAuth, getAllowedRolesForPatients, controller.updatePatient.bind(controller));
router.delete('/:id', AuthMiddleware.verifyAuth, requireAdminForDelete, controller.deletePatient.bind(controller));

module.exports = router;
