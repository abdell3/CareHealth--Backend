const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const consultationSchema = new Schema({
  appointment: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment',
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
  notes: {
    type: String,
    trim: true
  },
  diagnosis: {
    type: String,
    trim: true
  },
  followUpDate: {
    type: Date
  }
}, {
  timestamps: true,
  versionKey: false,
  strict: true
});

module.exports = mongoose.model('Consultation', consultationSchema);
