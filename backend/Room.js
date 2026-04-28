// models/Room.js
const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['одномісний', 'двомісний', 'люкс', 'сімейний']
  },
  floor: {
    type: Number,
    required: true
  },
  price_per_night: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['вільний', 'зайнятий', 'заброньований', 'на прибиранні'],
    default: 'вільний'
  },
  description: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);
