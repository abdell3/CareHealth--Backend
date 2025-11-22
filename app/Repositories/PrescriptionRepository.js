const Prescription = require('../Models/Prescription');

class PrescriptionRepository {
  async create(data) {
    const prescription = new Prescription(data);
    return await prescription.save();
  }

  async findById(id) {
    return await Prescription.findById(id)
      .populate('patientId', 'firstName lastName email phone')
      .populate('doctorId', 'firstName lastName email')
      .populate('appointmentId', 'startAt endAt reason status')
      .populate('pharmacyId', 'name address phone email status')
      .populate('dispensation.pharmacistId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  async findAll({ search = '', patientId, doctorId, from, to, page = 1, limit = 10 }) {
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

    if (from || to) {
      filter.issuedAt = {};
      if (from) {
        filter.issuedAt.$gte = new Date(from);
      }
      if (to) {
        filter.issuedAt.$lte = new Date(to);
      }
    }

    if (search) {
      filter.$or = [
        { 'medications.name': { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const [docs, total] = await Promise.all([
      Prescription.find(filter)
        .populate('patientId', 'firstName lastName email phone')
        .populate('doctorId', 'firstName lastName email')
        .populate('appointmentId', 'startAt endAt reason status')
        .populate('pharmacyId', 'name address phone email status')
        .populate('dispensation.pharmacistId', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email')
        .skip(skip)
        .limit(limit)
        .sort({ issuedAt: -1 }),
      Prescription.countDocuments(filter)
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
    return await Prescription.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    )
      .populate('patientId', 'firstName lastName email phone')
      .populate('doctorId', 'firstName lastName email')
      .populate('appointmentId', 'startAt endAt reason status')
      .populate('pharmacyId', 'name address phone email status')
      .populate('dispensation.pharmacistId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  async assignPharmacy(id, pharmacyId) {
    return await Prescription.findByIdAndUpdate(
      id,
      {
        $set: {
          pharmacyId: pharmacyId,
          'dispensation.status': 'pending'
        }
      },
      { new: true, runValidators: true }
    )
      .populate('patientId', 'firstName lastName email phone')
      .populate('doctorId', 'firstName lastName email')
      .populate('appointmentId', 'startAt endAt reason status')
      .populate('pharmacyId', 'name address phone email status')
      .populate('dispensation.pharmacistId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  async updateDispensationStatus(id, statusData) {
    const updateData = {
      'dispensation.status': statusData.status
    };

    if (statusData.status === 'dispensed') {
      updateData['dispensation.dispensedAt'] = new Date();
      if (statusData.pharmacistId) {
        updateData['dispensation.pharmacistId'] = statusData.pharmacistId;
      }
    }

    if (statusData.notes !== undefined) {
      updateData['dispensation.notes'] = statusData.notes;
    }

    return await Prescription.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('patientId', 'firstName lastName email phone')
      .populate('doctorId', 'firstName lastName email')
      .populate('appointmentId', 'startAt endAt reason status')
      .populate('pharmacyId', 'name address phone email status')
      .populate('dispensation.pharmacistId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  async delete(id, userId) {
    return await Prescription.findByIdAndUpdate(
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

module.exports = PrescriptionRepository;
