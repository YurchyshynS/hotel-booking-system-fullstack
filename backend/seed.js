// seed.js — Заповнення бази тестовими даними
const mongoose = require('mongoose');
const Room    = require('./models/Room');
const Guest   = require('./models/Guest');
const Booking = require('./models/Booking');
const User    = require('./models/User');

mongoose.connect('mongodb://localhost:27017/hotel_booking_db').then(async () => {
  console.log('Connected. Seeding...');

  await Room.deleteMany({});
  await Guest.deleteMany({});
  await Booking.deleteMany({});
  await User.deleteMany({});

  const rooms = await Room.insertMany([
    { number: '101', category: 'одномісний', floor: 1, price_per_night: 800,  status: 'вільний' },
    { number: '102', category: 'одномісний', floor: 1, price_per_night: 800,  status: 'зайнятий' },
    { number: '201', category: 'двомісний',  floor: 2, price_per_night: 1200, status: 'заброньований' },
    { number: '202', category: 'двомісний',  floor: 2, price_per_night: 1200, status: 'вільний' },
    { number: '301', category: 'люкс',       floor: 3, price_per_night: 2500, status: 'вільний' },
    { number: '302', category: 'люкс',       floor: 3, price_per_night: 2500, status: 'на прибиранні' },
    { number: '401', category: 'сімейний',   floor: 4, price_per_night: 1600, status: 'вільний' },
    { number: '402', category: 'сімейний',   floor: 4, price_per_night: 1600, status: 'зайнятий' },
  ]);

  const guests = await Guest.insertMany([
    { name: 'Іван Петренко',   email: 'ivan@mail.com',   phone: '+380671234567', passport_id: 'AB123456', country: 'Україна' },
    { name: 'Марія Коваль',    email: 'maria@mail.com',  phone: '+380509876543', passport_id: 'CD789012', country: 'Україна' },
    { name: 'John Smith',      email: 'john@mail.com',   phone: '+447911123456', passport_id: 'P1234567', country: 'Великобританія' },
    { name: 'Anna Müller',     email: 'anna@mail.com',   phone: '+4915212345678', passport_id: 'C11223344', country: 'Німеччина' },
  ]);

  await User.insertMany([
    { name: 'Олена Коваль',   email: 'admin@lvivgrand.com',   password: 'admin123',   role: 'admin' },
    { name: 'Тарас Бойко',    email: 'manager@lvivgrand.com', password: 'manager123', role: 'manager' },
  ]);

  const tomorrow  = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek  = new Date(); nextWeek.setDate(nextWeek.getDate() + 7);
  const nextMonth = new Date(); nextMonth.setDate(nextMonth.getDate() + 30);

  await Booking.insertMany([
    {
      room_id: rooms[0]._id, guest_id: guests[0]._id,
      check_in: tomorrow, check_out: nextWeek,
      total_price: 800 * 6, status: 'підтверджено'
    },
    {
      room_id: rooms[1]._id, guest_id: guests[1]._id,
      check_in: new Date(), check_out: tomorrow,
      total_price: 800 * 1, status: 'заселено'
    },
    {
      room_id: rooms[2]._id, guest_id: guests[2]._id,
      check_in: nextWeek, check_out: nextMonth,
      total_price: 1200 * 23, status: 'підтверджено'
    },
  ]);

  console.log('✅ База даних заповнена тестовими даними!');
  console.log('👤 Логін admin: admin@lvivgrand.com / admin123');
  console.log('👤 Логін manager: manager@lvivgrand.com / manager123');
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
