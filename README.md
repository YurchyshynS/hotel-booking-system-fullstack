# Hotel Booking System (Full Stack Web Application)

## Project Overview
This is a full-stack hotel booking web application that allows users to browse hotel rooms, register accounts, and make reservations. The system includes both frontend and backend parts with database integration.

## Tech Stack
**Frontend:** 
- React 18 (Vite) 
- JavaScript (ES6+)
- HTML5 / CSS3

**Backend:** 
- Node.js
- Express.js 

**Database:** 
- MongoDB + Mongoose

## Project Structure
```bash
hotel_2_final/
│
├── backend/          # Node.js server
│   ├── server.js
│   ├── models/       # database models
│   ├── Booking.js
│   ├── Room.js
│   ├── User.js
│   ├── Guest.js
│
├── frontend/         # static frontend files
├── src/              # React application source
├── db/               # database files / configs
├── package.json
├── vite.config.js
```

## Features
- User registration and authentication
- Room browsing and availability checking
- Booking system for hotel rooms
- User profile management
- Admin-side data structure (if applicable)
 
## How to Run Project
### Backend 
```bash
cd backend
npm install
node seed.js        # fill the database with test data
node server.js      # start the server on port 5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev         # port 5173
```

## Testing Scope (QA)
This project is used for QA practice and includes the following test areas:
- User authentication testing
- Room browsing and availability testing
- Booking process testing
- Form validation
- UI testing
- API endpoints testing

## Author
**Solomiia Yurchyshyn**  
QA / AQA aspiring engineer  
Focus: Test Automation, Python, Web/Software Testing
