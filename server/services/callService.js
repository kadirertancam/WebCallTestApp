// server/services/callService.js
const Call = require('../models/Call');
const User = require('../models/User');
const ServiceAd = require('../models/ServiceAd');
const Transaction = require('../models/Transaction');
const twilio = require('twilio');
const { AppError } = require('../utils/errorHandler');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

class CallService {
  // Create a new call
  async initiateCall(memberId, serviceAdId, durationMinutes) {
    // Find service ad
    const serviceAd = await ServiceAd.findById(serviceAdId);
    if (!serviceAd || !serviceAd.isActive) {
      throw new AppError('Service not found or inactive', 404);
    }
    
    // Check if provider is available
    const provider = await User.findById(serviceAd.provider);
    if (!provider || !provider.isActive) {
      throw new AppError('Service provider is unavailable', 400);
    }
    
    // Calculate required coins
    const requiredCoins = Math.ceil(serviceAd.hourlyRate * (durationMinutes / 60));
    
    // Check if member has enough coins
    const member = await User.findById(memberId);
    if (!member) {
      throw new AppError('Member not found', 404);
    }
    
    if (member.coins < requiredCoins) {
      throw new AppError('Insufficient coins for this call duration', 400);
    }
    
    // Create a Twilio room for the call
    const twilioRoom = await twilioClient.video.v1.rooms.create({
      uniqueName: `call-${memberId}-${serviceAd.provider}-${Date.now()}`,
      type: 'group',
      statusCallback: `${process.env.API_URL}/api/calls/webhook`,
      statusCallbackMethod: 'POST'
    });
    
    // Generate access tokens for both parties
    const memberToken = this.generateAccessToken(memberId, twilioRoom.sid);
    const providerToken = this.generateAccessToken(serviceAd.provider, twilioRoom.sid);
    
    // Create call record
    const call = new Call({
      member: memberId,
      provider: serviceAd.provider,
      serviceAd: serviceAd._id,
      startTime: new Date(),
      status: 'pending',
      scheduledDuration: durationMinutes,
      coinsUsed: requiredCoins,
      twilioRoomSid: twilioRoom.sid
    });
    
    await call.save();
    
    // Deduct coins from member
    member.coins -= requiredCoins;
    await member.save();
    
    // Create transaction record
    const transaction = new Transaction({
      user: memberId,
      type: 'call_payment',
      amount: 0,
      coins: requiredCoins,
      status: 'completed',
      callDetails: {
        serviceAd: serviceAd._id,
        durationMinutes,
        provider: serviceAd.provider
      }
    });
    
    await transaction.save();
    
    return {
      call,
      twilioRoom: twilioRoom.sid,
      memberToken,
      providerToken,
      remainingCoins: member.coins
    };
  }
  
  // Generate Twilio access token
  generateAccessToken(userId, roomSid) {
    const AccessToken = twilio.jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;
    
    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET,
      { identity: userId.toString() }
    );
    
    const videoGrant = new VideoGrant({
      room: roomSid
    });
    
    token.addGrant(videoGrant);
    
    return token.toJwt();
  }
  
  // Handle provider response to call
  async responseToCall(callId, providerId, accept) {
    const call = await Call.findById(callId);
    
    if (!call) {
      throw new AppError('Call not found', 404);
    }
    
    if (call.provider.toString() !== providerId.toString()) {
      throw new AppError('Not authorized', 403);
    }
    
    if (call.status !== 'pending') {
      throw new AppError(`Call is already ${call.status}`, 400);
    }
    
    if (accept) {
      call.status = 'in_progress';
      call.startTime = new Date();
    } else {
      call.status = 'rejected';
      
      // Refund coins to member
      const member = await User.findById(call.member);
      member.coins += call.coinsUsed;
      await member.save();
      
      // Create refund transaction
      const transaction = new Transaction({
        user: call.member,
        type: 'call_refund',
        amount: 0,
        coins: call.coinsUsed,
        status: 'completed',
        callDetails: {
          serviceAd: call.serviceAd,
          provider: call.provider
        }
      });
      
      await transaction.save();
    }
    
    await call.save();
    
    return call;
  }
  
  // Complete a call
  async completeCall(callId, callData) {
    const { actualDurationMinutes, rating, feedback } = callData;
    
    const call = await Call.findById(callId);
    
    if (!call) {
      throw new AppError('Call not found', 404);
    }
    
    if (call.status !== 'in_progress') {
      throw new AppError('Call is not in progress', 400);
    }
    
    call.endTime = new Date();
    call.status = 'completed';
    call.actualDuration = actualDurationMinutes || 
      Math.ceil((call.endTime - call.startTime) / (1000 * 60));
    
    if (rating) call.rating = rating;
    if (feedback) call.feedback = feedback;
    
    await call.save();
    
    // Credit coins to provider
    const provider = await User.findById(call.provider);
    provider.coins += call.coinsUsed;
    await provider.save();
    
    // Create earnings transaction
    const transaction = new Transaction({
      user: call.provider,
      type: 'call_earnings',
      amount: 0,
      coins: call.coinsUsed,
      status: 'completed',
      callDetails: {
        serviceAd: call.serviceAd,
        member: call.member,
        duration: call.actualDuration
      }
    });
    
    await transaction.save();
    
    return call;
  }
  
  // Check if call time is running out
  async checkCallTimeRemaining(callId) {
    const call = await Call.findById(callId);
    
    if (!call || call.status !== 'in_progress') {
      return null;
    }
    
    const elapsedTime = Math.floor((Date.now() - call.startTime) / (1000 * 60));
    const remainingMinutes = call.scheduledDuration - elapsedTime;
    
    return {
      remainingMinutes,
      callId: call._id,
      lowBalance: remainingMinutes <= 2 // Alert when 2 minutes or less remaining
    };
  }
  
  // Extend call duration with additional coins
  async extendCallDuration(callId, memberId, additionalMinutes) {
    const call = await Call.findById(callId);
    
    if (!call || call.status !== 'in_progress') {
      throw new AppError('Call not found or not in progress', 404);
    }
    
    if (call.member.toString() !== memberId.toString()) {
      throw new AppError('Not authorized', 403);
    }
    
    // Get service details
    const serviceAd = await ServiceAd.findById(call.serviceAd);
    
    // Calculate additional coins needed
    const additionalCoins = Math.ceil(serviceAd.hourlyRate * (additionalMinutes / 60));
    
    // Check if member has enough coins
    const member = await User.findById(memberId);
    
    if (member.coins < additionalCoins) {
      throw new AppError('Insufficient coins for extension', 400);
    }
    
    // Update call duration
    call.scheduledDuration += additionalMinutes;
    await call.save();
    
    // Deduct coins from member
    member.coins -= additionalCoins;
    await member.save();
    
    // Create transaction record
    const transaction = new Transaction({
      user: memberId,
      type: 'call_extension',
      amount: 0,
      coins: additionalCoins,
      status: 'completed',
      callDetails: {
        serviceAd: call.serviceAd,
        additionalMinutes,
        provider: call.provider
      }
    });
    
    await transaction.save();
    
    return {
      call,
      additionalMinutes,
      newTotalDuration: call.scheduledDuration,
      coinsUsed: additionalCoins,
      remainingCoins: member.coins
    };
  }
}

module.exports = new CallService();