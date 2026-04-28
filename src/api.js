const BASE = 'http://localhost:5000/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
  return data
}

export const api = {
  // Auth
  login: (body)      => request('/users/login',  { method: 'POST', body: JSON.stringify(body) }),

  // Rooms
  getRooms:          ()     => request('/rooms'),
  updateRoomStatus:  (id, status) => request(`/rooms/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  updateRoomPrice:   (id, price)  => request(`/rooms/${id}/price`,  { method: 'PUT',   body: JSON.stringify({ price_per_night: price }) }),

  // Guests
  getGuests:         ()     => request('/guests'),
  getGuest:          (id)   => request(`/guests/${id}`),
  createGuest:       (body) => request('/guests',    { method: 'POST', body: JSON.stringify(body) }),
  updateGuest:       (id, body) => request(`/guests/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  // Bookings
  getBookings:       ()     => request('/bookings'),
  createBooking:     (body) => request('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  deleteBooking:     (id)   => request(`/bookings/${id}`, { method: 'DELETE' }),
  checkIn:           (id)   => request(`/bookings/${id}/checkin`,  { method: 'PATCH' }),
  checkOut:          (id)   => request(`/bookings/${id}/checkout`, { method: 'PATCH' }),

  // Stats
  getStats:          ()     => request('/stats'),
}
