// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();

router.get('/dashboard', (req, res) => {
  res.status(200).json({ message: 'Admin dashboard endpoint (placeholder)' });
});

router.get('/users', (req, res) => {
  res.status(200).json({ message: 'Get all users endpoint (placeholder)' });
});

module.exports = router;