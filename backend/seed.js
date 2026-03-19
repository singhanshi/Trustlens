const db = require('./db');
const bcrypt = require('bcryptjs');

console.log('Seeding database...');

// Clear existing data
db.exec('DELETE FROM reviews');
db.exec('DELETE FROM businesses');
db.exec('DELETE FROM users');

// Reset auto-increment
db.exec("DELETE FROM sqlite_sequence WHERE name IN ('users', 'businesses', 'reviews')");

// Create users
const adminPass = bcrypt.hashSync('admin123', 10);
const userPass = bcrypt.hashSync('user123', 10);

db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)').run('admin', 'admin@example.com', adminPass, 'admin');
db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)').run('johndoe', 'john@example.com', userPass, 'user');
db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)').run('janedoe', 'jane@example.com', userPass, 'user');
db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)').run('foodlover', 'food@example.com', userPass, 'user');

// Create businesses
const businesses = [
  ['The Golden Fork', 'A fine dining restaurant with a modern twist on classic dishes.', 'Restaurant', '123 Main St', 'Springfield', '555-0101', null],
  ['Burger Barn', 'Best burgers in town with locally sourced ingredients.', 'Restaurant', '456 Oak Ave', 'Springfield', '555-0102', null],
  ['Sakura Sushi', 'Authentic Japanese cuisine and fresh sushi rolls.', 'Restaurant', '789 Elm St', 'Shelbyville', '555-0103', null],
  ['Quick Fix Auto', 'Reliable auto repair and maintenance services.', 'Service', '321 Pine Rd', 'Springfield', '555-0201', null],
  ['Sparkle Clean', 'Professional home and office cleaning services.', 'Service', '654 Maple Dr', 'Shelbyville', '555-0202', null],
  ['TechZone', 'Electronics and gadgets store with expert staff.', 'Shop', '987 Cedar Ln', 'Springfield', '555-0301', null],
  ['Book Nook', 'Independent bookstore with a cozy reading corner.', 'Shop', '147 Birch Blvd', 'Capital City', '555-0302', null],
  ['Green Thumb Garden Center', 'Plants, tools, and expert gardening advice.', 'Shop', '258 Willow Way', 'Capital City', '555-0303', null],
  ['Zen Yoga Studio', 'Yoga and meditation classes for all levels.', 'Service', '369 Aspen Ct', 'Capital City', '555-0203', null],
  ['Bella Italia', 'Traditional Italian cuisine made with imported ingredients.', 'Restaurant', '741 Spruce St', 'Shelbyville', '555-0104', null],
  ['Pet Paradise', 'Pet grooming, boarding, and supplies.', 'Service', '852 Poplar Ave', 'Springfield', '555-0204', null],
  ['The Coffee House', 'Artisan coffee and fresh pastries daily.', 'Restaurant', '963 Walnut St', 'Capital City', '555-0105', null],
];

const insertBiz = db.prepare(
  'INSERT INTO businesses (name, description, category, address, city, phone, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)'
);

for (const b of businesses) {
  insertBiz.run(...b);
}

// Create some approved reviews
const reviews = [
  [1, 2, 5, 5, 4, 'Amazing dining experience', 'The food was incredible and the service was top-notch. Highly recommend the steak.', 'approved'],
  [1, 3, 4, 4, 3, 'Great food, a bit pricey', 'Quality is excellent but portions could be bigger for the price.', 'approved'],
  [2, 2, 5, 4, 5, 'Best burgers ever', 'Juicy, flavorful burgers at a great price. The fries are amazing too.', 'approved'],
  [2, 4, 4, 3, 4, 'Solid burger joint', 'Good burgers, decent service. Gets crowded on weekends.', 'approved'],
  [3, 3, 5, 5, 4, 'Authentic sushi', 'The freshest sushi I have had outside of Japan. The chef is a true artist.', 'approved'],
  [4, 2, 4, 5, 4, 'Honest mechanics', 'They fixed my car quickly and did not try to upsell unnecessary services.', 'approved'],
  [6, 4, 5, 4, 3, 'Great selection', 'They have everything you need. Staff is knowledgeable. Prices are a bit high.', 'approved'],
  [7, 3, 5, 5, 5, 'Book lover paradise', 'Wonderful selection and the staff recommendations are always spot on.', 'approved'],
  [10, 2, 5, 5, 4, 'Authentic Italian', 'The pasta is made fresh daily. Feels like eating in Italy.', 'approved'],
  [12, 4, 4, 4, 5, 'My daily coffee spot', 'Great coffee, fair prices, and a cozy atmosphere. Perfect for remote work.', 'approved'],
  // Some pending reviews
  [1, 4, 3, 2, 2, 'Overrated', 'Did not live up to the hype. Service was slow.', 'pending'],
  [5, 2, 5, 5, 5, 'Spotless every time', 'They do an amazing job cleaning our office every week.', 'pending'],
];

const insertReview = db.prepare(
  'INSERT INTO reviews (business_id, user_id, rating_quality, rating_service, rating_value, title, body, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
);

for (const r of reviews) {
  insertReview.run(...r);
}

// Recalculate ratings for all businesses
const allBusinesses = db.prepare('SELECT id FROM businesses').all();
for (const biz of allBusinesses) {
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as count,
      AVG(rating_quality) as avg_quality,
      AVG(rating_service) as avg_service,
      AVG(rating_value) as avg_value,
      AVG((rating_quality + rating_service + rating_value) / 3.0) as avg_overall
    FROM reviews 
    WHERE business_id = ? AND status = 'approved'
  `).get(biz.id);

  db.prepare(`
    UPDATE businesses SET 
      review_count = ?,
      avg_quality = ROUND(?, 1),
      avg_service = ROUND(?, 1),
      avg_value = ROUND(?, 1),
      avg_overall = ROUND(?, 1)
    WHERE id = ?
  `).run(
    stats.count,
    stats.avg_quality || 0,
    stats.avg_service || 0,
    stats.avg_value || 0,
    stats.avg_overall || 0,
    biz.id
  );
}

console.log('Seed complete!');
console.log('  Users: 4 (1 admin, 3 regular)');
console.log('  Businesses: 12');
console.log('  Reviews: 12 (10 approved, 2 pending)');
console.log('');
console.log('Test accounts:');
console.log('  Admin: admin@example.com / admin123');
console.log('  User:  john@example.com / user123');
