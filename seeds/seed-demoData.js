require('dotenv').config();
const { initializeDatabase, closeDatabase } = require('../config/database');
const User = require('../app/Models/User');
const Role = require('../app/Models/Role');
const Patient = require('../app/Models/Patient');
const Appointment = require('../app/Models/Appointment');
const Consultation = require('../app/Models/Consultation');
const Prescription = require('../app/Models/Prescription');
const Pharmacy = require('../app/Models/Pharmacy');
const LabOrder = require('../app/Models/LabOrder');
const LabResult = require('../app/Models/LabResult');
const MedicalDocument = require('../app/Models/MedicalDocument');

const seedDemoData = async () => {
  try {
    await initializeDatabase();
    console.log('✓ Database connected');

    const adminRole = await Role.findOne({ name: 'admin' });
    const doctorRole = await Role.findOne({ name: 'doctor' });
    const pharmacistRole = await Role.findOne({ name: 'pharmacist' });
    const labTechRole = await Role.findOne({ name: 'lab_technician' });

    if (!adminRole || !doctorRole || !pharmacistRole || !labTechRole) {
      throw new Error('Required roles not found. Please run seed-roles-users.js first.');
    }

    const doctor = await User.findOne({ email: 'doctor@careflow.com' });
    const pharmacist = await User.findOne({ email: 'pharmacist@careflow.com' });
    const labTech = await User.findOne({ email: 'labtech@careflow.com' });
    const admin = await User.findOne({ email: 'admin@careflow.com' });

    if (!doctor || !pharmacist || !labTech || !admin) {
      throw new Error('Required users not found. Please run seed-roles-users.js first.');
    }

    console.log('✓ Found required users and roles');

    const patient = await Patient.create({
      firstName: 'Ahmed',
      lastName: 'Benali',
      dateOfBirth: new Date('1985-05-15'),
      gender: 'male',
      phone: '+212612345678',
      email: 'ahmed.benali@example.com',
      address: '123 Rue Mohammed V, Casablanca',
      city: 'Casablanca',
      insuranceProvider: 'CNSS',
      insuranceNumber: 'CNSS-123456',
      emergencyContactName: 'Fatima Benali',
      emergencyContactPhone: '+212698765432',
      allergies: ['Penicillin', 'Aspirin'],
      medicalHistory: ['Hypertension', 'Diabetes Type 2'],
      notes: 'Patient régulier depuis 2020',
      createdBy: doctor._id,
      isDeleted: false
    });

    console.log('✓ Patient created:', patient._id.toString());

    const appointmentDate = new Date();
    appointmentDate.setHours(10, 0, 0, 0);
    const appointmentEnd = new Date(appointmentDate);
    appointmentEnd.setHours(10, 30, 0, 0);

    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      startAt: appointmentDate,
      endAt: appointmentEnd,
      status: 'completed',
      reason: 'Consultation de routine - Suivi diabète et hypertension',
      location: 'Cabinet Principal',
      createdBy: doctor._id,
      metadata: {
        type: 'consultation',
        priority: 'normal'
      }
    });

    console.log('✓ Appointment created:', appointment._id.toString());

    const consultation = await Consultation.create({
      appointment: appointment._id,
      patient: patient._id,
      doctor: doctor._id,
      notes: 'Patient se plaint de fatigue et soif excessive. Tension artérielle légèrement élevée.',
      diagnosis: 'Diabète Type 2 - Contrôle glycémique nécessaire. Hypertension artérielle modérée.',
      followUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    console.log('✓ Consultation created:', consultation._id.toString());

    const prescription = await Prescription.create({
      patientId: patient._id,
      doctorId: doctor._id,
      appointmentId: appointment._id,
      medications: [
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '30 days',
          notes: 'After meals'
        },
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '30 days',
          notes: 'Morning'
        }
      ],
      issuedAt: new Date(),
      notes: 'Prendre avec les repas. Surveiller la glycémie quotidiennement.',
      createdBy: doctor._id,
      dispensation: {
        status: 'pending'
      },
      isDeleted: false
    });

    console.log('✓ Prescription created:', prescription._id.toString());

    const pharmacy = await Pharmacy.create({
      name: 'Pharmacie Centrale',
      address: '456 Boulevard Hassan II, Casablanca',
      phone: '+212522345678',
      email: 'pharmacie.centrale@example.com',
      openingHours: {
        monday: '08:00-20:00',
        tuesday: '08:00-20:00',
        wednesday: '08:00-20:00',
        thursday: '08:00-20:00',
        friday: '08:00-20:00',
        saturday: '09:00-18:00',
        sunday: '10:00-16:00'
      },
      status: 'active',
      createdBy: pharmacist._id,
      isDeleted: false
    });

    console.log('✓ Pharmacy created:', pharmacy._id.toString());

    prescription.pharmacyId = pharmacy._id;
    prescription.dispensation.status = 'ready';
    await prescription.save();

    console.log('✓ Prescription assigned to pharmacy');

    const labOrder = await LabOrder.create({
      patientId: patient._id,
      doctorId: doctor._id,
      consultationId: consultation._id,
      tests: ['Complete Blood Count (CBC)', 'Glucose Fasting', 'HbA1c', 'Lipid Profile', 'Creatinine'],
      status: 'ordered',
      createdBy: doctor._id,
      isDeleted: false
    });

    console.log('✓ Lab order created:', labOrder._id.toString());

    const labResult = await LabResult.create({
      labOrderId: labOrder._id,
      fileUrl: 'https://storage.example.com/lab-results/2024/12/lab-result-' + labOrder._id.toString() + '.pdf',
      uploaderId: labTech._id,
      uploadedAt: new Date(),
      notes: 'Résultats validés par le laboratoire. Glycémie à jeun: 7.2 mmol/L. HbA1c: 6.8%.',
      createdBy: labTech._id,
      isDeleted: false
    });

    labOrder.status = 'validated';
    labOrder.updatedBy = labTech._id;
    await labOrder.save();

    labResult.validatedAt = new Date();
    await labResult.save();

    console.log('✓ Lab result created:', labResult._id.toString());
    console.log('✓ Lab order status updated to validated');

    const medicalDocument = await MedicalDocument.create({
      patientId: patient._id,
      consultationId: consultation._id,
      uploaderId: doctor._id,
      fileName: 'xray-chest-ahmed-benali-2024.pdf',
      fileType: 'PDF',
      fileSize: 245760,
      category: 'imaging',
      tags: ['x-ray', 'chest', 'radiology'],
      fileUrl: 'https://storage.example.com/medical-documents/2024/12/xray-chest-' + patient._id.toString() + '.pdf',
      uploadedAt: new Date(),
      createdBy: doctor._id,
      isDeleted: false
    });

    console.log('✓ Medical document created:', medicalDocument._id.toString());

    console.log('\n✓ Demo data summary:');
    console.log('  Patient ID:', patient._id.toString());
    console.log('  Appointment ID:', appointment._id.toString());
    console.log('  Consultation ID:', consultation._id.toString());
    console.log('  Prescription ID:', prescription._id.toString());
    console.log('  Pharmacy ID:', pharmacy._id.toString());
    console.log('  Lab Order ID:', labOrder._id.toString());
    console.log('  Lab Result ID:', labResult._id.toString());
    console.log('  Medical Document ID:', medicalDocument._id.toString());

    await closeDatabase();
    return {
      patientId: patient._id.toString(),
      appointmentId: appointment._id.toString(),
      consultationId: consultation._id.toString(),
      prescriptionId: prescription._id.toString(),
      pharmacyId: pharmacy._id.toString(),
      labOrderId: labOrder._id.toString(),
      labResultId: labResult._id.toString(),
      medicalDocumentId: medicalDocument._id.toString()
    };
  } catch (error) {
    console.error('✗ Error seeding demo data:', error.message);
    if (error.code === 11000) {
      console.error('  Duplicate key error - data may already exist');
    }
    await closeDatabase();
    throw error;
  }
};

if (require.main === module) {
  seedDemoData()
    .then((data) => {
      console.log('\n✓ Seed demo data completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Seed demo data failed:', error);
      process.exit(1);
    });
}

module.exports = seedDemoData;

