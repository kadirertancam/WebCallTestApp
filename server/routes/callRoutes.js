// server/routes/callRoutes.js
const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  res.status(200).json({ message: 'Initiate call endpoint (placeholder)' });
});

router.put('/:callId/complete', (req, res) => {
  res.status(200).json({ message: 'Complete call endpoint (placeholder)' });
});

module.exports = router;