const express = require('express');
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Helper: recalculate business rating averages
function recalcRatings(businessId) {
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as count,
      AVG(rating_quality) as avg_quality,
      AVG(rating_service) as avg_service,
      AVG(rating_value) as avg_value,
      AVG((rating_quality + rating_service + rating_value) / 3.0) as avg_overall
    FROM reviews 
    WHERE business_id = ? AND status = 'approved'
  `).get(businessId);

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
    businessId
  );
}

// GET /api/reviews — get reviews (optionally filter by business_id, status)
router.get('/', (req, res) => {
  const { business_id, status, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = [];
  let params = [];

  if (business_id) {
    where.push('r.business_id = ?');
    params.push(parseInt(business_id));
  }

  // By default only show approved reviews to public
  if (status) {
    where.push('r.status = ?');
    params.push(status);
  } else {
    where.push("r.status = 'approved'");
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  const total = db.prepare(`SELECT COUNT(*) as count FROM reviews r ${whereClause}`).get(...params).count;

  const reviews = db.prepare(`
    SELECT r.*, u.username, b.name as business_name
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    JOIN businesses b ON r.business_id = b.id
    ${whereClause}
    ORDER BY r.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  res.json({
    reviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  });
});

// POST /api/reviews — submit a new review (authenticated users)
router.post('/', authenticate, (req, res) => {
  const { business_id, rating_quality, rating_service, rating_value, title, body, photo_url } = req.body;

  if (!business_id || !rating_quality || !rating_service || !rating_value || !title || !body) {
    return res.status(400).json({ error: 'business_id, rating_quality, rating_service, rating_value, title, and body are required' });
  }

  // Validate ratings are 1-5
  for (const r of [rating_quality, rating_service, rating_value]) {
    if (r < 1 || r > 5 || !Number.isInteger(r)) {
      return res.status(400).json({ error: 'Ratings must be integers between 1 and 5' });
    }
  }

  // Check business exists
  const business = db.prepare('SELECT id FROM businesses WHERE id = ?').get(business_id);
  if (!business) {
    return res.status(404).json({ error: 'Business not found' });
  }

  // Check if user already reviewed this business
  const existingReview = db.prepare(
    'SELECT id FROM reviews WHERE business_id = ? AND user_id = ?'
  ).get(business_id, req.user.id);
  if (existingReview) {
    return res.status(409).json({ error: 'You have already reviewed this business' });
  }

  const result = db.prepare(`
    INSERT INTO reviews (business_id, user_id, rating_quality, rating_service, rating_value, title, body, photo_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(business_id, req.user.id, rating_quality, rating_service, rating_value, title, body, photo_url || null);

  const review = db.prepare('SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.id = ?').get(result.lastInsertRowid);

  res.status(201).json({
    message: 'Review submitted successfully. It will be visible after admin approval.',
    review
  });
});

// PATCH /api/reviews/:id/approve — admin approves a review
router.patch('/:id/approve', authenticate, requireAdmin, (req, res) => {
  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }

  db.prepare("UPDATE reviews SET status = 'approved' WHERE id = ?").run(req.params.id);
  recalcRatings(review.business_id);

  const updated = db.prepare('SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.id = ?').get(req.params.id);
  res.json({ message: 'Review approved', review: updated });
});

// PATCH /api/reviews/:id/reject — admin rejects a review
router.patch('/:id/reject', authenticate, requireAdmin, (req, res) => {
  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }

  db.prepare("UPDATE reviews SET status = 'rejected' WHERE id = ?").run(req.params.id);
  recalcRatings(review.business_id);

  const updated = db.prepare('SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.id = ?').get(req.params.id);
  res.json({ message: 'Review rejected', review: updated });
});

// GET /api/reviews/pending — admin: get all pending reviews
router.get('/pending', authenticate, requireAdmin, (req, res) => {
  const reviews = db.prepare(`
    SELECT r.*, u.username, b.name as business_name
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    JOIN businesses b ON r.business_id = b.id
    WHERE r.status = 'pending'
    ORDER BY r.created_at ASC
  `).all();

  res.json({ reviews });
});

// DELETE /api/reviews/:id — admin or review owner can delete
router.delete('/:id', authenticate, (req, res) => {
  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }

  if (review.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to delete this review' });
  }

  db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
  recalcRatings(review.business_id);

  res.json({ message: 'Review deleted successfully' });
});

module.exports = router;
