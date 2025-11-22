const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pharmacySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  openingHours: {
    type: Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
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

pharmacySchema.index({ name: 1 });
pharmacySchema.index({ status: 1 });
pharmacySchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Pharmacy', pharmacySchema);
