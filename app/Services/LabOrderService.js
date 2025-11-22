const LabOrderRepository = require('../Repositories/LabOrderRepository');
const PatientRepository = require('../Repositories/PatientRepository');
const UserRepository = require('../Repositories/UserRepository');
const Role = require('../Models/Role');

class LabOrderService {
  constructor(labOrderRepository) {
    this.labOrderRepository = labOrderRepository;
    this.patientRepository = new PatientRepository();
    this.userRepository = new UserRepository();
  }

  async createOrder(payload, userId) {
    const patient = await this.patientRepository.findById(payload.patientId);
    if (!patient) {
      const error = new Error('Patient not found');
      error.statusCode = 404;
      throw error;
    }

    if (patient.isDeleted) {
      const error = new Error('Patient is deleted');
      error.statusCode = 400;
      throw error;
    }

    const doctor = await this.userRepository.findByIdWithPassword(payload.doctorId);
    if (!doctor) {
      const error = new Error('Doctor not found');
      error.statusCode = 404;
      throw error;
    }

    const doctorRole = await Role.findOne({ name: 'doctor' });
    if (!doctorRole || doctor.role.toString() !== doctorRole._id.toString()) {
      const error = new Error('User is not a doctor');
      error.statusCode = 400;
      throw error;
    }

    const orderData = {
      patientId: payload.patientId,
      doctorId: payload.doctorId,
      consultationId: payload.consultationId || undefined,
      tests: payload.tests.map(test => test.trim()),
      status: payload.status || 'ordered',
      createdBy: userId,
      isDeleted: false
    };

    const labOrder = await this.labOrderRepository.create(orderData);
    return labOrder;
  }

  async getOrders(query) {
    const {
      page = 1,
      limit = 10,
      search = '',
      patientId,
      doctorId,
      consultationId,
      status
    } = query;

    const result = await this.labOrderRepository.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      search: search.trim(),
      patientId,
      doctorId,
      consultationId,
      status
    });

    return {
      data: result.docs,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      }
    };
  }

  async getOrderById(id) {
    const labOrder = await this.labOrderRepository.findById(id);
    if (!labOrder || labOrder.isDeleted) {
      const error = new Error('Lab order not found');
      error.statusCode = 404;
      throw error;
    }
    return labOrder;
  }

  async updateOrderStatus(id, status, userId) {
    const labOrder = await this.labOrderRepository.findById(id);
    if (!labOrder || labOrder.isDeleted) {
      const error = new Error('Lab order not found');
      error.statusCode = 404;
      throw error;
    }

    const validStatuses = ['ordered', 'received', 'validated'];
    if (!validStatuses.includes(status)) {
      const error = new Error('Invalid status');
      error.statusCode = 400;
      throw error;
    }

    const updatedOrder = await this.labOrderRepository.updateStatus(id, status, userId);
    if (!updatedOrder) {
      const error = new Error('Lab order not found');
      error.statusCode = 404;
      throw error;
    }

    return updatedOrder;
  }

  async updateOrder(id, payload, userId) {
    const labOrder = await this.labOrderRepository.findById(id);
    if (!labOrder || labOrder.isDeleted) {
      const error = new Error('Lab order not found');
      error.statusCode = 404;
      throw error;
    }

    const updateData = { ...payload };

    if (updateData.tests) {
      updateData.tests = updateData.tests.map(test => test.trim());
    }

    updateData.updatedBy = userId;

    const updatedOrder = await this.labOrderRepository.update(id, updateData);
    if (!updatedOrder) {
      const error = new Error('Lab order not found');
      error.statusCode = 404;
      throw error;
    }

    return updatedOrder;
  }

  async deleteOrder(id, userId) {
    const labOrder = await this.labOrderRepository.findById(id);
    if (!labOrder || labOrder.isDeleted) {
      const error = new Error('Lab order not found');
      error.statusCode = 404;
      throw error;
    }

    await this.labOrderRepository.delete(id, userId);
    return true;
  }
}

module.exports = LabOrderService;
