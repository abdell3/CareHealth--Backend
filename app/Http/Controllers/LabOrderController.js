const LabOrderService = require('../../Services/LabOrderService');
const LabOrderRepository = require('../../Repositories/LabOrderRepository');
const {
  createLabOrderSchema,
  updateLabOrderSchema,
  updateLabOrderStatusSchema,
  queryLabOrdersSchema,
  labOrderIdParamSchema
} = require('../Validators/labOrder.validators');

class LabOrderController {
  constructor() {
    const labOrderRepository = new LabOrderRepository();
    this.labOrderService = new LabOrderService(labOrderRepository);
  }

  async createOrder(req, res) {
    try {
      const { error, value } = createLabOrderSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const labOrder = await this.labOrderService.createOrder(value, req.user.id);

      return res.status(201).json({
        success: true,
        message: 'Lab order created successfully',
        data: { labOrder }
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

  async getOrders(req, res) {
    try {
      const { error, value } = queryLabOrdersSchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const result = await this.labOrderService.getOrders(value);

      return res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }

  async getOrder(req, res) {
    try {
      const { error: paramError } = labOrderIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid lab order ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      const labOrder = await this.labOrderService.getOrderById(req.params.id);

      return res.status(200).json({
        success: true,
        data: { labOrder }
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

  async updateOrderStatus(req, res) {
    try {
      const { error: paramError } = labOrderIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid lab order ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      const { error, value } = updateLabOrderStatusSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const labOrder = await this.labOrderService.updateOrderStatus(
        req.params.id,
        value.status,
        req.user.id
      );

      return res.status(200).json({
        success: true,
        message: 'Lab order status updated successfully',
        data: { labOrder }
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

  async updateOrder(req, res) {
    try {
      const { error: paramError } = labOrderIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid lab order ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      const { error, value } = updateLabOrderSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const labOrder = await this.labOrderService.updateOrder(
        req.params.id,
        value,
        req.user.id
      );

      return res.status(200).json({
        success: true,
        message: 'Lab order updated successfully',
        data: { labOrder }
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

  async deleteOrder(req, res) {
    try {
      const { error: paramError } = labOrderIdParamSchema.validate({ id: req.params.id });
      if (paramError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid lab order ID format',
          errors: paramError.details.map(detail => detail.message)
        });
      }

      await this.labOrderService.deleteOrder(req.params.id, req.user.id);

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

module.exports = LabOrderController;

