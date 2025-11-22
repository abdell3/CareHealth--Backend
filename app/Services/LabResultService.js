const LabResultRepository = require('../Repositories/LabResultRepository');
const LabOrderRepository = require('../Repositories/LabOrderRepository');
const UserRepository = require('../Repositories/UserRepository');

class LabResultService {
  constructor(labResultRepository) {
    this.labResultRepository = labResultRepository;
    this.labOrderRepository = new LabOrderRepository();
    this.userRepository = new UserRepository();
  }

  async uploadResult(payload, userId) {
    const labOrder = await this.labOrderRepository.findById(payload.labOrderId);
    if (!labOrder || labOrder.isDeleted) {
      const error = new Error('Lab order not found');
      error.statusCode = 404;
      throw error;
    }

    const uploader = await this.userRepository.findByIdWithPassword(userId);
    if (!uploader) {
      const error = new Error('Uploader not found');
      error.statusCode = 404;
      throw error;
    }

    if (!payload.fileUrl || !payload.fileUrl.trim()) {
      const error = new Error('File URL is required');
      error.statusCode = 400;
      throw error;
    }

    const fileUrl = payload.fileUrl.trim();
    const allowedExtensions = ['.pdf', '.csv'];
    const hasValidExtension = allowedExtensions.some(ext => 
      fileUrl.toLowerCase().endsWith(ext.toLowerCase())
    );

    if (!hasValidExtension) {
      const error = new Error('File must be PDF or CSV');
      error.statusCode = 400;
      throw error;
    }

    const resultData = {
      labOrderId: payload.labOrderId,
      fileUrl: fileUrl,
      uploaderId: userId,
      uploadedAt: new Date(),
      notes: payload.notes ? payload.notes.trim() : undefined,
      createdBy: userId,
      isDeleted: false
    };

    const labResult = await this.labResultRepository.create(resultData);

    if (labOrder.status === 'ordered') {
      await this.labOrderRepository.updateStatus(payload.labOrderId, 'received', userId);
    }

    return labResult;
  }

  async getResults(query) {
    const {
      page = 1,
      limit = 10,
      search = '',
      labOrderId,
      patientId,
      consultationId
    } = query;

    const result = await this.labResultRepository.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      search: search.trim(),
      labOrderId,
      patientId,
      consultationId
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

  async getResultsByOrder(labOrderId) {
    const labOrder = await this.labOrderRepository.findById(labOrderId);
    if (!labOrder || labOrder.isDeleted) {
      const error = new Error('Lab order not found');
      error.statusCode = 404;
      throw error;
    }

    const results = await this.labResultRepository.findByLabOrderId(labOrderId);
    return results;
  }

  async getResultById(id) {
    const labResult = await this.labResultRepository.findById(id);
    if (!labResult || labResult.isDeleted) {
      const error = new Error('Lab result not found');
      error.statusCode = 404;
      throw error;
    }
    return labResult;
  }

  async validateResult(id, userId) {
    const labResult = await this.labResultRepository.findById(id);
    if (!labResult || labResult.isDeleted) {
      const error = new Error('Lab result not found');
      error.statusCode = 404;
      throw error;
    }

    const validatedResult = await this.labResultRepository.validate(id, userId);
    
    if (validatedResult.labOrderId && validatedResult.labOrderId._id) {
      const labOrderId = validatedResult.labOrderId._id.toString();
      await this.labOrderRepository.updateStatus(labOrderId, 'validated', userId);
    }

    return validatedResult;
  }

  async updateResult(id, payload, userId) {
    const labResult = await this.labResultRepository.findById(id);
    if (!labResult || labResult.isDeleted) {
      const error = new Error('Lab result not found');
      error.statusCode = 404;
      throw error;
    }

    const updateData = { ...payload };

    if (updateData.fileUrl) {
      const fileUrl = updateData.fileUrl.trim();
      const allowedExtensions = ['.pdf', '.csv'];
      const hasValidExtension = allowedExtensions.some(ext => 
        fileUrl.toLowerCase().endsWith(ext.toLowerCase())
      );

      if (!hasValidExtension) {
        const error = new Error('File must be PDF or CSV');
        error.statusCode = 400;
        throw error;
      }

      updateData.fileUrl = fileUrl;
    }

    if (updateData.notes !== undefined) {
      updateData.notes = updateData.notes ? updateData.notes.trim() : undefined;
    }

    updateData.updatedBy = userId;

    const updatedResult = await this.labResultRepository.update(id, updateData);
    if (!updatedResult) {
      const error = new Error('Lab result not found');
      error.statusCode = 404;
      throw error;
    }

    return updatedResult;
  }

  async deleteResult(id, userId) {
    const labResult = await this.labResultRepository.findById(id);
    if (!labResult || labResult.isDeleted) {
      const error = new Error('Lab result not found');
      error.statusCode = 404;
      throw error;
    }

    await this.labResultRepository.delete(id, userId);
    return true;
  }
}

module.exports = LabResultService;
