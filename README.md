#  Database Setup

This directory contains the **database configuration and server setup** for the TrustLens crowdsourced review platform.

---

##  Overview

The backend uses:

* **Node.js + Express** for server
* **SQLite (better-sqlite3)** for database
* A lightweight setup suitable for **hackathons and rapid prototyping**

---

##  Project Structure

```
/database
│── server.js        # Express server entry point
│── database.js      # SQLite database setup
│── reviews.db       # SQLite database file (auto-created)
```

---

##  Installation & Setup

### 1️ Install Dependencies

```bash
npm install express better-sqlite3
```

---

### 2️⃣ Run the Server

```bash
node server.js
```

---

### 3️⃣ Verify Server

Open in browser:

```
http://localhost:3000
```

Expected output:

```
Backend running 
```

---

##  Database Schema

The database consists of **3 main tables**:

---

###  Users Table

Stores user information.

| Column   | Type    | Description   |
| -------- | ------- | ------------- |
| id       | INTEGER | Primary Key   |
| username | TEXT    | User name     |
| email    | TEXT    | User email    |
| password | TEXT    | User password |

---

###  Businesses Table

Stores business listings.

| Column   | Type    | Description       |
| -------- | ------- | ----------------- |
| id       | INTEGER | Primary Key       |
| name     | TEXT    | Business name     |
| category | TEXT    | Business category |
| city     | TEXT    | Location          |

---

###  Reviews Table

Stores user reviews and ratings.

| Column      | Type    | Description     |
| ----------- | ------- | --------------- |
| id          | INTEGER | Primary Key     |
| business_id | INTEGER | Linked business |
| user_id     | INTEGER | Linked user     |
| rating      | INTEGER | Rating (1–5)    |

---

##  Relationships

* A **user** can give multiple reviews
* A **business** can have multiple reviews
* Reviews connect users and businesses

---

##  Current Limitations

* No review moderation (`pending / approved / rejected`) yet
* No review text field
* No authentication system implemented
* No API routes for CRUD operations

---

##  Suggested Improvements

To align with the full platform requirements:

* Add `status` field in reviews:

  ```sql
  status TEXT DEFAULT 'pending'
  ```

* Add review text:

  ```sql
  text TEXT
  ```

* Add business approval system:

  ```sql
  status TEXT DEFAULT 'pending'
  ```

* Create API routes:

  * Fetch pending reviews
  * Approve/reject reviews
  * Fetch businesses

---

##  Testing the Database

The database file `reviews.db` is automatically created when the server runs.

You can inspect it using:

* DB Browser for SQLite
* VS Code SQLite extension

---

##  Purpose in Project

This database powers:

* User profiles
* Business listings
* Review and rating system

It serves as the **core data layer** for the TrustLens platform.

---

##  Status

 Basic schema created
 Server running
 APIs and moderation system to be implemented

---

##  Contributors

Backend & Database handled as part of the hackathon team collaboration.

---
