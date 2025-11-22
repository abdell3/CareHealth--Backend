class PatientService {
  constructor(patientRepository) {
    this.patientRepository = patientRepository;
  }

  async createPatient(payload, userId) {
    if (payload.email) {
      const existingByEmail = await this.patientRepository.existsByEmail(payload.email);
      if (existingByEmail) {
        const error = new Error('Patient with this email already exists');
        error.statusCode = 409;
        throw error;
      }
    }

    const patientData = {
      ...payload,
      email: payload.email ? payload.email.toLowerCase().trim() : undefined,
      phone: payload.phone.trim(),
      createdBy: userId,
      isDeleted: false
    };

    const patient = await this.patientRepository.create(patientData);
    const patientObj = patient.toObject();
    delete patientObj.isDeleted;
    return patientObj;
  }

  async getPatients(query) {
    const { page = 1, limit = 10, search = '', gender, city, isDeleted } = query;

    const result = await this.patientRepository.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      search: search.trim(),
      gender,
      city,
      isDeleted: isDeleted !== undefined ? isDeleted === 'true' || isDeleted === true : undefined
    });

    return result;
  }

  async getPatientById(id) {
    const patient = await this.patientRepository.findById(id);
    if (!patient || patient.isDeleted) {
      const error = new Error('Patient not found');
      error.statusCode = 404;
      throw error;
    }
    const patientObj = patient.toObject();
    delete patientObj.isDeleted;
    return patientObj;
  }

  async updatePatient(id, payload, userId) {
    const patient = await this.patientRepository.findById(id);
    if (!patient) {
      const error = new Error('Patient not found');
      error.statusCode = 404;
      throw error;
    }

    if (patient.isDeleted) {
      const error = new Error('Cannot update a deleted patient');
      error.statusCode = 400;
      throw error;
    }

    if (payload.email && payload.email !== patient.email) {
      const existingByEmail = await this.patientRepository.existsByEmail(payload.email);
      if (existingByEmail) {
        const error = new Error('Patient with this email already exists');
        error.statusCode = 409;
        throw error;
      }
      payload.email = payload.email.toLowerCase().trim();
    }

    payload.updatedBy = userId;

    const updatedPatient = await this.patientRepository.update(id, payload);
    if (!updatedPatient) {
      const error = new Error('Patient not found');
      error.statusCode = 404;
      throw error;
    }

    const patientObj = updatedPatient.toObject();
    delete patientObj.isDeleted;
    return patientObj;
  }

  async deletePatient(id, userId) {
    const patient = await this.patientRepository.findById(id);
    if (!patient) {
      const error = new Error('Patient not found');
      error.statusCode = 404;
      throw error;
    }

    if (patient.isDeleted) {
      const error = new Error('Patient already deleted');
      error.statusCode = 400;
      throw error;
    }

    await this.patientRepository.delete(id, userId);
    return true;
  }
}

module.exports = PatientService;
