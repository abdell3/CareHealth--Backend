const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const labResultSchema = new Schema({
  order: {
    type: Schema.Types.ObjectId,
    ref: 'LabOrder',
    required: true
  },
  resultText: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
    lowercase: true
  },
  resultDate: {
    type: Date
  }
}, {
  timestamps: true,
  versionKey: false,
  strict: true
});

module.exports = mongoose.model('LabResult', labResultSchema);
