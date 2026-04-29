# QA Checklist: Hotel Booking System

## Authentication
- [ ] Invalid email format shows validation error
- [ ] Password minimum length enforced
- [ ] Duplicate email registration blocked
- [ ] Successful login with valid credentials
- [ ] Login blocked with invalid password
- [ ] Logout ends session

## Room Management & Booking
- [ ] Available rooms displayed correctly
- [ ] Room filtering by type works
- [ ] Room details page opens correctly
- [ ] Check-out date cannot be earlier than check-in
- [ ] Booking cannot be created for occupied dates
- [ ] Booking confirmation displayed after success

## UI / UX
- [ ] Favicon displayed correctly
- [ ] Responsive menu works on mobile
- [ ] Loader shown during API requests
- [ ] Buttons aligned properly
- [ ] No broken links
- [ ] Error messages readable

## Security / API
- [ ] Unauthorized user blocked from My Bookings page
- [ ] Password not returned in API responses
- [ ] Protected routes require token/session
- [ ] Deleted booking removed from UI after refresh