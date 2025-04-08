// server/controllers/coinController.js
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { validationResult } = require('express-validator');

// Get coin packages
exports.getCoinPackages = async (req, res) => {
  try {
    // Predefined coin packages
    const coinPackages = [
      { id: 1, name: 'Starter', coins: 100, price: 9.99 },
      { id: 2, name: 'Popular', coins: 500, price: 39.99 },
      { id: 3, name: 'Premium', coins: 1000, price: 69.99 },
      { id: 4, name: 'Professional', coins: 5000, price: 299.99 }
    ];
    
    res.json(coinPackages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Purchase coins
exports.purchaseCoins = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { packageId, paymentMethod, paymentDetails } = req.body;
    
    // Get coin package details (in production, fetch from database)
    const coinPackages = [
      { id: 1, name: 'Starter', coins: 100, price: 9.99 },
      { id: 2, name: 'Popular', coins: 500, price: 39.99 },
      { id: 3, name: 'Premium', coins: 1000, price: 69.99 },
      { id: 4, name: 'Professional', coins: 5000, price: 299.99 }
    ];
    
    const selectedPackage = coinPackages.find(pkg => pkg.id === packageId);
    
    if (!selectedPackage) {
      return res.status(400).json({ message: 'Invalid package selected' });
    }
    
    // In a real implementation, process payment here
    // ...payment processing code...
    
    // Create transaction record
    const transaction = new Transaction({
      user: req.user.id,
      type: 'purchase',
      amount: selectedPackage.price,
      coins: selectedPackage.coins,
      paymentMethod,
      status: 'completed' // In production, this would be 'pending' until payment confirmation
    });
    
    await transaction.save();
    
    // Update user's coin balance
    const user = await User.findById(req.user.id);
    user.coins += selectedPackage.coins;
    await user.save();
    
    res.json({
      message: 'Coins purchased successfully',
      transaction,
      newBalance: user.coins
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's transaction history
exports.getTransactionHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};