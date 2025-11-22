const LabOrder = require('../Models/LabOrder');

class LabOrderRepository {
  async create(data) {
    const labOrder = new LabOrder(data);
    return await labOrder.save();
  }

  async findById(id) {
    return await LabOrder.findById(id)
      .populate('patientId', 'firstName lastName email phone')
      .populate('doctorId', 'firstName lastName email')
      .populate('consultationId')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  async findAll({ search = '', patientId, doctorId, consultationId, status, page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    const filter = {
      isDeleted: false
    };

    if (patientId) {
      filter.patientId = patientId;
    }

    if (doctorId) {
      filter.doctorId = doctorId;
    }

    if (consultationId) {
      filter.consultationId = consultationId;
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { tests: { $regex: search, $options: 'i' } }
      ];
    }

    const [docs, total] = await Promise.all([
      LabOrder.find(filter)
        .populate('patientId', 'firstName lastName email phone')
        .populate('doctorId', 'firstName lastName email')
        .populate('consultationId')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      LabOrder.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      docs,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }

  async update(id, data) {
    return await LabOrder.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    )
      .populate('patientId', 'firstName lastName email phone')
      .populate('doctorId', 'firstName lastName email')
      .populate('consultationId')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  async updateStatus(id, status, userId) {
    const updateData = {
      status: status,
      updatedBy: userId
    };

    if (status === 'validated') {
      updateData.validatedAt = new Date();
    }

    return await LabOrder.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('patientId', 'firstName lastName email phone')
      .populate('doctorId', 'firstName lastName email')
      .populate('consultationId')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  async delete(id, userId) {
    return await LabOrder.findByIdAndUpdate(
      id,
      {
        $set: {
          isDeleted: true,
          updatedBy: userId
        }
      },
      { new: true, runValidators: true }
    );
  }
}

module.exports = LabOrderRepository;
