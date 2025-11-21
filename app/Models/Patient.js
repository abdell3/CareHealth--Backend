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
  middleName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female'],
    lowercase: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  address: {
    line1: {
      type: String,
      trim: true
    },
    line2: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    }
  },
  emergencyContact: {
    name: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    relation: {
      type: String,
      trim: true
    }
  },
  medicalData: {
    allergies: [{
      type: String,
      trim: true
    }],
    medications: [{
      type: String,
      trim: true
    }],
    chronicConditions: [{
      type: String,
      trim: true
    }],
    bloodType: {
      type: String,
      trim: true,
      uppercase: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']
    },
    notes: {
      type: String,
      trim: true
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  versionKey: false,
  strict: true
});

patientSchema.index({ firstName: 1, lastName: 1 });
patientSchema.index({ email: 1 });
patientSchema.index({ phone: 1 });
patientSchema.index({ firstName: 1, lastName: 1, email: 1, phone: 1 });

module.exports = mongoose.model('Patient', patientSchema);
