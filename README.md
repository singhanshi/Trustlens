# Admin Panel

## Overview

The Admin Panel is a core module of TrustLens that ensures **authenticity and trust** by moderating user-submitted content.
It allows admins to review, approve, or reject both **reviews** and **business listings** before they are published on the platform.

---

## Purpose

* Prevent fake or spam reviews
* Ensure only verified businesses are listed
* Maintain platform credibility

---

## Features Implemented

### Admin Authentication

* Simple login mechanism (email-based for demo)
* Restricts access to admin-only functionality

---

### Tab-Based Navigation

* Two main sections:

  * **Reviews**
  * **Businesses**
* Admin can switch between sections using tabs
* Only one section is visible at a time

---

### Review Moderation

* Fetches all **pending reviews** from backend
* Displays:

  * Business name
  * User name
  * Review text
  * Rating
* Actions:

  *  Approve → Marks review as `approved`
  *  Reject → Marks review as `rejected`

---

### Business Moderation

* Fetches all **pending business submissions**
* Displays:

  * Business name
  * Category
* Actions:

  *  Approve → Business becomes visible on platform
  *  Reject → Business is discarded

---

### Real-Time UI Updates

* After approval/rejection:

  * UI refreshes instantly
  * Updated data fetched from backend

---

### Error Handling

* Handles API failures gracefully
* Displays error alerts/logs
* Prevents UI crashes

---

## Admin Flow

```plaintext
Admin Login
     ↓
Fetch Pending Data (Reviews & Businesses)
     ↓
Select Tab (Reviews / Businesses)
     ↓
Review Content
     ↓
Approve / Reject
     ↓
Backend Updates Status
     ↓
UI Refreshes Automatically
```

---

## API Integration

### Reviews

* `GET /reviews/pending` → Fetch pending reviews
* `POST /reviews/:id/approve` → Approve review
* `POST /reviews/:id/reject` → Reject review

---

### Businesses

* `GET /business/pending` → Fetch pending businesses
* `POST /business/:id/approve` → Approve business
* `POST /business/:id/reject` → Reject business

---

## Component Structure

```plaintext
AdminPanel.jsx
│
├── Admin Login View
├── Tab Navigation (Reviews / Businesses)
│
├── Reviews Section
│   ├── Review Card
│   ├── Approve Button
│   └── Reject Button
│
└── Businesses Section
    ├── Business Card
    ├── Approve Button
    └── Reject Button
```

---

## Key Logic

* Reviews and businesses are stored with status:

  * `pending`
  * `approved`
  * `rejected`

* Admin actions update status via API

* Only `approved` data is visible to users

---

## Highlights

* Clean and intuitive UI
* Modular structure
* Efficient moderation workflow
* Real-time updates
* Scalable design

---

## Conclusion

The Admin Panel acts as a **control layer** that filters and validates all user-generated content, ensuring that only trustworthy and high-quality data is published on the platform.

---
