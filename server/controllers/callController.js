// server/controllers/callController.js
const Call = require('../models/Call');
const User = require('../models/User');
const ServiceAd = require('../models/ServiceAd');
const Transaction = require('../models/Transaction');
const { validationResult } = require('express-validator');

// Initiate a call
exports.initiateCall = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { serviceAdId, scheduledTime, durationMinutes } = req.body;
    
    // Find service ad
    const serviceAd = await ServiceAd.findById(serviceAdId);
    if (!serviceAd || !serviceAd.isActive) {
      return res.status(404).json({ message: 'Service ad not found or inactive' });
    }
    
    // Calculate required coins
    const requiredCoins = Math.ceil(serviceAd.hourlyRate * (durationMinutes / 60));
    
    // Check if member has enough coins
    const member = await User.findById(req.user.id);
    if (member.coins < requiredCoins) {
      return res.status(400).json({ 
        message: 'Insufficient coins', 
        required: requiredCoins, 
        available: member.coins 
      });
    }
    
    // Create call record
    const call = new Call({
      member: req.user.id,
      provider: serviceAd.provider,
      serviceAd: serviceAd._id,
      startTime: scheduledTime || new Date(),
      status: scheduledTime ? 'scheduled' : 'in_progress',
      coinsUsed: requiredCoins
    });
    
    await call.save();
    
    // Deduct coins from member
    member.coins -= requiredCoins;
    await member.save();
    
    // Create transaction record
    const transaction = new Transaction({
      user: req.user.id,
      type: 'call_payment',
      amount: 0, // No direct money transaction
      coins: requiredCoins,
      status: 'completed',
      callDetails: {
        serviceAd: serviceAd._id,
        durationMinutes,
        provider: serviceAd.provider
      }
    });
    
    await transaction.save();
    
    // In a real-world scenario, you would initiate the call here using a service like Twilio
    // For now, we'll just return the call details
    
    res.status(201).json({
      message: 'Call initiated successfully',
      call,
      remainingCoins: member.coins,
      // In production, include call connection details here
      callDetails: {
        callId: call._id,
        provider: serviceAd.provider,
        durationMinutes,
        // In a real implementation, include connection tokens, room IDs, etc.
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Complete a call
exports.completeCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const { actualDurationMinutes, rating, feedback } = req.body;
    
    // Find call
    const call = await Call.findById(callId);
    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }
    
    // Verify that the user is involved in this call
    if (call.member.toString() !== req.user.id && call.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Update call details
    call.endTime = new Date();
    call.status = 'completed';
    call.durationMinutes = actualDurationMinutes || 
      Math.ceil((call.endTime - call.startTime) / (1000 * 60));
    
    if (rating) call.rating = rating;
    if (feedback) call.feedback = feedback;
    
    await call.save();
    
    // If provider completed the call, credit coins to their account
    if (req.user.id === call.provider.toString()) {
      const provider = await User.findById(call.provider);
      provider.coins += call.coinsUsed;
      await provider.save();
    }
    
    res.json({
      message: 'Call completed successfully',
      call
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's call history
exports.getCallHistory = async (req, res) => {
  try {
    // Find calls where user is either the member or provider
    const calls = await Call.find({
      $or: [
        { member: req.user.id },
        { provider: req.user.id }
      ]
    })
    .populate('serviceAd', 'title hourlyRate')
    .populate('provider', 'profile')
    .populate('member', 'profile')
    .sort({ createdAt: -1 });
    
    res.json(calls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};