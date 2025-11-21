const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_technician'],
    lowercase: true,
    trim: true
  }
}, {
  timestamps: true,
  versionKey: false,
  strict: true
});

roleSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Role', roleSchema);
