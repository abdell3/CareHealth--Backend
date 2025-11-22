const express = require('express');
const router = express.Router();
const LabOrderController = require('../app/Http/Controllers/LabOrderController');
const LabResultController = require('../app/Http/Controllers/LabResultController');
const AuthMiddleware = require('../app/Http/Middlewares/AuthMiddleware');
const Role = require('../app/Models/Role');

const labOrderController = new LabOrderController();
const labResultController = new LabResultController();

const getAllowedRolesForLabOrders = async (req, res, next) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Authentication required'
      });
    }

    const roles = await Role.find({
      name: { $in: ['admin', 'doctor', 'nurse', 'lab_technician'] }
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

const getRolesForCreateLabOrder = async (req, res, next) => {
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

const getRolesForUpdateLabOrderStatus = async (req, res, next) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Authentication required'
      });
    }

    const roles = await Role.find({
      name: { $in: ['admin', 'lab_technician'] }
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

const getRolesForLabResults = async (req, res, next) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Authentication required'
      });
    }

    const roles = await Role.find({
      name: { $in: ['admin', 'doctor', 'patient', 'lab_technician'] }
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

const getRolesForUploadValidateResults = async (req, res, next) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Authentication required'
      });
    }

    const roles = await Role.find({
      name: { $in: ['admin', 'lab_technician'] }
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

const getRolesForAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Authentication required'
      });
    }

    const roles = await Role.find({
      name: { $in: ['admin'] }
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

// Lab Order Routes
router.post('/orders', AuthMiddleware.verifyAuth, getRolesForCreateLabOrder, labOrderController.createOrder.bind(labOrderController));
router.get('/orders', AuthMiddleware.verifyAuth, getAllowedRolesForLabOrders, labOrderController.getOrders.bind(labOrderController));
router.get('/orders/:id', AuthMiddleware.verifyAuth, getAllowedRolesForLabOrders, labOrderController.getOrder.bind(labOrderController));
router.put('/orders/:id/status', AuthMiddleware.verifyAuth, getRolesForUpdateLabOrderStatus, labOrderController.updateOrderStatus.bind(labOrderController));
router.put('/orders/:id', AuthMiddleware.verifyAuth, getRolesForCreateLabOrder, labOrderController.updateOrder.bind(labOrderController));
router.delete('/orders/:id', AuthMiddleware.verifyAuth, getRolesForAdmin, labOrderController.deleteOrder.bind(labOrderController));

// Lab Result Routes
router.post('/results', AuthMiddleware.verifyAuth, getRolesForUploadValidateResults, labResultController.uploadResult.bind(labResultController));
router.get('/results', AuthMiddleware.verifyAuth, getRolesForLabResults, labResultController.getResults.bind(labResultController));
router.get('/results/order/:id', AuthMiddleware.verifyAuth, getRolesForLabResults, labResultController.getResultsByOrder.bind(labResultController));
router.get('/results/:id', AuthMiddleware.verifyAuth, getRolesForLabResults, labResultController.getResult.bind(labResultController));
router.put('/results/:id/validate', AuthMiddleware.verifyAuth, getRolesForUploadValidateResults, labResultController.validateResult.bind(labResultController));
router.put('/results/:id', AuthMiddleware.verifyAuth, getRolesForUploadValidateResults, labResultController.updateResult.bind(labResultController));
router.delete('/results/:id', AuthMiddleware.verifyAuth, getRolesForAdmin, labResultController.deleteResult.bind(labResultController));

module.exports = router;
