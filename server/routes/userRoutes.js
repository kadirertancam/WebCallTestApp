// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Get current user profile
router.get('/me', protect, userController.getCurrentUser);

// Update user profile
router.put('/profile', protect, userController.updateProfile);

// Upload profile image
router.post('/profile/image', protect, userController.uploadProfileImage);

module.exports = router;