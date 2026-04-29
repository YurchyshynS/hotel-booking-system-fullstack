# Bug Reports: Hotel Booking System

---

## BUG-001: Registration accepts invalid email format and invalid name input

**ID:** BUG-001  
**Priority:** High  
**Severity:** Major  
**Module:** Authentication / Registration  

### Preconditions
User is on Registration page.

### Steps to Reproduce
1. Open Registration page.
2. Enter numeric value `12345` in Name field.
3. Enter invalid email `testemail` (without @).
4. Fill other required fields.
5. Click **Register**.

### Actual Result
Account is successfully created with invalid name and invalid email.

### Expected Result
System blocks registration and displays validation errors for Name and Email fields.

### Environment
- OS: Windows 11
- Browser: Chrome 121
- App Version: Local Development Build

---

## BUG-002: Occupied room status can be manually changed to Available

**ID:** BUG-002  
**Priority:** Critical  
**Severity:** Critical  
**Module:** Room Management / Booking Logic  

### Preconditions
User logged in as Admin or Manager.  
Room has active booking.

### Steps to Reproduce
1. Login as Admin or Manager.
2. Create booking for Room 101.
3. Verify booking is active.
4. Open Rooms list.
5. Change room status from Occupied to Available manually.

### Actual Result
System allows changing occupied room status to Available.

### Expected Result
Room with active booking must remain Occupied and manual status change must be blocked.

### Environment
- OS: Windows 11
- Browser: Chrome 121
- App Version: Local Development Build

---

## BUG-003: Selected room list view mode is not preserved after navigation

**ID:** BUG-003  
**Priority:** Medium  
**Severity:** Minor  
**Module:** UI / Room List  

### Preconditions
User logged in.

### Steps to Reproduce
1. Login to system.
2. Open Rooms page.
3. Switch display mode to List View.
4. Navigate to another page.
5. Return to Rooms page.

### Actual Result
Display mode resets to default Grid View.

### Expected Result
Previously selected List View should remain active after navigation.

### Environment
- OS: Windows 11
- Browser: Chrome 121
- App Version: Local Development Build

---

## BUG-004: User passwords are stored and validated in plain text

**ID:** BUG-004  
**Priority:** Critical  
**Severity:** Critical  
**Module:** Authentication / Security

### Steps to Reproduce
1. Open backend authentication logic.
2. Review login comparison.

### Actual Result
Password is compared directly without hashing.

### Expected Result
Passwords must be hashed (bcrypt/argon2) and never stored in plain text.

### Environment
- Backend: Node.js Express
- DB: MongoDB

---

## BUG-005: Protected API routes can be accessed without token validation

**ID:** BUG-005  
**Priority:** Critical  
**Severity:** Major  
**Module:** Security / Authorization

### Steps to Reproduce
1. Send GET request to /api/bookings without token.
2. Send GET request to /api/guests without token.

### Actual Result
Data is accessible without authentication.

### Expected Result
Protected endpoints must require valid token/session.

### Environment
- Backend: Node.js Express

--

## BUG-006: Mock token returned instead of real JWT authentication token

**ID:** BUG-006  
**Priority:** High  
**Severity:** Major  
**Module:** Authentication

### Steps to Reproduce
1. Login with valid credentials.

### Actual Result
System returns mock-jwt-token-* value.

### Expected Result
System should generate real signed JWT token with expiration.

### Environment
- Backend: Node.js Express

