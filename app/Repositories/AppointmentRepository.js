const Appointment = require('../Models/Appointment');
const Patient = require('../Models/Patient');
const User = require('../Models/User');

class AppointmentRepository {
  async create(data) {
    const appointment = new Appointment(data);
    return await appointment.save();
  }

  async findAll({ page = 1, limit = 10, search = '', doctorId, patientId, status, from, to }) {
    const skip = (page - 1) * limit;
    const filter = {};

    if (doctorId) {
      filter.doctorId = doctorId;
    }

    if (patientId) {
      filter.patientId = patientId;
    }

    if (status) {
      filter.status = status.toLowerCase();
    }

    if (from || to) {
      filter.startAt = {};
      if (from) {
        filter.startAt.$gte = new Date(from);
      }
      if (to) {
        filter.startAt.$lte = new Date(to);
      }
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const searchConditions = [{ reason: searchRegex }];

      const searchPatients = await Patient.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { phone: searchRegex }
        ]
      }).select('_id');
      const patientIds = searchPatients.map(p => p._id);
      if (patientIds.length > 0) {
        searchConditions.push({ patientId: { $in: patientIds } });
      }

      const searchDoctors = await User.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex }
        ]
      }).select('_id');
      const doctorIds = searchDoctors.map(d => d._id);
      if (doctorIds.length > 0) {
        searchConditions.push({ doctorId: { $in: doctorIds } });
      }

      if (searchConditions.length > 1) {
        filter.$or = searchConditions;
      } else if (searchConditions.length === 1) {
        Object.assign(filter, searchConditions[0]);
      }
    }

    const [docs, total] = await Promise.all([
      Appointment.find(filter)
        .populate('patientId', 'firstName lastName email phone')
        .populate('doctorId', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email')
        .skip(skip)
        .limit(limit)
        .sort({ startAt: -1 }),
      Appointment.countDocuments(filter)
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

  async findById(id) {
    return await Appointment.findById(id)
      .populate('patientId', 'firstName lastName email phone')
      .populate('doctorId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  async update(id, data) {
    return await Appointment.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    )
      .populate('patientId', 'firstName lastName email phone')
      .populate('doctorId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
  }

  async delete(id) {
    return await Appointment.findByIdAndDelete(id);
  }

  async findConflicting(doctorId, startAt, endAt, excludeAppointmentId = null) {
    const filter = {
      doctorId,
      status: 'scheduled',
      startAt: { $lt: new Date(endAt) },
      endAt: { $gt: new Date(startAt) }
    };

    if (excludeAppointmentId) {
      filter._id = { $ne: excludeAppointmentId };
    }

    return await Appointment.find(filter);
  }

  async findByDoctorAndDate(doctorId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await Appointment.find({
      doctorId,
      startAt: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: 'scheduled'
    }).sort({ startAt: 1 });
  }
}

module.exports = AppointmentRepository;
