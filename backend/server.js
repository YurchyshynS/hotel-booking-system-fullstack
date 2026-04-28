// ============================================================
// server.js — Lviv Grand Hotel Booking System
// Node.js + Express + MongoDB (Mongoose)
// ============================================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// ─── Middleware ───────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── MongoDB Connection ───────────────────────────────────
mongoose.connect('mongodb://localhost:27017/hotel_booking_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB підключено успішно');
}).catch((err) => {
  console.error('❌ Помилка підключення до MongoDB:', err.message);
});

// ─── Import Models ────────────────────────────────────────
const Room    = require('./models/Room');
const Guest   = require('./models/Guest');
const Booking = require('./models/Booking');
const User    = require('./models/User');

// ===========================================================
// 1. AUTH / USERS
// ===========================================================

// POST /api/users/login — Вхід у систему
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email та пароль обовʼязкові' });
    }
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Невірний email або пароль' });
    }
    res.json({
      user_id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: 'mock-jwt-token-' + user._id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/:id — Отримати дані працівника
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===========================================================
// 2. ROOMS
// ===========================================================

// GET /api/rooms — Список усіх номерів
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/rooms/available — Вільні номери за датами
app.get('/api/rooms/available', async (req, res) => {
  try {
    const { check_in, check_out } = req.query;
    if (!check_in || !check_out) {
      return res.status(400).json({ message: 'Вкажіть дати check_in та check_out' });
    }
    const checkIn  = new Date(check_in);
    const checkOut = new Date(check_out);

    // Знаходимо бронювання, що перетинаються з заданим діапазоном
    const overlappingBookings = await Booking.find({
      status: { $in: ['підтверджено', 'заселено'] },
      check_in:  { $lt: checkOut },
      check_out: { $gt: checkIn }
    }).select('room_id');

    const bookedRoomIds = overlappingBookings.map(b => b.room_id.toString());

    // Повертаємо всі номери, яких немає у списку заброньованих
    const availableRooms = await Room.find({
      _id: { $nin: bookedRoomIds },
      status: { $ne: 'на прибиранні' }
    });

    res.json({
      check_in: check_in,
      check_out: check_out,
      available_rooms: availableRooms
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/rooms/:id/status — Змінити статус номера
app.patch('/api/rooms/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['вільний', 'зайнятий', 'заброньований', 'на прибиранні'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Некоректний статус' });
    }
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!room) return res.status(404).json({ message: 'Номер не знайдено' });
    res.json({ room_id: room._id, number: room.number, status: room.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/rooms/:id/price — Змінити ціну номера
app.put('/api/rooms/:id/price', async (req, res) => {
  try {
    const { price_per_night } = req.body;
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { price_per_night },
      { new: true }
    );
    if (!room) return res.status(404).json({ message: 'Номер не знайдено' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===========================================================
// 3. GUESTS
// ===========================================================

// GET /api/guests — Список усіх гостей
app.get('/api/guests', async (req, res) => {
  try {
    const guests = await Guest.find();
    res.json(guests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/guests/:id — Картка гостя
app.get('/api/guests/:id', async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) return res.status(404).json({ message: 'Гостя не знайдено' });
    res.json(guest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/guests — Додати нового гостя
app.post('/api/guests', async (req, res) => {
  try {
    const { name, email, phone, passport_id, country } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: 'Імʼя та телефон обовʼязкові' });
    }
    // Перевірка дублікату за email
    if (email) {
      const existing = await Guest.findOne({ email });
      if (existing) return res.status(409).json({ message: 'Гість з таким email вже існує' });
    }
    const guest = new Guest({ name, email, phone, passport_id, country });
    await guest.save();
    res.status(201).json(guest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/guests/:id — Оновити дані гостя
app.put('/api/guests/:id', async (req, res) => {
  try {
    const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!guest) return res.status(404).json({ message: 'Гостя не знайдено' });
    res.json(guest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===========================================================
// 4. BOOKINGS
// ===========================================================

// GET /api/bookings — Всі бронювання
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('room_id', 'number category price_per_night')
      .populate('guest_id', 'name email phone');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings/:id — Деталі бронювання
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('room_id')
      .populate('guest_id');
    if (!booking) return res.status(404).json({ message: 'Бронювання не знайдено' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/bookings — Створити бронювання (з перевіркою овербукінгу)
app.post('/api/bookings', async (req, res) => {
  try {
    const { room_id, guest_id, check_in, check_out, notes } = req.body;
    if (!room_id || !guest_id || !check_in || !check_out) {
      return res.status(400).json({ message: 'room_id, guest_id, check_in, check_out обовʼязкові' });
    }

    const checkIn  = new Date(check_in);
    const checkOut = new Date(check_out);

    if (checkIn >= checkOut) {
      return res.status(400).json({ message: 'Дата виїзду повинна бути пізніше дати заїзду' });
    }

    // ─── Перевірка овербукінгу ────────────────────────────
    const conflict = await Booking.findOne({
      room_id,
      status: { $in: ['підтверджено', 'заселено'] },
      check_in:  { $lt: checkOut },
      check_out: { $gt: checkIn }
    });

    if (conflict) {
      return res.status(409).json({
        message: '❌ Овербукінг! Номер вже заброньований на ці дати',
        conflicting_booking: conflict._id
      });
    }

    // ─── Розрахунок вартості ──────────────────────────────
    const room = await Room.findById(room_id);
    if (!room) return res.status(404).json({ message: 'Номер не знайдено' });

    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const total_price = nights * room.price_per_night;

    // ─── Створення бронювання ─────────────────────────────
    const booking = new Booking({
      room_id,
      guest_id,
      check_in: checkIn,
      check_out: checkOut,
      total_price,
      notes,
      status: 'підтверджено'
    });
    await booking.save();

    // ─── Оновлення статусу номера ─────────────────────────
    await Room.findByIdAndUpdate(room_id, { status: 'заброньований' });

    res.status(201).json({
      booking_id: booking._id,
      room_number: room.number,
      nights,
      total_price,
      status: booking.status
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/bookings/:id — Змінити бронювання
app.put('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) return res.status(404).json({ message: 'Бронювання не знайдено' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/bookings/:id — Скасувати бронювання
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Бронювання не знайдено' });

    // Звільнити номер
    await Room.findByIdAndUpdate(booking.room_id, { status: 'вільний' });
    await Booking.findByIdAndDelete(req.params.id);

    res.json({ message: 'Бронювання скасовано', booking_id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/bookings/:id/checkin — Заселення гостя
app.patch('/api/bookings/:id/checkin', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Бронювання не знайдено' });
    if (booking.status !== 'підтверджено') {
      return res.status(400).json({ message: 'Заселення можливе лише для підтвердженого бронювання' });
    }

    booking.status = 'заселено';
    booking.actual_checkin = new Date();
    await booking.save();

    // Номер стає зайнятим
    await Room.findByIdAndUpdate(booking.room_id, { status: 'зайнятий' });

    res.json({ message: '✅ Гостя заселено', booking_id: booking._id, status: booking.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/bookings/:id/checkout — Виселення гостя
app.patch('/api/bookings/:id/checkout', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Бронювання не знайдено' });
    if (booking.status !== 'заселено') {
      return res.status(400).json({ message: 'Виселення можливе лише для заселеного гостя' });
    }

    booking.status = 'завершено';
    booking.actual_checkout = new Date();
    await booking.save();

    // Номер переходить на прибирання
    await Room.findByIdAndUpdate(booking.room_id, { status: 'на прибиранні' });

    res.json({
      message: '✅ Гостя виселено',
      booking_id: booking._id,
      status: booking.status,
      total_price: booking.total_price
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===========================================================
// 5. STATS (для Dashboard)
// ===========================================================
app.get('/api/stats', async (req, res) => {
  try {
    const totalRooms     = await Room.countDocuments();
    const freeRooms      = await Room.countDocuments({ status: 'вільний' });
    const occupiedRooms  = await Room.countDocuments({ status: 'зайнятий' });
    const totalGuests    = await Guest.countDocuments();
    const totalBookings  = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: { $in: ['підтверджено', 'заселено'] } });

    res.json({ totalRooms, freeRooms, occupiedRooms, totalGuests, totalBookings, activeBookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===========================================================
// START SERVER
// ===========================================================
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
});
