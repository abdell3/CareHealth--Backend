const mongoose = require('mongoose');

const mockUser = {
  _id: new mongoose.Types.ObjectId(),
  email: 'doctor@test.com',
  password: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890',
  firstName: 'John',
  lastName: 'Doe',
  phone: '1234567890',
  role: new mongoose.Types.ObjectId(),
  isActive: true,
  isSuspended: false
};

const mockRole = {
  _id: new mongoose.Types.ObjectId(),
  name: 'doctor',
  description: 'Doctor role'
};

const mockPatient = {
  _id: new mongoose.Types.ObjectId(),
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@test.com',
  phone: '0987654321',
  dateOfBirth: new Date('1990-01-01'),
  gender: 'female',
  address: {
    street: '123 Main St',
    city: 'Test City',
    state: 'Test State',
    zipCode: '12345',
    country: 'Test Country'
  },
  isDeleted: false,
  createdBy: mockUser._id
};

const mockAppointment = {
  _id: new mongoose.Types.ObjectId(),
  patientId: mockPatient._id,
  doctorId: mockUser._id,
  appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
  duration: 30,
  status: 'scheduled',
  reason: 'Regular checkup'
};

const mockConsultation = {
  _id: new mongoose.Types.ObjectId(),
  patientId: mockPatient._id,
  doctorId: mockUser._id,
  appointmentId: mockAppointment._id,
  reason: 'Headache',
  diagnosis: 'Migraine',
  notes: 'Prescribed medication'
};

const mockPrescription = {
  _id: new mongoose.Types.ObjectId(),
  patientId: mockPatient._id,
  doctorId: mockUser._id,
  appointmentId: mockAppointment._id,
  medications: [
    {
      name: 'Paracetamol',
      dosage: '500mg',
      frequency: 'Every 6 hours',
      duration: '7 days'
    }
  ],
  issuedAt: new Date()
};

const mockPharmacy = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Test Pharmacy',
  address: '456 Pharmacy St',
  phone: '1112223333',
  email: 'pharmacy@test.com',
  status: 'active',
  isDeleted: false
};

const mockLabOrder = {
  _id: new mongoose.Types.ObjectId(),
  patientId: mockPatient._id,
  doctorId: mockUser._id,
  consultationId: mockConsultation._id,
  tests: ['Blood Test', 'Urine Test'],
  status: 'ordered'
};

const mockLabResult = {
  _id: new mongoose.Types.ObjectId(),
  labOrderId: mockLabOrder._id,
  fileUrl: 'test-result.pdf',
  uploaderId: mockUser._id,
  uploadedAt: new Date(),
  validatedAt: null
};

const mockMedicalDocument = {
  _id: new mongoose.Types.ObjectId(),
  patientId: mockPatient._id,
  consultationId: mockConsultation._id,
  uploaderId: mockUser._id,
  fileName: 'test-document.pdf',
  fileType: 'application/pdf',
  fileSize: 1024,
  category: 'report',
  tags: ['test'],
  fileUrl: 'test-document.pdf',
  isDeleted: false
};

module.exports = {
  mockUser,
  mockRole,
  mockPatient,
  mockAppointment,
  mockConsultation,
  mockPrescription,
  mockPharmacy,
  mockLabOrder,
  mockLabResult,
  mockMedicalDocument
};

