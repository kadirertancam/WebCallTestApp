// server/models/Call.js
const mongoose = require('mongoose');

const CallSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceAd: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceAd',
    required: true
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  durationMinutes: {
    type: Number
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'missed'],
    default: 'scheduled'
  },
  coinsUsed: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String
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

CallSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Call', CallSchema);