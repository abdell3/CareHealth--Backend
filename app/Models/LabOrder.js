const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const labOrderSchema = new Schema({
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
  consultationId: {
    type: Schema.Types.ObjectId,
    ref: 'Consultation'
  },
  tests: [{
    type: String,
    required: true,
    trim: true
  }],
  status: {
    type: String,
    enum: ['ordered', 'received', 'validated'],
    default: 'ordered',
    required: true
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

labOrderSchema.index({ patientId: 1, createdAt: -1 });
labOrderSchema.index({ doctorId: 1, status: 1 });
labOrderSchema.index({ consultationId: 1 });
labOrderSchema.index({ status: 1 });
labOrderSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('LabOrder', labOrderSchema);
