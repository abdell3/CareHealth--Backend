const LabResult = require('../Models/LabResult');

class LabResultRepository {
  async create(data) {
    const labResult = new LabResult(data);
    return await labResult.save();
  }

  async findById(id) {
    return await LabResult.findById(id)
      .populate('labOrderId')
      .populate('uploaderId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  async findAll({ search = '', labOrderId, patientId, consultationId, page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    const filter = {
      isDeleted: false
    };

    if (labOrderId) {
      filter.labOrderId = labOrderId;
    }

    const [docs, total] = await Promise.all([
      LabResult.find(filter)
        .populate({
          path: 'labOrderId',
          populate: {
            path: 'patientId',
            select: 'firstName lastName email phone'
          }
        })
        .populate({
          path: 'labOrderId',
          populate: {
            path: 'doctorId',
            select: 'firstName lastName email'
          }
        })
        .populate({
          path: 'labOrderId',
          populate: {
            path: 'consultationId'
          }
        })
        .populate('uploaderId', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email')
        .skip(skip)
        .limit(limit)
        .sort({ uploadedAt: -1 }),
      LabResult.countDocuments(filter)
    ]);

    let filteredDocs = docs;

    if (patientId) {
      filteredDocs = docs.filter(result => 
        result.labOrderId && 
        result.labOrderId.patientId && 
        result.labOrderId.patientId._id.toString() === patientId
      );
    }

    if (consultationId) {
      filteredDocs = filteredDocs.filter(result =>
        result.labOrderId &&
        result.labOrderId.consultationId &&
        result.labOrderId.consultationId._id.toString() === consultationId
      );
    }

    if (search) {
      filteredDocs = filteredDocs.filter(result =>
        result.notes && result.notes.toLowerCase().includes(search.toLowerCase())
      );
    }

    const totalFiltered = filteredDocs.length;
    const totalPages = Math.ceil(totalFiltered / limit);

    return {
      docs: filteredDocs,
      total: patientId || consultationId || search ? totalFiltered : total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }

  async findByLabOrderId(labOrderId) {
    return await LabResult.find({
      labOrderId: labOrderId,
      isDeleted: false
    })
      .populate('labOrderId')
      .populate('uploaderId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ uploadedAt: -1 });
  }

  async update(id, data) {
    return await LabResult.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    )
      .populate('labOrderId')
      .populate('uploaderId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  async validate(id, userId) {
    return await LabResult.findByIdAndUpdate(
      id,
      {
        $set: {
          validatedAt: new Date(),
          updatedBy: userId
        }
      },
      { new: true, runValidators: true }
    )
      .populate('labOrderId')
      .populate('uploaderId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  async delete(id, userId) {
    return await LabResult.findByIdAndUpdate(
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

module.exports = LabResultRepository;
