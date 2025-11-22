const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const labResultSchema = new Schema({
  labOrderId: {
    type: Schema.Types.ObjectId,
    ref: 'LabOrder',
    required: true
  },
  fileUrl: {
    type: String,
    required: true,
    trim: true
  },
  uploaderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  validatedAt: {
    type: Date
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

labResultSchema.index({ labOrderId: 1 });
labResultSchema.index({ uploaderId: 1 });
labResultSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('LabResult', labResultSchema);
