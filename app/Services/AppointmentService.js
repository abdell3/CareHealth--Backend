const AppointmentRepository = require('../Repositories/AppointmentRepository');
const PatientRepository = require('../Repositories/PatientRepository');
const UserRepository = require('../Repositories/UserRepository');
const Role = require('../Models/Role');

class AppointmentService {
  constructor(appointmentRepository) {
    this.appointmentRepository = appointmentRepository;
    this.patientRepository = new PatientRepository();
    this.userRepository = new UserRepository();
    this.SLOT_DURATION_MINUTES = 15;
    this.WORKING_HOURS_START = 8;
    this.WORKING_HOURS_END = 18;
  }

  async createAppointment(payload, userId) {
    const patient = await this.patientRepository.findById(payload.patientId);
    if (!patient) {
      const error = new Error('Patient not found');
      error.statusCode = 404;
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

    const startAt = new Date(payload.startAt);
    const endAt = new Date(payload.endAt);

    if (startAt >= endAt) {
      const error = new Error('startAt must be before endAt');
      error.statusCode = 400;
      throw error;
    }

    const now = new Date();
    if (startAt < now) {
      const error = new Error('startAt must be in the future');
      error.statusCode = 400;
      throw error;
    }

    const conflicts = await this.appointmentRepository.findConflicting(
      payload.doctorId,
      payload.startAt,
      payload.endAt
    );

    if (conflicts.length > 0) {
      const error = new Error(`Appointment conflict with existing appointment (id: ${conflicts[0]._id})`);
      error.statusCode = 409;
      error.conflictingAppointmentId = conflicts[0]._id;
      throw error;
    }

    const appointmentData = {
      patientId: payload.patientId,
      doctorId: payload.doctorId,
      startAt: startAt,
      endAt: endAt,
      reason: payload.reason ? payload.reason.trim() : undefined,
      location: payload.location ? payload.location.trim() : undefined,
      status: 'scheduled',
      createdBy: userId
    };

    const appointment = await this.appointmentRepository.create(appointmentData);
    return appointment;
  }

  async getAppointments(query) {
    const {
      page = 1,
      limit = 10,
      search = '',
      doctorId,
      patientId,
      status,
      from,
      to
    } = query;

    const result = await this.appointmentRepository.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      search: search.trim(),
      doctorId,
      patientId,
      status,
      from,
      to
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

  async getAppointmentById(id) {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      const error = new Error('Appointment not found');
      error.statusCode = 404;
      throw error;
    }
    return appointment;
  }

  async updateAppointment(id, payload, userId) {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      const error = new Error('Appointment not found');
      error.statusCode = 404;
      throw error;
    }

    const updateData = { ...payload };
    const doctorId = appointment.doctorId;
    const startAt = payload.startAt ? new Date(payload.startAt) : new Date(appointment.startAt);
    const endAt = payload.endAt ? new Date(payload.endAt) : new Date(appointment.endAt);

    if (payload.startAt || payload.endAt) {
      if (startAt >= endAt) {
        const error = new Error('startAt must be before endAt');
        error.statusCode = 400;
        throw error;
      }

      const conflicts = await this.appointmentRepository.findConflicting(
        doctorId,
        startAt,
        endAt,
        id
      );

      if (conflicts.length > 0) {
        const error = new Error(`Appointment conflict with existing appointment (id: ${conflicts[0]._id})`);
        error.statusCode = 409;
        error.conflictingAppointmentId = conflicts[0]._id;
        throw error;
      }
    }

    if (payload.status) {
      const newStatus = payload.status.toLowerCase();
      const currentStatus = appointment.status.toLowerCase();

      if (currentStatus === 'completed' && newStatus === 'scheduled') {
        const error = new Error('Cannot change status from completed to scheduled');
        error.statusCode = 400;
        throw error;
      }

      if (!['scheduled', 'completed', 'cancelled'].includes(newStatus)) {
        const error = new Error('Invalid status value');
        error.statusCode = 400;
        throw error;
      }

      updateData.status = newStatus;
    }

    if (updateData.startAt) {
      updateData.startAt = new Date(updateData.startAt);
    }
    if (updateData.endAt) {
      updateData.endAt = new Date(updateData.endAt);
    }

    updateData.updatedBy = userId;

    const updatedAppointment = await this.appointmentRepository.update(id, updateData);
    if (!updatedAppointment) {
      const error = new Error('Appointment not found');
      error.statusCode = 404;
      throw error;
    }

    return updatedAppointment;
  }

  async deleteAppointment(id, userId, userRole) {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      const error = new Error('Appointment not found');
      error.statusCode = 404;
      throw error;
    }

    const adminRole = await Role.findOne({ name: 'admin' });
    const isAdmin = adminRole && userRole && userRole.toString() === adminRole._id.toString();
    const isCreator = appointment.createdBy && appointment.createdBy._id.toString() === userId;

    if (!isAdmin && (!isCreator || appointment.status !== 'scheduled')) {
      const error = new Error('Appointment can only be deleted by admin or by creator if status is scheduled');
      error.statusCode = 403;
      throw error;
    }

    await this.appointmentRepository.delete(id);
    return true;
  }

  async getAvailability(doctorId, date) {
    const doctor = await this.userRepository.findById(doctorId);
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

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(this.WORKING_HOURS_START, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(this.WORKING_HOURS_END, 0, 0, 0);

    const existingAppointments = await this.appointmentRepository.findByDoctorAndDate(doctorId, date);

    const availableSlots = [];
    let currentTime = new Date(startOfDay);

    while (currentTime < endOfDay) {
      const slotEnd = new Date(currentTime);
      slotEnd.setMinutes(slotEnd.getMinutes() + this.SLOT_DURATION_MINUTES);

      if (slotEnd > endOfDay) {
        break;
      }

      const isConflict = existingAppointments.some(apt => {
        const aptStart = new Date(apt.startAt);
        const aptEnd = new Date(apt.endAt);
        return (aptStart < slotEnd && aptEnd > currentTime);
      });

      if (!isConflict) {
        availableSlots.push({
          start: new Date(currentTime).toISOString(),
          end: slotEnd.toISOString()
        });
      }

      currentTime.setMinutes(currentTime.getMinutes() + this.SLOT_DURATION_MINUTES);
    }

    return {
      doctorId,
      date: targetDate.toISOString().split('T')[0],
      workingHours: {
        start: `${this.WORKING_HOURS_START.toString().padStart(2, '0')}:00`,
        end: `${this.WORKING_HOURS_END.toString().padStart(2, '0')}:00`
      },
      availableSlots,
      slotDuration: this.SLOT_DURATION_MINUTES
    };
  }
}

module.exports = AppointmentService;
