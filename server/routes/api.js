// server/routes/api.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const serviceAdController = require('../controllers/serviceAdController');
const coinController = require('../controllers/coinController');
const callController = require('../controllers/callController');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

// Auth routes
router.post('/auth/register', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('role').isIn(['user', 'member']).withMessage('Role must be either user or member')
], authController.register);

router.post('/auth/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], authController.login);

// Service ad routes
router.post('/services', protect, restrictTo('user'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('hourlyRate').isNumeric().withMessage('Hourly rate must be a number'),
  body('serviceDetails').notEmpty().withMessage('Service details are required')
], serviceAdController.createServiceAd);

router.get('/services', protect, serviceAdController.getAllServiceAds);
router.get('/services/provider', protect, restrictTo('user'), serviceAdController.getProviderServiceAds);
router.put('/services/:id', protect, restrictTo('user', 'admin'), serviceAdController.updateServiceAd);

// Coin routes
router.get('/coins/packages', protect, coinController.getCoinPackages);
router.post('/coins/purchase', protect, [
  body('packageId').isNumeric().withMessage('Valid package ID is required'),
  body('paymentMethod').isIn(['credit_card', 'paypal', 'crypto', 'bank_transfer']).withMessage('Valid payment method is required')
], coinController.purchaseCoins);
router.get('/coins/transactions', protect, coinController.getTransactionHistory);

// Call routes
router.post('/calls', protect, restrictTo('member'), [
  body('serviceAdId').notEmpty().withMessage('Service ad ID is required'),
  body('durationMinutes').isNumeric().withMessage('Duration must be a number')
], callController.initiateCall);
router.put('/calls/:callId/complete', protect, callController.completeCall);
router.get('/calls/history', protect, callController.getCallHistory);

// Admin routes
router.get('/admin/dashboard', protect, restrictTo('admin'), adminController.getDashboardStats);
router.get('/admin/users', protect, restrictTo('admin'), adminController.getAllUsers);
router.put('/admin/users/:userId', protect, restrictTo('admin'), adminController.updateUserStatus);
router.get('/admin/reports/revenue', protect, restrictTo('admin'), adminController.getRevenueReport);

module.exports = router;