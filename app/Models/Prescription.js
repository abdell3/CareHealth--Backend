const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const prescriptionSchema = new Schema({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  medications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    dosage: {
      type: String,
      required: true,
      trim: true
    },
    frequency: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: String,
      required: true,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  issuedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  metadata: {
    type: Schema.Types.Mixed
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  pharmacyId: {
    type: Schema.Types.ObjectId,
    ref: 'Pharmacy'
  },
  dispensation: {
    status: {
      type: String,
      enum: ['pending', 'ready', 'unavailable', 'dispensed'],
      default: 'pending'
    },
    dispensedAt: {
      type: Date
    },
    pharmacistId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      trim: true
    }
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  versionKey: false,
  strict: true
});

prescriptionSchema.index({ patientId: 1, doctorId: 1, issuedAt: -1 });
prescriptionSchema.index({ 'medications.name': 'text' });
prescriptionSchema.index({ isDeleted: 1 });
prescriptionSchema.index({ pharmacyId: 1 });
prescriptionSchema.index({ 'dispensation.status': 1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
