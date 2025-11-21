const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
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
  date: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'cancelled', 'completed'],
    default: 'scheduled',
    lowercase: true
  }
}, {
  timestamps: true,
  versionKey: false,
  strict: true
});

appointmentSchema.index({ doctor: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
