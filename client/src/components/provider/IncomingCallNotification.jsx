// client/src/components/provider/IncomingCallNotification.jsx
import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Typography, Avatar, Box, CircularProgress 
} from '@mui/material';
import { callService } from '../../services/api';

const IncomingCallNotification = ({ call, onAccept, onReject }) => {
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30); // 30 seconds to respond
  
  // Auto-reject call if not answered within time limit
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      handleReject();
    }
  }, [countdown]);
  
  const handleAccept = async () => {
    try {
      setLoading(true);
      await callService.respondToCall(call._id, true);
      onAccept(call);
    } catch (error) {
      console.error('Error accepting call:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleReject = async () => {
    try {
      setLoading(true);
      await callService.respondToCall(call._id, false);
      onReject(call);
    } catch (error) {
      console.error('Error rejecting call:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={true} maxWidth="sm" fullWidth>
      <DialogTitle>Incoming Call</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={call.member.profile?.profileImage || '/assets/images/default-avatar.png'}
            sx={{ width: 64, height: 64, mr: 2 }}
          />
          <Box>
            <Typography variant="h6">
              {call.member.profile?.firstName} {call.member.profile?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Member
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="body1" gutterBottom>
          Service: <strong>{call.serviceAd.title}</strong>
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Duration: <strong>{call.scheduledDuration} minutes</strong>
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Earnings: <strong>{call.coinsUsed} coins</strong>
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Typography variant="h6">
            Automatically rejecting in: {countdown} seconds
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 3 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={handleReject}
          disabled={loading}
        >
          Reject
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleAccept}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Accept Call'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IncomingCallNotification;