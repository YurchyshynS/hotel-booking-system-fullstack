// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone:    { type: String },
  role: {
    type: String,
    enum: ['admin', 'manager'],
    default: 'admin'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
