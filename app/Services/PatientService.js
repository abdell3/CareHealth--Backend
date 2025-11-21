class PatientService {
  constructor(patientRepository) {
    this.patientRepository = patientRepository;
  }

  async createPatient(payload, userId) {
    const existingByEmail = await this.patientRepository.findByEmail(payload.email);
    if (existingByEmail) {
      const error = new Error('Patient with this email already exists');
      error.statusCode = 409;
      throw error;
    }

    const existingByPhone = await this.patientRepository.findByPhone(payload.phone);
    if (existingByPhone) {
      const error = new Error('Patient with this phone number already exists');
      error.statusCode = 409;
      throw error;
    }

    const patientData = {
      ...payload,
      email: payload.email.toLowerCase().trim(),
      phone: payload.phone.trim(),
      createdBy: userId
    };

    const patient = await this.patientRepository.create(patientData);
    return patient;
  }

  async getPatients(query) {
    const { page = 1, limit = 10, search = '' } = query;

    const result = await this.patientRepository.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      search: search.trim()
    });

    return result;
  }

  async getPatientById(id) {
    const patient = await this.patientRepository.findById(id);
    if (!patient) {
      const error = new Error('Patient not found');
      error.statusCode = 404;
      throw error;
    }
    return patient;
  }

  async updatePatient(id, payload, userId) {
    const patient = await this.patientRepository.findById(id);
    if (!patient) {
      const error = new Error('Patient not found');
      error.statusCode = 404;
      throw error;
    }

    if (payload.email && payload.email !== patient.email) {
      const existingByEmail = await this.patientRepository.findByEmail(payload.email);
      if (existingByEmail) {
        const error = new Error('Patient with this email already exists');
        error.statusCode = 409;
        throw error;
      }
      payload.email = payload.email.toLowerCase().trim();
    }

    if (payload.phone && payload.phone !== patient.phone) {
      const existingByPhone = await this.patientRepository.findByPhone(payload.phone);
      if (existingByPhone) {
        const error = new Error('Patient with this phone number already exists');
        error.statusCode = 409;
        throw error;
      }
      payload.phone = payload.phone.trim();
    }

    payload.updatedBy = userId;

    const updatedPatient = await this.patientRepository.update(id, payload);
    if (!updatedPatient) {
      const error = new Error('Patient not found');
      error.statusCode = 404;
      throw error;
    }

    return updatedPatient;
  }

  async deletePatient(id) {
    const patient = await this.patientRepository.findById(id);
    if (!patient) {
      const error = new Error('Patient not found');
      error.statusCode = 404;
      throw error;
    }

    await this.patientRepository.delete(id);
    return true;
  }
}

module.exports = PatientService;
