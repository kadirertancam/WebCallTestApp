// Enhanced ServiceAd.js model
const mongoose = require('mongoose');

const TimeSlotSchema = new mongoose.Schema({
  start: {
    type: String, // HH:MM format
    required: true
  },
  end: {
    type: String, // HH:MM format
    required: true
  }
});

const AvailabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  hours: [TimeSlotSchema]
});

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
  availability: [AvailabilitySchema],
  isActive: {
    type: Boolean,
    default: true
  },
  totalCalls: {
    type: Number,
    default: 0
  },
  avgRating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
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

// Update timestamps before save
ServiceAdSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update service stats when a call is completed
ServiceAdSchema.statics.updateServiceStats = async function(serviceId, rating) {
  const serviceAd = await this.findById(serviceId);
  if (!serviceAd) return;
  
  // Increment total calls
  serviceAd.totalCalls += 1;
  
  // Update rating if provided
  if (rating) {
    const currentTotal = serviceAd.avgRating * serviceAd.reviewCount;
    serviceAd.reviewCount += 1;
    serviceAd.avgRating = (currentTotal + rating) / serviceAd.reviewCount;
  }
  
  await serviceAd.save();
};

module.exports = mongoose.model('ServiceAd', ServiceAdSchema);