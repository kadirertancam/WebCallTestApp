// server/routes/serviceRoutes.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Get all services endpoint (placeholder)' });
});

router.post('/', (req, res) => {
  res.status(200).json({ message: 'Create service endpoint (placeholder)' });
});

module.exports = router;