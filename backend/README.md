# Crowdsourced Review Platform — Backend API

## Setup

```bash
cd backend
npm install
npm run seed   # populate DB with sample data
npm start      # starts on http://localhost:3000
```

## Test Accounts

| Role  | Email              | Password |
|-------|--------------------|----------|
| Admin | admin@example.com  | admin123 |
| User  | john@example.com   | user123  |
| User  | jane@example.com   | user123  |
| User  | food@example.com   | user123  |

## API Endpoints

### Auth
- `POST /api/auth/register` — `{ username, email, password }`
- `POST /api/auth/login` — `{ email, password }`

### Businesses
- `GET /api/businesses` — list (query: `category`, `city`, `search`, `sort`, `page`, `limit`)
- `GET /api/businesses/categories` — distinct categories
- `GET /api/businesses/cities` — distinct cities
- `GET /api/businesses/:id` — detail + approved reviews
- `POST /api/businesses` — create (admin, auth required)
- `PUT /api/businesses/:id` — update (admin)
- `DELETE /api/businesses/:id` — delete (admin)

### Reviews
- `GET /api/reviews` — list (query: `business_id`, `status`, `page`, `limit`)
- `GET /api/reviews/pending` — pending reviews (admin)
- `POST /api/reviews` — submit review (auth required)
- `PATCH /api/reviews/:id/approve` — approve (admin)
- `PATCH /api/reviews/:id/reject` — reject (admin)
- `DELETE /api/reviews/:id` — delete (owner or admin)

### Upload
- `POST /api/upload` — upload photo (auth required, multipart form, field: `photo`)

### Health
- `GET /api/health`
