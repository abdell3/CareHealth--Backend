const Patient = require('../Models/Patient');

class PatientRepository {
  async create(data) {
    const patient = new Patient(data);
    return await patient.save();
  }

  async findAll({ page = 1, limit = 10, search = '' }) {
    const skip = (page - 1) * limit;
    const filter = {};

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const [items, total] = await Promise.all([
      Patient.find(filter)
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Patient.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  async findById(id) {
    return await Patient.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  async update(id, data) {
    return await Patient.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  async delete(id) {
    return await Patient.findByIdAndDelete(id);
  }

  async findByEmail(email) {
    return await Patient.findOne({ email: email.toLowerCase().trim() });
  }

  async findByPhone(phone) {
    return await Patient.findOne({ phone: phone.trim() });
  }
}

module.exports = PatientRepository;
