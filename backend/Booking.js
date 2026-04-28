// models/Booking.js
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  method:  { type: String, enum: ['готівка', 'картка', 'онлайн'], default: 'картка' },
  status:  { type: String, enum: ['очікується', 'оплачено', 'скасовано'], default: 'очікується' },
  amount:  { type: Number }
});

const BookingSchema = new mongoose.Schema({
  room_id:  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  guest_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest',
    required: true
  },
  check_in:  { type: Date, required: true },
  check_out: { type: Date, required: true },
  actual_checkin:  { type: Date },
  actual_checkout: { type: Date },
  total_price: { type: Number, required: true },
  status: {
    type: String,
    enum: ['підтверджено', 'заселено', 'завершено', 'скасовано'],
    default: 'підтверджено'
  },
  notes:           { type: String },
  payment_details: PaymentSchema
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
