const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pharmacySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  stock: [{
    medication: {
      type: String,
      trim: true
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0
    },
    unit: {
      type: String,
      trim: true
    }
  }],
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  versionKey: false,
  strict: true
});

module.exports = mongoose.model('Pharmacy', pharmacySchema);
