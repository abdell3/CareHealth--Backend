const PharmacyRepository = require('../Repositories/PharmacyRepository');
const PrescriptionRepository = require('../Repositories/PrescriptionRepository');

class PharmacyService {
  constructor(pharmacyRepository) {
    this.pharmacyRepository = pharmacyRepository;
    this.prescriptionRepository = new PrescriptionRepository();
  }

  async createPharmacy(payload, userId) {
    const pharmacyData = {
      name: payload.name.trim(),
      address: payload.address.trim(),
      phone: payload.phone ? payload.phone.trim() : undefined,
      email: payload.email ? payload.email.toLowerCase().trim() : undefined,
      openingHours: payload.openingHours || undefined,
      status: payload.status || 'active',
      createdBy: userId,
      isDeleted: false
    };

    const pharmacy = await this.pharmacyRepository.create(pharmacyData);
    return pharmacy;
  }

  async getPharmacies(query) {
    const {
      page = 1,
      limit = 10,
      search = '',
      status
    } = query;

    const result = await this.pharmacyRepository.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      search: search.trim(),
      status
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

  async getPharmacyById(id) {
    const pharmacy = await this.pharmacyRepository.findById(id);
    if (!pharmacy || pharmacy.isDeleted) {
      const error = new Error('Pharmacy not found');
      error.statusCode = 404;
      throw error;
    }
    return pharmacy;
  }

  async updatePharmacy(id, payload, userId) {
    const pharmacy = await this.pharmacyRepository.findById(id);
    if (!pharmacy) {
      const error = new Error('Pharmacy not found');
      error.statusCode = 404;
      throw error;
    }

    if (pharmacy.isDeleted) {
      const error = new Error('Pharmacy is deleted');
      error.statusCode = 400;
      throw error;
    }

    const updateData = { ...payload };

    if (updateData.name) {
      updateData.name = updateData.name.trim();
    }
    if (updateData.address) {
      updateData.address = updateData.address.trim();
    }
    if (updateData.phone !== undefined) {
      updateData.phone = updateData.phone ? updateData.phone.trim() : undefined;
    }
    if (updateData.email !== undefined) {
      updateData.email = updateData.email ? updateData.email.toLowerCase().trim() : undefined;
    }

    updateData.updatedBy = userId;

    const updatedPharmacy = await this.pharmacyRepository.update(id, updateData);
    if (!updatedPharmacy) {
      const error = new Error('Pharmacy not found');
      error.statusCode = 404;
      throw error;
    }

    return updatedPharmacy;
  }

  async deletePharmacy(id, userId) {
    const pharmacy = await this.pharmacyRepository.findById(id);
    if (!pharmacy || pharmacy.isDeleted) {
      const error = new Error('Pharmacy not found');
      error.statusCode = 404;
      throw error;
    }

    await this.pharmacyRepository.delete(id, userId);
    return true;
  }

  async assignPrescriptionToPharmacy(prescriptionId, pharmacyId) {
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

    const prescription = await this.prescriptionRepository.findById(prescriptionId);
    if (!prescription || prescription.isDeleted) {
      const error = new Error('Prescription not found');
      error.statusCode = 404;
      throw error;
    }

    const assignedPrescription = await this.prescriptionRepository.assignPharmacy(prescriptionId, pharmacyId);
    return assignedPrescription;
  }

  async getPharmacyStatistics(pharmacyId) {
    const pharmacy = await this.pharmacyRepository.findById(pharmacyId);
    if (!pharmacy || pharmacy.isDeleted) {
      const error = new Error('Pharmacy not found');
      error.statusCode = 404;
      throw error;
    }

    const Prescription = require('../Models/Prescription');

    const prescriptions = await Prescription.countDocuments({
      pharmacyId: pharmacyId,
      isDeleted: false
    });

    const pendingCount = await Prescription.countDocuments({
      pharmacyId: pharmacyId,
      'dispensation.status': 'pending',
      isDeleted: false
    });

    const readyCount = await Prescription.countDocuments({
      pharmacyId: pharmacyId,
      'dispensation.status': 'ready',
      isDeleted: false
    });

    const dispensedCount = await Prescription.countDocuments({
      pharmacyId: pharmacyId,
      'dispensation.status': 'dispensed',
      isDeleted: false
    });

    return {
      pharmacy: {
        id: pharmacy._id,
        name: pharmacy.name,
        status: pharmacy.status
      },
      statistics: {
        totalPrescriptions: prescriptions,
        pending: pendingCount,
        ready: readyCount,
        dispensed: dispensedCount
      }
    };
  }
}

module.exports = PharmacyService;
