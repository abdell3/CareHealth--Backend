const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const labOrderSchema = new Schema({
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
  testType: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed'],
    default: 'pending',
    lowercase: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false,
  strict: true
});

module.exports = mongoose.model('LabOrder', labOrderSchema);
