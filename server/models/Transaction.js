// server/models/Transaction.js
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['purchase', 'call_payment', 'withdrawal'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  coins: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal', 'crypto', 'bank_transfer'],
    required: function() {
      return this.type === 'purchase';
    }
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  callDetails: {
    // Filled only if type is 'call_payment'
    serviceAd: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceAd'
    },
    durationMinutes: Number,
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

TransactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Transaction', TransactionSchema);