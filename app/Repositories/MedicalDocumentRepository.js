const MedicalDocument = require('../Models/MedicalDocument');

class MedicalDocumentRepository {
  async create(data) {
    const document = new MedicalDocument(data);
    return await document.save();
  }

  async findById(id) {
    return await MedicalDocument.findById(id)
      .populate('patientId', 'firstName lastName email phone')
      .populate('consultationId')
      .populate('labOrderId')
      .populate('uploaderId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  async findAll({ search = '', patientId, consultationId, labOrderId, category, fileType, tags, from, to, page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    const filter = {
      isDeleted: false
    };

    if (patientId) {
      filter.patientId = patientId;
    }

    if (consultationId) {
      filter.consultationId = consultationId;
    }

    if (labOrderId) {
      filter.labOrderId = labOrderId;
    }

    if (category) {
      filter.category = category;
    }

    if (fileType) {
      filter.fileType = fileType;
    }

    if (tags) {
      filter.tags = { $in: [tags] };
    }

    if (from || to) {
      filter.uploadedAt = {};
      if (from) {
        filter.uploadedAt.$gte = new Date(from);
      }
      if (to) {
        filter.uploadedAt.$lte = new Date(to);
      }
    }

    if (search) {
      filter.$or = [
        { fileName: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const [docs, total] = await Promise.all([
      MedicalDocument.find(filter)
        .populate('patientId', 'firstName lastName email phone')
        .populate('consultationId')
        .populate('labOrderId')
        .populate('uploaderId', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email')
        .skip(skip)
        .limit(limit)
        .sort({ uploadedAt: -1 }),
      MedicalDocument.countDocuments(filter)
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
    return await MedicalDocument.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    )
      .populate('patientId', 'firstName lastName email phone')
      .populate('consultationId')
      .populate('labOrderId')
      .populate('uploaderId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  async delete(id, userId) {
    return await MedicalDocument.findByIdAndUpdate(
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

module.exports = MedicalDocumentRepository;
