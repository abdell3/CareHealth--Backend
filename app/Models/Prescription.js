const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const prescriptionSchema = new Schema({
  consultation: {
    type: Schema.Types.ObjectId,
    ref: 'Consultation',
    required: true
  },
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    dosage: {
      type: String,
      trim: true
    },
    duration: {
      type: String,
      trim: true
    }
  }],
  issuedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false,
  strict: true
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
