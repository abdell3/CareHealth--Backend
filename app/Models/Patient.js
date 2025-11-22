const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const patientSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other'],
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  insuranceProvider: {
    type: String,
    trim: true
  },
  insuranceNumber: {
    type: String,
    trim: true
  },
  emergencyContactName: {
    type: String,
    trim: true
  },
  emergencyContactPhone: {
    type: String,
    trim: true
  },
  allergies: {
    type: [String],
    default: []
  },
  medicalHistory: {
    type: [String],
    default: []
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
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

patientSchema.index({ firstName: 'text', lastName: 'text', phone: 'text', email: 'text' });
patientSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Patient', patientSchema);
