const express = require('express');
const router = express.Router();
const PharmacyController = require('../app/Http/Controllers/PharmacyController');
const AuthMiddleware = require('../app/Http/Middlewares/AuthMiddleware');
const Role = require('../app/Models/Role');

const controller = new PharmacyController();

const getAllowedRolesForPharmacy = async (req, res, next) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Authentication required'
      });
    }

    const roles = await Role.find({
      name: { $in: ['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist'] }
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

const getRolesForPharmacyCRUD = async (req, res, next) => {
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

const getRolesForAssignPharmacy = async (req, res, next) => {
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

router.post('/', AuthMiddleware.verifyAuth, getRolesForPharmacyCRUD, controller.createPharmacy.bind(controller));
router.get('/', AuthMiddleware.verifyAuth, getAllowedRolesForPharmacy, controller.getPharmacies.bind(controller));
router.get('/:id', AuthMiddleware.verifyAuth, getAllowedRolesForPharmacy, controller.getPharmacy.bind(controller));
router.put('/:id', AuthMiddleware.verifyAuth, getRolesForPharmacyCRUD, controller.updatePharmacy.bind(controller));
router.delete('/:id', AuthMiddleware.verifyAuth, getRolesForPharmacyCRUD, controller.deletePharmacy.bind(controller));
router.post('/:id/assign', AuthMiddleware.verifyAuth, getRolesForAssignPharmacy, controller.assignPrescription.bind(controller));
router.get('/:id/statistics', AuthMiddleware.verifyAuth, getAllowedRolesForPharmacy, controller.getStatistics.bind(controller));

module.exports = router;
