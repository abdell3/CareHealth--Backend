const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const medicalDocumentSchema = new Schema({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  consultationId: {
    type: Schema.Types.ObjectId,
    ref: 'Consultation'
  },
  labOrderId: {
    type: Schema.Types.ObjectId,
    ref: 'LabOrder'
  },
  uploaderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  fileType: {
    type: String,
    enum: ['PDF', 'JPEG', 'PNG'],
    required: true
  },
  fileSize: {
    type: Number,
    required: true,
    min: 0,
    max: 20 * 1024 * 1024
  },
  category: {
    type: String,
    enum: ['imaging', 'report'],
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  fileUrl: {
    type: String,
    required: true,
    trim: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
    required: true
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
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  versionKey: false,
  strict: true
});

medicalDocumentSchema.index({ patientId: 1, uploadedAt: -1 });
medicalDocumentSchema.index({ consultationId: 1 });
medicalDocumentSchema.index({ labOrderId: 1 });
medicalDocumentSchema.index({ category: 1 });
medicalDocumentSchema.index({ uploaderId: 1 });
medicalDocumentSchema.index({ isDeleted: 1 });
medicalDocumentSchema.index({ tags: 1 });

module.exports = mongoose.model('MedicalDocument', medicalDocumentSchema);
