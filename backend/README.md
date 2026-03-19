# Crowdsourced Review Platform — Backend API Documentation

## Member 3 Contribution: Backend (Core APIs)

This document explains the complete backend implementation for the Crowdsourced Review Platform. The backend provides RESTful API endpoints for browsing businesses, submitting reviews, user authentication, admin moderation, and photo uploads.

---

## 1. Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | Web framework for building REST APIs |
| better-sqlite3 | SQLite database driver (synchronous, fast, zero-config) |
| bcryptjs | Password hashing (salted, 10 rounds) |
| jsonwebtoken (JWT) | Token-based authentication |
| multer | File upload handling (multipart/form-data) |
| cors | Cross-Origin Resource Sharing (allows frontend to call API) |

---

## 2. Project Structure

```
backend/
├── server.js              # Entry point — Express app setup, middleware, route mounting
├── db.js                  # Database connection + table creation (runs on import)
├── seed.js                # Populates DB with sample users, businesses, reviews
├── package.json           # Dependencies and scripts
├── .gitignore             # Ignores node_modules, DB file, uploads
├── middleware/
│   └── auth.js            # JWT authentication + admin authorization middleware
├── routes/
│   ├── auth.js            # Register & Login endpoints
│   ├── businesses.js      # CRUD endpoints for businesses
│   ├── reviews.js         # CRUD + approve/reject endpoints for reviews
│   └── upload.js          # Photo upload endpoint
└── uploads/               # Directory where uploaded photos are stored
    └── .gitkeep
```

---

## 3. How to Run

```bash
cd backend
npm install          # Install all dependencies
npm run seed         # Create and populate the database with sample data
npm start            # Start the server on http://localhost:3000
```

For development with auto-restart on file changes:
```bash
npm run dev          # Uses node --watch (Node 18+)
```

---

## 4. Database Design (db.js)

The database is SQLite, stored as `reviews.db` in the backend folder. It is created automatically when the app starts (via `db.js` being imported). Three tables are defined:

### 4.1 users table

| Column | Type | Description |
|---|---|---|
| id | INTEGER (PK, auto) | Unique user ID |
| username | TEXT (unique) | Display name |
| email | TEXT (unique) | Login email |
| password | TEXT | bcrypt-hashed password |
| role | TEXT | Either `'user'` or `'admin'` (default: `'user'`) |
| created_at | DATETIME | Auto-set on creation |

The `role` column uses a CHECK constraint to only allow `'user'` or `'admin'`.

### 4.2 businesses table

| Column | Type | Description |
|---|---|---|
| id | INTEGER (PK, auto) | Unique business ID |
| name | TEXT | Business name |
| description | TEXT | Short description |
| category | TEXT | Category (e.g., Restaurant, Shop, Service) |
| address | TEXT | Street address |
| city | TEXT | City name |
| phone | TEXT | Contact phone |
| image_url | TEXT | Optional business image |
| avg_quality | REAL | Average quality rating (auto-calculated) |
| avg_service | REAL | Average service rating (auto-calculated) |
| avg_value | REAL | Average value rating (auto-calculated) |
| avg_overall | REAL | Average of all three ratings (auto-calculated) |
| review_count | INTEGER | Number of approved reviews (auto-calculated) |
| created_at | DATETIME | Auto-set on creation |

The `avg_*` and `review_count` fields are denormalized — they are recalculated every time a review is approved, rejected, or deleted. This avoids expensive JOINs when listing businesses.

### 4.3 reviews table

| Column | Type | Description |
|---|---|---|
| id | INTEGER (PK, auto) | Unique review ID |
| business_id | INTEGER (FK) | References businesses.id |
| user_id | INTEGER (FK) | References users.id |
| rating_quality | INTEGER (1-5) | Quality rating |
| rating_service | INTEGER (1-5) | Service rating |
| rating_value | INTEGER (1-5) | Value-for-money rating |
| title | TEXT | Review title/headline |
| body | TEXT | Full review text |
| photo_url | TEXT | Optional photo URL (from upload endpoint) |
| status | TEXT | `'pending'`, `'approved'`, or `'rejected'` (default: `'pending'`) |
| created_at | DATETIME | Auto-set on creation |

CHECK constraints enforce that ratings are between 1 and 5, and status is one of the three allowed values.

### 4.4 Indexes

- `idx_reviews_business` on `reviews(business_id)` — speeds up fetching reviews for a business
- `idx_reviews_status` on `reviews(status)` — speeds up filtering by pending/approved/rejected
- `idx_businesses_category` on `businesses(category)` — speeds up category filtering
- `idx_businesses_city` on `businesses(city)` — speeds up city filtering

### 4.5 Database Pragmas

- `journal_mode = WAL` — Write-Ahead Logging for better concurrent read performance
- `foreign_keys = ON` — Enforces foreign key constraints (SQLite has them off by default)

---

## 5. Authentication System (middleware/auth.js + routes/auth.js)

### 5.1 How It Works

The API uses JWT (JSON Web Tokens) for stateless authentication:

1. User registers or logs in → server returns a JWT token
2. Client stores the token (e.g., in localStorage)
3. Client sends the token in the `Authorization` header for protected requests
4. Server verifies the token and extracts user info (id, username, role)

### 5.2 Middleware Functions

**`authenticate(req, res, next)`**
- Reads the `Authorization: Bearer <token>` header
- Verifies the JWT using the secret key
- Attaches the decoded payload to `req.user` (contains `id`, `username`, `role`)
- Returns 401 if token is missing or invalid

**`requireAdmin(req, res, next)`**
- Must be used AFTER `authenticate`
- Checks if `req.user.role === 'admin'`
- Returns 403 if the user is not an admin

### 5.3 Auth Endpoints

**POST /api/auth/register**
```json
// Request body:
{ "username": "newuser", "email": "new@example.com", "password": "mypass123" }

// Response (201):
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 5, "username": "newuser", "email": "new@example.com", "role": "user" }
}
```
- Validates all fields are present, password >= 6 chars
- Checks username/email uniqueness (409 if duplicate)
- Hashes password with bcrypt (10 salt rounds)
- Returns JWT token valid for 7 days

**POST /api/auth/login**
```json
// Request body:
{ "email": "john@example.com", "password": "user123" }

// Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 2, "username": "johndoe", "email": "john@example.com", "role": "user" }
}
```
- Looks up user by email
- Compares password with bcrypt
- Returns 401 if credentials are wrong

---

## 6. Business Endpoints (routes/businesses.js)

### 6.1 GET /api/businesses — List Businesses

Public endpoint. Returns a paginated list of businesses with optional filtering and sorting.

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| category | string | — | Filter by exact category (e.g., `Restaurant`) |
| city | string | — | Filter by exact city (e.g., `Springfield`) |
| search | string | — | Search in name and description (LIKE %search%) |
| sort | string | `created_at DESC` | Sort by: `rating`, `reviews`, `name` |
| page | number | 1 | Page number |
| limit | number | 12 | Items per page |

**Example:** `GET /api/businesses?category=Restaurant&city=Springfield&sort=rating&page=1`

**Response:**
```json
{
  "businesses": [ { "id": 1, "name": "The Golden Fork", "avg_overall": 4.2, ... } ],
  "pagination": { "page": 1, "limit": 12, "total": 2, "totalPages": 1 }
}
```

**How filtering works internally:**
- Each filter adds a condition to a `WHERE` clause array
- Conditions are joined with `AND`
- Parameters use prepared statement placeholders (`?`) to prevent SQL injection

### 6.2 GET /api/businesses/categories

Returns an array of distinct category strings: `["Restaurant", "Service", "Shop"]`

### 6.3 GET /api/businesses/cities

Returns an array of distinct city strings: `["Capital City", "Shelbyville", "Springfield"]`

These two endpoints are useful for populating filter dropdowns on the frontend.

### 6.4 GET /api/businesses/:id — Business Detail

Returns a single business object with all its approved reviews embedded:

```json
{
  "id": 1,
  "name": "The Golden Fork",
  "avg_overall": 4.2,
  "review_count": 2,
  "reviews": [
    { "id": 1, "username": "johndoe", "rating_quality": 5, "title": "Amazing...", ... },
    { "id": 2, "username": "janedoe", "rating_quality": 4, "title": "Great food...", ... }
  ]
}
```

Only reviews with `status = 'approved'` are included. Reviews are JOINed with users to include the `username`.

### 6.5 POST /api/businesses — Create Business (Admin Only)

Requires: `authenticate` + `requireAdmin` middleware.

```json
// Request body:
{ "name": "New Place", "category": "Restaurant", "description": "...", "city": "Springfield" }
// Only name and category are required; rest are optional.
```

### 6.6 PUT /api/businesses/:id — Update Business (Admin Only)

Uses `COALESCE(?, existing_value)` so you only need to send the fields you want to change. Any field set to `null` or omitted keeps its current value.

### 6.7 DELETE /api/businesses/:id — Delete Business (Admin Only)

Deletes the business AND all its associated reviews (cascading delete done manually).

---

## 7. Review Endpoints (routes/reviews.js)

### 7.1 The Review Workflow

```
User submits review → status = "pending"
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
     Admin approves            Admin rejects
     status = "approved"       status = "rejected"
              │                       │
              ▼                       ▼
     Review visible            Review hidden
     Ratings recalculated      Ratings recalculated
```

This is the core moderation system. Reviews are NOT visible to the public until an admin approves them.

### 7.2 GET /api/reviews — List Reviews

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| business_id | number | — | Filter by business |
| status | string | `approved` | Filter by status (`pending`, `approved`, `rejected`) |
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |

By default, only approved reviews are returned (public safety). If `status` is explicitly passed (e.g., by an admin panel), it overrides this.

Each review includes `username` (from users table) and `business_name` (from businesses table) via JOINs.

### 7.3 POST /api/reviews — Submit Review (Auth Required)

Requires: `authenticate` middleware.

```json
// Request body:
{
  "business_id": 1,
  "rating_quality": 5,
  "rating_service": 4,
  "rating_value": 4,
  "title": "Great experience",
  "body": "The food was amazing and the staff was friendly.",
  "photo_url": "/uploads/1234567890-photo.jpg"   // optional
}
```

**Validations:**
- All fields except `photo_url` are required
- Ratings must be integers between 1 and 5
- Business must exist (404 if not)
- User can only review a business ONCE (409 if duplicate)

**Response (201):**
```json
{
  "message": "Review submitted successfully. It will be visible after admin approval.",
  "review": { "id": 13, "status": "pending", "username": "johndoe", ... }
}
```

### 7.4 PATCH /api/reviews/:id/approve — Approve Review (Admin Only)

- Sets `status = 'approved'`
- Calls `recalcRatings(business_id)` to update the business's average ratings

### 7.5 PATCH /api/reviews/:id/reject — Reject Review (Admin Only)

- Sets `status = 'rejected'`
- Calls `recalcRatings(business_id)` to update the business's average ratings

### 7.6 GET /api/reviews/pending — Pending Reviews (Admin Only)

Returns all reviews with `status = 'pending'`, ordered oldest first (FIFO queue for moderation).

### 7.7 DELETE /api/reviews/:id — Delete Review (Owner or Admin)

- The review author OR any admin can delete a review
- After deletion, `recalcRatings()` is called to update business averages

### 7.8 Rating Aggregation — recalcRatings()

This is a helper function that runs every time a review's status changes or a review is deleted:

```javascript
function recalcRatings(businessId) {
  // 1. Calculate AVG of each rating type from approved reviews only
  // 2. Calculate overall = AVG of (quality + service + value) / 3
  // 3. Count approved reviews
  // 4. UPDATE the businesses table with these computed values
}
```

This denormalization means the businesses table always has up-to-date ratings without needing to JOIN and aggregate at query time. It makes the GET /api/businesses endpoint fast even with many reviews.

---

## 8. Photo Upload (routes/upload.js)

### POST /api/upload

Requires: `authenticate` middleware.

- Accepts multipart/form-data with a field named `photo`
- Max file size: 5MB
- Allowed formats: jpeg, jpg, png, gif, webp
- Files are saved to `backend/uploads/` with a unique timestamp-based filename
- Returns the URL path to use in a review's `photo_url` field

**Example using curl:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer <token>" \
  -F "photo=@/path/to/image.jpg"
```

**Response:**
```json
{ "url": "/uploads/1710835200000-123456789.jpg", "filename": "1710835200000-123456789.jpg" }
```

The `url` value can then be passed as `photo_url` when submitting a review.

Uploaded files are served statically via `app.use('/uploads', express.static(...))` in server.js.

---

## 9. Server Entry Point (server.js)

The main file does the following in order:

1. Creates an Express app
2. Applies global middleware:
   - `cors()` — allows requests from any origin (for frontend integration)
   - `express.json()` — parses JSON request bodies
   - Static file serving for `/uploads`
3. Mounts route modules:
   - `/api/auth` → auth.js
   - `/api/businesses` → businesses.js
   - `/api/reviews` → reviews.js
   - `/api/upload` → upload.js
4. Adds a `/api/health` endpoint for monitoring
5. Adds a global error handler (catches unhandled errors, returns 500)
6. Starts listening on PORT (default 3000)

---

## 10. Seed Data (seed.js)

Running `npm run seed` populates the database with:

- **4 users:** 1 admin + 3 regular users
- **12 businesses:** across 3 categories (Restaurant, Shop, Service) and 3 cities (Springfield, Shelbyville, Capital City)
- **12 reviews:** 10 approved + 2 pending

After inserting reviews, the script recalculates all business rating averages.

### Test Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | admin123 |
| User | john@example.com | user123 |
| User | jane@example.com | user123 |
| User | food@example.com | user123 |

---

## 11. API Quick Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login, get JWT token |
| GET | /api/businesses | No | List businesses (filter, search, sort, paginate) |
| GET | /api/businesses/categories | No | Get category list |
| GET | /api/businesses/cities | No | Get city list |
| GET | /api/businesses/:id | No | Business detail + approved reviews |
| POST | /api/businesses | Admin | Create business |
| PUT | /api/businesses/:id | Admin | Update business |
| DELETE | /api/businesses/:id | Admin | Delete business + its reviews |
| GET | /api/reviews | No | List approved reviews (filterable) |
| GET | /api/reviews/pending | Admin | List pending reviews |
| POST | /api/reviews | User | Submit a review (goes to pending) |
| PATCH | /api/reviews/:id/approve | Admin | Approve a pending review |
| PATCH | /api/reviews/:id/reject | Admin | Reject a pending review |
| DELETE | /api/reviews/:id | Owner/Admin | Delete a review |
| POST | /api/upload | User | Upload a photo |
| GET | /api/health | No | Health check |

---

## 12. Error Handling

All endpoints follow a consistent error response format:

```json
{ "error": "Description of what went wrong" }
```

| Status Code | Meaning |
|---|---|
| 400 | Bad request — missing or invalid fields |
| 401 | Unauthorized — no token or invalid token |
| 403 | Forbidden — not an admin (for admin-only routes) |
| 404 | Not found — business or review doesn't exist |
| 409 | Conflict — duplicate username/email or duplicate review |
| 500 | Internal server error — unhandled exception |

---

## 13. Security Considerations

- Passwords are hashed with bcrypt (10 salt rounds) — never stored in plain text
- JWT tokens expire after 7 days
- SQL injection is prevented by using parameterized queries (`?` placeholders) everywhere
- File uploads are restricted by type (images only) and size (5MB max)
- Foreign keys are enforced at the database level
- CORS is enabled for frontend integration (can be restricted to specific origins in production)
- The JWT secret should be set via the `JWT_SECRET` environment variable in production

---

## 14. How Other Members Integrate

- **Member 1 (Frontend UI):** Use GET /api/businesses for the home page listing, GET /api/businesses/categories and /cities for filter dropdowns
- **Member 2 (Frontend User Flow):** Use GET /api/businesses/:id for the detail page, POST /api/reviews for the review form, POST /api/auth/* for login/register
- **Member 4 (Database):** The schema is already defined in db.js — can extend or modify tables there
- **Member 5 (Admin Panel):** Use GET /api/reviews/pending, PATCH approve/reject, POST/PUT/DELETE businesses for the admin dashboard
