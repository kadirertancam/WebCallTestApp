// server/models/ServiceAd.js
const mongoose = require('mongoose');

const ServiceAdSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  hourlyRate: {
    type: Number,
    required: true,
    min: 1
  },
  serviceDetails: {
    type: String,
    required: true
  },
  categories: [{
    type: String,
    trim: true
  }],
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  availability: {
    // Store availability as an array of time slots
    // Each object represents a day with available hours
    type: [{
      day: String,
      hours: [{
        start: String,
        end: String
      }]
    }],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
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

// Update the updatedAt timestamp before each update
ServiceAdSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ServiceAd', ServiceAdSchema);