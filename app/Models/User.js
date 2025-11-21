const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
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
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  refreshToken: {
    type: String,
    trim: true
  },
  resetToken: {
    type: String,
    trim: true
  },
  resetTokenExpires: {
    type: Date
  }
}, {
  timestamps: true,
  versionKey: false,
  strict: true
});

userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
