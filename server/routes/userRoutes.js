// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();

// Example route: get all users (placeholder)
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Users endpoint (placeholder)' });
});

module.exports = router;
