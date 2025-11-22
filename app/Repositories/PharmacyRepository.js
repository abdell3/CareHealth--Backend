const Pharmacy = require('../Models/Pharmacy');

class PharmacyRepository {
  async create(data) {
    const pharmacy = new Pharmacy(data);
    return await pharmacy.save();
  }

  async findById(id) {
    return await Pharmacy.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  async findAll({ search = '', status, page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    const filter = {
      isDeleted: false
    };

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [docs, total] = await Promise.all([
      Pharmacy.find(filter)
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Pharmacy.countDocuments(filter)
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
    return await Pharmacy.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  async delete(id, userId) {
    return await Pharmacy.findByIdAndUpdate(
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

module.exports = PharmacyRepository;
