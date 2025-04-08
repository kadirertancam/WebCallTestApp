// server/routes/coinRoutes.js
const express = require('express');
const router = express.Router();

router.get('/packages', (req, res) => {
  res.status(200).json({ message: 'Get coin packages endpoint (placeholder)' });
});

router.post('/purchase', (req, res) => {
  res.status(200).json({ message: 'Purchase coins endpoint (placeholder)' });
});

module.exports = router;