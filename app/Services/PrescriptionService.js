const PrescriptionRepository = require('../Repositories/PrescriptionRepository');
const PatientRepository = require('../Repositories/PatientRepository');
const UserRepository = require('../Repositories/UserRepository');
const AppointmentRepository = require('../Repositories/AppointmentRepository');
const PharmacyRepository = require('../Repositories/PharmacyRepository');
const Role = require('../Models/Role');

class PrescriptionService {
  constructor(prescriptionRepository) {
    this.prescriptionRepository = prescriptionRepository;
    this.patientRepository = new PatientRepository();
    this.userRepository = new UserRepository();
    this.appointmentRepository = new AppointmentRepository();
    this.pharmacyRepository = new PharmacyRepository();
  }

  async createPrescription(payload, userId) {
    const patient = await this.patientRepository.findById(payload.patientId);
    if (!patient) {
      const error = new Error('Patient not found');
      error.statusCode = 404;
      throw error;
    }

    if (patient.isDeleted) {
      const error = new Error('Patient is deleted');
      error.statusCode = 400;
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

    if (payload.appointmentId) {
      const appointment = await this.appointmentRepository.findById(payload.appointmentId);
      if (!appointment) {
        const error = new Error('Appointment not found');
        error.statusCode = 404;
        throw error;
      }
    }

    const prescriptionData = {
      patientId: payload.patientId,
      doctorId: payload.doctorId,
      appointmentId: payload.appointmentId || undefined,
      medications: payload.medications.map(med => ({
        name: med.name.trim(),
        dosage: med.dosage.trim(),
        frequency: med.frequency.trim(),
        duration: med.duration.trim(),
        notes: med.notes ? med.notes.trim() : undefined
      })),
      notes: payload.notes ? payload.notes.trim() : undefined,
      issuedAt: new Date(),
      createdBy: userId,
      isDeleted: false
    };

    const prescription = await this.prescriptionRepository.create(prescriptionData);
    return prescription;
  }

  async getPrescriptions(query) {
    const {
      page = 1,
      limit = 10,
      search = '',
      patientId,
      doctorId,
      from,
      to
    } = query;

    const result = await this.prescriptionRepository.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      search: search.trim(),
      patientId,
      doctorId,
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

  async getPrescriptionById(id) {
    const prescription = await this.prescriptionRepository.findById(id);
    if (!prescription || prescription.isDeleted) {
      const error = new Error('Prescription not found');
      error.statusCode = 404;
      throw error;
    }
    return prescription;
  }

  async updatePrescription(id, payload, userId) {
    const prescription = await this.prescriptionRepository.findById(id);
    if (!prescription) {
      const error = new Error('Prescription not found');
      error.statusCode = 404;
      throw error;
    }

    if (prescription.isDeleted) {
      const error = new Error('Prescription is deleted');
      error.statusCode = 400;
      throw error;
    }

    if (payload.patientId) {
      const patient = await this.patientRepository.findById(payload.patientId);
      if (!patient || patient.isDeleted) {
        const error = new Error('Patient not found');
        error.statusCode = 404;
        throw error;
      }
    }

    if (payload.doctorId) {
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
    }

    if (payload.appointmentId) {
      const appointment = await this.appointmentRepository.findById(payload.appointmentId);
      if (!appointment) {
        const error = new Error('Appointment not found');
        error.statusCode = 404;
        throw error;
      }
    }

    const updateData = { ...payload };

    if (updateData.medications) {
      updateData.medications = updateData.medications.map(med => ({
        name: med.name.trim(),
        dosage: med.dosage.trim(),
        frequency: med.frequency.trim(),
        duration: med.duration.trim(),
        notes: med.notes ? med.notes.trim() : undefined
      }));
    }

    if (updateData.notes !== undefined) {
      updateData.notes = updateData.notes ? updateData.notes.trim() : undefined;
    }

    updateData.updatedBy = userId;

    const updatedPrescription = await this.prescriptionRepository.update(id, updateData);
    if (!updatedPrescription) {
      const error = new Error('Prescription not found');
      error.statusCode = 404;
      throw error;
    }

    return updatedPrescription;
  }

  async deletePrescription(id, userId, userRole) {
    const prescription = await this.prescriptionRepository.findById(id);
    if (!prescription || prescription.isDeleted) {
      const error = new Error('Prescription not found');
      error.statusCode = 404;
      throw error;
    }

    const adminRole = await Role.findOne({ name: 'admin' });
    const isAdmin = adminRole && userRole && userRole.toString() === adminRole._id.toString();
    
    // Handle both populated and non-populated doctorId
    let doctorIdValue;
    if (prescription.doctorId && prescription.doctorId._id) {
      // Populated (object with _id)
      doctorIdValue = prescription.doctorId._id.toString();
    } else if (prescription.doctorId) {
      // Non-populated (ObjectId)
      doctorIdValue = prescription.doctorId.toString();
    } else {
      doctorIdValue = null;
    }
    
    const isDoctorOwner = doctorIdValue && doctorIdValue === userId.toString();

    if (!isAdmin && !isDoctorOwner) {
      const error = new Error('You can only delete your own prescriptions');
      error.statusCode = 403;
      throw error;
    }

    await this.prescriptionRepository.delete(id, userId);
    return true;
  }

  async assignPharmacy(id, pharmacyId) {
    const prescription = await this.prescriptionRepository.findById(id);
    if (!prescription || prescription.isDeleted) {
      const error = new Error('Prescription not found');
      error.statusCode = 404;
      throw error;
    }

    const pharmacy = await this.pharmacyRepository.findById(pharmacyId);
    if (!pharmacy || pharmacy.isDeleted) {
      const error = new Error('Pharmacy not found');
      error.statusCode = 404;
      throw error;
    }

    if (pharmacy.status !== 'active') {
      const error = new Error('Pharmacy is not active');
      error.statusCode = 400;
      throw error;
    }

    const assignedPrescription = await this.prescriptionRepository.assignPharmacy(id, pharmacyId);
    if (!assignedPrescription) {
      const error = new Error('Prescription not found');
      error.statusCode = 404;
      throw error;
    }

    return assignedPrescription;
  }

  async markPrescriptionReady(id, notes) {
    const prescription = await this.prescriptionRepository.findById(id);
    if (!prescription || prescription.isDeleted) {
      const error = new Error('Prescription not found');
      error.statusCode = 404;
      throw error;
    }

    if (!prescription.pharmacyId) {
      const error = new Error('Prescription must be assigned to a pharmacy first');
      error.statusCode = 400;
      throw error;
    }

    const statusData = {
      status: 'ready',
      notes: notes || undefined
    };

    const updatedPrescription = await this.prescriptionRepository.updateDispensationStatus(id, statusData);
    if (!updatedPrescription) {
      const error = new Error('Prescription not found');
      error.statusCode = 404;
      throw error;
    }

    return updatedPrescription;
  }

  async markPrescriptionUnavailable(id, notes) {
    const prescription = await this.prescriptionRepository.findById(id);
    if (!prescription || prescription.isDeleted) {
      const error = new Error('Prescription not found');
      error.statusCode = 404;
      throw error;
    }

    if (!prescription.pharmacyId) {
      const error = new Error('Prescription must be assigned to a pharmacy first');
      error.statusCode = 400;
      throw error;
    }

    const statusData = {
      status: 'unavailable',
      notes: notes || undefined
    };

    const updatedPrescription = await this.prescriptionRepository.updateDispensationStatus(id, statusData);
    if (!updatedPrescription) {
      const error = new Error('Prescription not found');
      error.statusCode = 404;
      throw error;
    }

    return updatedPrescription;
  }

  async markPrescriptionDispensed(id, pharmacistId, notes) {
    const prescription = await this.prescriptionRepository.findById(id);
    if (!prescription || prescription.isDeleted) {
      const error = new Error('Prescription not found');
      error.statusCode = 404;
      throw error;
    }

    if (!prescription.pharmacyId) {
      const error = new Error('Prescription must be assigned to a pharmacy first');
      error.statusCode = 400;
      throw error;
    }

    if (pharmacistId) {
      const pharmacist = await this.userRepository.findByIdWithPassword(pharmacistId);
      if (!pharmacist) {
        const error = new Error('Pharmacist not found');
        error.statusCode = 404;
        throw error;
      }

      const pharmacistRole = await Role.findOne({ name: 'pharmacist' });
      if (!pharmacistRole || pharmacist.role.toString() !== pharmacistRole._id.toString()) {
        const error = new Error('User is not a pharmacist');
        error.statusCode = 400;
        throw error;
      }
    }

    const statusData = {
      status: 'dispensed',
      pharmacistId: pharmacistId || undefined,
      notes: notes || undefined
    };

    const updatedPrescription = await this.prescriptionRepository.updateDispensationStatus(id, statusData);
    if (!updatedPrescription) {
      const error = new Error('Prescription not found');
      error.statusCode = 404;
      throw error;
    }

    return updatedPrescription;
  }
}

module.exports = PrescriptionService;
