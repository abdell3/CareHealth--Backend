const Patient = require('../Models/Patient');

class PatientRepository {
  async create(data) {
    const patient = new Patient(data);
    return await patient.save();
  }

  async findAll({ page = 1, limit = 10, search = '', gender, city, isDeleted }) {
    const skip = (page - 1) * limit;
    const filter = {};

    if (isDeleted !== undefined) {
      filter.isDeleted = isDeleted;
    } else {
      filter.isDeleted = false;
    }

    if (gender) {
      filter.gender = gender.toLowerCase();
    }

    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }

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
        .select('-__v')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Patient.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    const sanitizedItems = items.map(item => {
      const itemObj = item.toObject();
      if (!filter.isDeleted) {
        delete itemObj.isDeleted;
      }
      return itemObj;
    });

    return {
      items: sanitizedItems,
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
      .select('-__v')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  async update(id, data) {
    return await Patient.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    )
      .select('-__v')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  async delete(id, userId) {
    return await Patient.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true, updatedBy: userId } },
      { new: true, runValidators: true }
    );
  }

  async existsByEmail(email) {
    if (!email) {
      return null;
    }
    return await Patient.findOne({ 
      email: email.toLowerCase().trim(),
      isDeleted: false
    });
  }

  async findByEmail(email) {
    if (!email) {
      return null;
    }
    return await Patient.findOne({ 
      email: email.toLowerCase().trim(),
      isDeleted: false
    });
  }

  async findByPhone(phone) {
    return await Patient.findOne({ 
      phone: phone.trim(),
      isDeleted: false
    });
  }
}

module.exports = PatientRepository;
