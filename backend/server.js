const express = require('express');
require('./db');

const app = express();

app.get('/', (req, res) => {
  res.send('Backend running 🚀');
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});