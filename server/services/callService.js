// server/services/callService.js - enhanced version
const Call = require('../models/Call');
const User = require('../models/User');
const ServiceAd = require('../models/ServiceAd');
const Transaction = require('../models/Transaction');
const twilio = require('twilio');
const { AppError } = require('../utils/errorHandler');
const logger = require('../config/logger');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

class CallService {
  // Create a new call
  async initiateCall(memberId, serviceAdId, durationMinutes) {
    try {
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
        status: 'scheduled',
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
      
      // Notify provider about incoming call (this would be via WebSockets in a real app)
      // this.notifyProvider(provider._id, call._id);
      
      return {
        call,
        twilioRoom: twilioRoom.sid,
        twilioToken: memberToken,
        providerToken,
        remainingCoins: member.coins
      };
    } catch (error) {
      logger.error(`Call initiation error: ${error.message}`);
      throw error;
    }
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
  async respondToCall(callId, providerId, accept) {
    try {
      const call = await Call.findById(callId);
      
      if (!call) {
        throw new AppError('Call not found', 404);
      }
      
      if (call.provider.toString() !== providerId.toString()) {
        throw new AppError('Not authorized', 403);
      }
      
      if (call.status !== 'scheduled') {
        throw new AppError(`Call is already ${call.status}`, 400);
      }
      
      if (accept) {
        call.status = 'in_progress';
        call.startTime = new Date();
        
        // In a real app you would notify the member that the call has been accepted
        // this.notifyMember(call.member, 'call_accepted', { callId });
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
            provider: call.provider,
            reason: 'provider_rejected'
          }
        });
        
        await transaction.save();
        
        // In a real app you would notify the member that the call was rejected
        // this.notifyMember(call.member, 'call_rejected', { callId });
      }
      
      await call.save();
      
      return call;
    } catch (error) {
      logger.error(`Call response error: ${error.message}`);
      throw error;
    }
  }
  
  // Complete a call
  async completeCall(callId, callData) {
    try {
      const { actualDurationMinutes, rating, feedback } = callData;
      
      const call = await Call.findById(callId)
        .populate('serviceAd')
        .populate('provider');
      
      if (!call) {
        throw new AppError('Call not found', 404);
      }
      
      if (call.status !== 'in_progress' && call.status !== 'scheduled') {
        throw new AppError('Call is not in progress', 400);
      }
      
      call.endTime = new Date();
      call.status = 'completed';
      
      // Calculate actual duration in minutes
      if (actualDurationMinutes) {
        call.actualDuration = actualDurationMinutes;
      } else {
        const durationMs = call.endTime - call.startTime;
        call.actualDuration = Math.ceil(durationMs / (1000 * 60));
      }
      
      // Add rating and feedback if provided
      if (rating) call.rating = rating;
      if (feedback) call.feedback = feedback;
      
      await call.save();
      
      // Credit coins to provider
      const provider = await User.findById(call.provider);
      provider.coins += call.coinsUsed;
      await provider.save();
      
      // Create earnings transaction
      const transaction = new Transaction({
        user: call.provider._id,
        type: 'call_earnings',
        amount: 0,
        coins: call.coinsUsed,
        status: 'completed',
        callDetails: {
          serviceAd: call.serviceAd._id,
          member: call.member,
          duration: call.actualDuration
        }
      });
      
      await transaction.save();
      
      // In a real app, you would also close the Twilio room if it's still active
      try {
        await twilioClient.video.v1.rooms(call.twilioRoomSid).update({ status: 'completed' });
      } catch (twilioError) {
        logger.warn(`Error closing Twilio room: ${twilioError.message}`);
        // Non-fatal error, don't rethrow
      }
      
      return call;
    } catch (error) {
      logger.error(`Complete call error: ${error.message}`);
      throw error;
    }
  }
  
  // Check if call time is running out
  async checkCallTimeRemaining(callId) {
    try {
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
    } catch (error) {
      logger.error(`Check call time error: ${error.message}`);
      throw error;
    }
  }
  
  // Extend call duration with additional coins
  async extendCall(callId, memberId, additionalMinutes) {
    try {
      const call = await Call.findById(callId)
        .populate('serviceAd');
      
      if (!call || call.status !== 'in_progress') {
        throw new AppError('Call not found or not in progress', 404);
      }
      
      if (call.member.toString() !== memberId.toString()) {
        throw new AppError('Not authorized', 403);
      }
      
      // Get service details
      const serviceAd = call.serviceAd;
      
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
          serviceAd: call.serviceAd._id,
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
    } catch (error) {
      logger.error(`Extend call error: ${error.message}`);
      throw error;
    }
  }
  
  // Rate a completed call
  async rateCall(callId, memberId, ratingData) {
    try {
      const { rating, feedback } = ratingData;
      
      const call = await Call.findById(callId);
      
      if (!call) {
        throw new AppError('Call not found', 404);
      }
      
      if (call.member.toString() !== memberId.toString()) {
        throw new AppError('Not authorized', 403);
      }
      
      if (call.status !== 'completed') {
        throw new AppError('Cannot rate a call that is not completed', 400);
      }
      
      call.rating = rating;
      if (feedback) call.feedback = feedback;
      
      await call.save();
      
      // Update provider's average rating
      await this.updateProviderRating(call.provider);
      
      return call;
    } catch (error) {
      logger.error(`Rate call error: ${error.message}`);
      throw error;
    }
  }
  
  // Update provider's average rating
  async updateProviderRating(providerId) {
    try {
      // Get all rated calls for this provider
      const calls = await Call.find({
        provider: providerId,
        rating: { $exists: true, $ne: null }
      });
      
      if (calls.length === 0) {
        return;
      }
      
      // Calculate average rating
      const totalRating = calls.reduce((sum, call) => sum + call.rating, 0);
      const averageRating = totalRating / calls.length;
      
      // Update provider profile
      const provider = await User.findById(providerId);
      if (!provider.profile) {
        provider.profile = {};
      }
      
      provider.profile.averageRating = averageRating.toFixed(1);
      provider.profile.totalRatings = calls.length;
      
      await provider.save();
    } catch (error) {
      logger.error(`Update provider rating error: ${error.message}`);
      // Don't rethrow as this is a background operation
    }
  }
  
  // Get call history for a user
  async getCallHistory(userId, role, queryParams = {}) {
    try {
      const { page = 1, limit = 10, status } = queryParams;
      
      // Build filter based on user role
      let filter = {};
      
      if (role === 'member') {
        filter.member = userId;
      } else if (role === 'user') {
        filter.provider = userId;
      } else {
        throw new AppError('Invalid role', 400);
      }
      
      // Add status filter if provided
      if (status) {
        filter.status = status;
      }
      
      // Count total documents
      const total = await Call.countDocuments(filter);
      
      // Get paginated calls
      const calls = await Call.find(filter)
        .populate('serviceAd', 'title hourlyRate')
        .populate('provider', 'profile')
        .populate('member', 'profile')
        .sort({ startTime: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
      
      return {
        calls,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error(`Get call history error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new CallService();