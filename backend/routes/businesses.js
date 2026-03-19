const express = require('express');
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/businesses — list all businesses with optional filters
router.get('/', (req, res) => {
  const { category, city, search, sort, page = 1, limit = 12 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = [];
  let params = [];

  if (category) {
    where.push('category = ?');
    params.push(category);
  }
  if (city) {
    where.push('city = ?');
    params.push(city);
  }
  if (search) {
    where.push('(name LIKE ? OR description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  let orderClause = 'ORDER BY created_at DESC';
  if (sort === 'rating') orderClause = 'ORDER BY avg_overall DESC';
  if (sort === 'reviews') orderClause = 'ORDER BY review_count DESC';
  if (sort === 'name') orderClause = 'ORDER BY name ASC';

  const total = db.prepare(`SELECT COUNT(*) as count FROM businesses ${whereClause}`).get(...params).count;

  const businesses = db.prepare(
    `SELECT * FROM businesses ${whereClause} ${orderClause} LIMIT ? OFFSET ?`
  ).all(...params, parseInt(limit), offset);

  res.json({
    businesses,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  });
});

// GET /api/businesses/categories — list distinct categories
router.get('/categories', (req, res) => {
  const categories = db.prepare('SELECT DISTINCT category FROM businesses ORDER BY category').all();
  res.json(categories.map(c => c.category));
});

// GET /api/businesses/cities — list distinct cities
router.get('/cities', (req, res) => {
  const cities = db.prepare('SELECT DISTINCT city FROM businesses WHERE city IS NOT NULL ORDER BY city').all();
  res.json(cities.map(c => c.city));
});

// GET /api/businesses/:id — get single business with its approved reviews
router.get('/:id', (req, res) => {
  const business = db.prepare('SELECT * FROM businesses WHERE id = ?').get(req.params.id);
  if (!business) {
    return res.status(404).json({ error: 'Business not found' });
  }

  const reviews = db.prepare(`
    SELECT r.*, u.username 
    FROM reviews r 
    JOIN users u ON r.user_id = u.id 
    WHERE r.business_id = ? AND r.status = 'approved'
    ORDER BY r.created_at DESC
  `).all(req.params.id);

  res.json({ ...business, reviews });
});

// POST /api/businesses — admin only: create a new business
router.post('/', authenticate, requireAdmin, (req, res) => {
  const { name, description, category, address, city, phone, image_url } = req.body;

  if (!name || !category) {
    return res.status(400).json({ error: 'name and category are required' });
  }

  const result = db.prepare(
    'INSERT INTO businesses (name, description, category, address, city, phone, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(name, description || null, category, address || null, city || null, phone || null, image_url || null);

  const business = db.prepare('SELECT * FROM businesses WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(business);
});

// PUT /api/businesses/:id — admin only: update a business
router.put('/:id', authenticate, requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM businesses WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Business not found' });
  }

  const { name, description, category, address, city, phone, image_url } = req.body;

  db.prepare(`
    UPDATE businesses SET 
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      category = COALESCE(?, category),
      address = COALESCE(?, address),
      city = COALESCE(?, city),
      phone = COALESCE(?, phone),
      image_url = COALESCE(?, image_url)
    WHERE id = ?
  `).run(name, description, category, address, city, phone, image_url, req.params.id);

  const updated = db.prepare('SELECT * FROM businesses WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/businesses/:id — admin only
router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM businesses WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Business not found' });
  }

  db.prepare('DELETE FROM reviews WHERE business_id = ?').run(req.params.id);
  db.prepare('DELETE FROM businesses WHERE id = ?').run(req.params.id);
  res.json({ message: 'Business deleted successfully' });
});

module.exports = router;
