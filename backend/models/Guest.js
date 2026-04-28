// models/Guest.js
const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  price:      { type: Number, required: true },
  added_at:   { type: Date, default: Date.now }
});

const GuestSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  email:       { type: String },
  phone:       { type: String, required: true },
  passport_id: { type: String },
  country:     { type: String, default: 'Україна' },
  services:    [ServiceSchema]
}, { timestamps: true });

module.exports = mongoose.model('Guest', GuestSchema);
