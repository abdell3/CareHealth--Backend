const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const medicalDocumentSchema = new Schema({
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  fileUrl: {
    type: String,
    required: true,
    trim: true
  },
  fileType: {
    type: String,
    trim: true
  },
  size: {
    type: Number,
    min: 0
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false,
  strict: true
});

module.exports = mongoose.model('MedicalDocument', medicalDocumentSchema);
