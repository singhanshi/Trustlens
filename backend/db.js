const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'reviews.db'));

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS businesses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    address TEXT,
    city TEXT,
    phone TEXT,
    image_url TEXT,
    avg_quality REAL DEFAULT 0,
    avg_service REAL DEFAULT 0,
    avg_value REAL DEFAULT 0,
    avg_overall REAL DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    business_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating_quality INTEGER NOT NULL CHECK(rating_quality BETWEEN 1 AND 5),
    rating_service INTEGER NOT NULL CHECK(rating_service BETWEEN 1 AND 5),
    rating_value INTEGER NOT NULL CHECK(rating_value BETWEEN 1 AND 5),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    photo_url TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_reviews_business ON reviews(business_id);
  CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
  CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
  CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
`);

module.exports = db;
