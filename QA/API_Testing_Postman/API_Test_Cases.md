# API Test Cases – Hotel Booking System

| ID | Title | Method | Endpoint | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC-API-001** | Login with valid credentials | POST | `/api/users/login` | 200 OK, token returned |
| **TC-API-002** | Login with invalid password | POST | `/api/users/login` | 401 Unauthorized |
| **TC-API-003** | Login with empty fields | POST | `/api/users/login` | 400 Bad Request |
| **TC-API-004** | Get rooms list | GET | `/api/rooms` | 200 OK, rooms array returned |
| **TC-API-005** | Get available rooms with valid dates | GET | `/api/rooms/available` | 200 OK |
| **TC-API-006** | Get available rooms without params | GET | `/api/rooms/available` | 400 Bad Request |
| **TC-API-007** | Create guest with valid data | POST | `/api/guests` | 201 Created |
| **TC-API-008** | Create guest duplicate email | POST | `/api/guests` | 409 Conflict |
| **TC-API-009** | Create booking valid data | POST | `/api/bookings` | 201 Created |
| **TC-API-010** | Create booking with invalid dates | POST | `/api/bookings` | 400 Bad Request |
| **TC-API-011** | Prevent overbooking | POST | `/api/bookings` | 409 Conflict |
| **TC-API-012** | Delete booking | DELETE | `/api/bookings/:id` | 200 OK |
| **TC-API-013** | Check-in confirmed booking | PATCH | `/api/bookings/:id/checkin` | 200 OK |
| **TC-API-014** | Checkout checked-in guest | PATCH | `/api/bookings/:id/checkout` | 200 OK |
| **TC-API-015** | Get dashboard stats | GET | `/api/admin/stats` | 200 OK with stats object |