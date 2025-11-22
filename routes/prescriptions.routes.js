const express = require('express');
const router = express.Router();
const PrescriptionController = require('../app/Http/Controllers/PrescriptionController');
const AuthMiddleware = require('../app/Http/Middlewares/AuthMiddleware');
const Role = require('../app/Models/Role');

const controller = new PrescriptionController();

const getAllowedRolesForPrescriptions = async (req, res, next) => {
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

const getRolesForCreateUpdateDelete = async (req, res, next) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Authentication required'
      });
    }

    const roles = await Role.find({
      name: { $in: ['admin', 'doctor'] }
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

const getRolesForDispensation = async (req, res, next) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Authentication required'
      });
    }

    const roles = await Role.find({
      name: { $in: ['admin', 'pharmacist'] }
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

router.post('/', AuthMiddleware.verifyAuth, getRolesForCreateUpdateDelete, controller.createPrescription.bind(controller));
router.get('/', AuthMiddleware.verifyAuth, getAllowedRolesForPrescriptions, controller.getPrescriptions.bind(controller));
router.get('/:id', AuthMiddleware.verifyAuth, getAllowedRolesForPrescriptions, controller.getPrescription.bind(controller));
router.put('/:id', AuthMiddleware.verifyAuth, getRolesForCreateUpdateDelete, controller.updatePrescription.bind(controller));
router.delete('/:id', AuthMiddleware.verifyAuth, getRolesForCreateUpdateDelete, controller.deletePrescription.bind(controller));
router.post('/:id/assign-pharmacy', AuthMiddleware.verifyAuth, getRolesForCreateUpdateDelete, controller.assignPharmacy.bind(controller));
router.post('/:id/mark-ready', AuthMiddleware.verifyAuth, getRolesForDispensation, controller.markReady.bind(controller));
router.post('/:id/mark-unavailable', AuthMiddleware.verifyAuth, getRolesForDispensation, controller.markUnavailable.bind(controller));
router.post('/:id/mark-dispensed', AuthMiddleware.verifyAuth, getRolesForDispensation, controller.markDispensed.bind(controller));

module.exports = router;
