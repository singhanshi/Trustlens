const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const businessRoutes = require('./routes/businesses');
const reviewRoutes = require('./routes/reviews');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Endpoints:`);
  console.log(`  GET    /api/health`);
  console.log(`  POST   /api/auth/register`);
  console.log(`  POST   /api/auth/login`);
  console.log(`  GET    /api/businesses`);
  console.log(`  GET    /api/businesses/categories`);
  console.log(`  GET    /api/businesses/cities`);
  console.log(`  GET    /api/businesses/:id`);
  console.log(`  POST   /api/businesses (admin)`);
  console.log(`  PUT    /api/businesses/:id (admin)`);
  console.log(`  DELETE /api/businesses/:id (admin)`);
  console.log(`  GET    /api/reviews`);
  console.log(`  GET    /api/reviews/pending (admin)`);
  console.log(`  POST   /api/reviews (auth)`);
  console.log(`  PATCH  /api/reviews/:id/approve (admin)`);
  console.log(`  PATCH  /api/reviews/:id/reject (admin)`);
  console.log(`  DELETE /api/reviews/:id (auth)`);
});
