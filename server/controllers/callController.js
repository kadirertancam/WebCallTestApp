// Enhanced callController.js
const callService = require('../services/callService');
const { validationResult } = require('express-validator');
const logger = require('../config/logger');

// Initiate a call
exports.initiateCall = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { serviceAdId, durationMinutes } = req.body;
    
    // Call service to initiate call
    const callData = await callService.initiateCall(
      req.user.id,
      serviceAdId,
      durationMinutes
    );
    
    res.status(201).json({
      success: true,
      message: 'Call initiated successfully',
      ...callData
    });
  } catch (err) {
    logger.error(`Initiate call error: ${err.message}`);
    res.status(err.statusCode || 500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Respond to a call (accept/reject)
exports.respondToCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const { accept } = req.body;
    
    const call = await callService.respondToCall(
      callId,
      req.user.id,
      accept
    );
    
    res.json({
      success: true,
      message: `Call ${accept ? 'accepted' : 'rejected'} successfully`,
      call
    });
  } catch (err) {
    logger.error(`Respond to call error: ${err.message}`);
    res.status(err.statusCode || 500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Complete a call
exports.completeCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const { actualDurationMinutes, rating, feedback } = req.body;
    
    const call = await callService.completeCall(callId, {
      actualDurationMinutes,
      rating,
      feedback
    });
    
    res.json({
      success: true,
      message: 'Call completed successfully',
      call
    });
  } catch (err) {
    logger.error(`Complete call error: ${err.message}`);
    res.status(err.statusCode || 500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Extend call duration
exports.extendCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const { additionalMinutes } = req.body;
    
    if (!additionalMinutes || additionalMinutes <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid additional minutes required'
      });
    }
    
    const result = await callService.extendCall(
      callId,
      req.user.id,
      additionalMinutes
    );
    
    res.json({
      success: true,
      message: 'Call extended successfully',
      ...result
    });
  } catch (err) {
    logger.error(`Extend call error: ${err.message}`);
    res.status(err.statusCode || 500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Rate a call
exports.rateCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const { rating, feedback } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    const call = await callService.rateCall(callId, req.user.id, {
      rating,
      feedback
    });
    
    res.json({
      success: true,
      message: 'Call rated successfully',
      call
    });
  } catch (err) {
    logger.error(`Rate call error: ${err.message}`);
    res.status(err.statusCode || 500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get call history
exports.getCallHistory = async (req, res) => {
  try {
    const result = await callService.getCallHistory(
      req.user.id,
      req.user.role,
      req.query
    );
    
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    logger.error(`Get call history error: ${err.message}`);
    res.status(err.statusCode || 500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Webhook for Twilio call events
exports.twilioWebhook = async (req, res) => {
  try {
    const { RoomName, RoomStatus, RoomSid } = req.body;
    
    // Log the event
    logger.info(`Twilio webhook: Room ${RoomName} (${RoomSid}) status changed to ${RoomStatus}`);
    
    // Handle room completion
    if (RoomStatus === 'completed') {
      // Find the call by Twilio room SID
      const call = await Call.findOne({ twilioRoomSid: RoomSid });
      
      if (call && call.status === 'in_progress') {
        // Complete the call
        await callService.completeCall(call._id, {});
      }
    }
    
    res.status(200).send('OK');
  } catch (err) {
    logger.error(`Twilio webhook error: ${err.message}`);
    res.status(200).send('Error processed'); // Always return 200 to Twilio
  }
};