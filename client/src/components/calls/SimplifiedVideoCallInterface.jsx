// client/src/components/calls/SimplifiedVideoCallInterface.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Paper, Grid, Avatar, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { useAuth } from '../../contexts/AuthContext';

const SimplifiedVideoCallInterface = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // State variables
  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [callStatus, setCallStatus] = useState('preparing'); // preparing, connecting, active, ended
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coinCost, setCoinCost] = useState(0);
  
  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const timerRef = useRef(null);
  
  // Mock service data
  useEffect(() => {
    setTimeout(() => {
      const mockService = {
        _id: serviceId,
        title: 'Professional Consulting Service',
        description: 'Expert advice and guidance for your business needs',
        hourlyRate: 60,
        categories: ['Business Consulting'],
        provider: {
          _id: 'provider_1',
          profile: {
            firstName: 'John',
            lastName: 'Expert',
            profileImage: null
          },
          isVerified: true
        }
      };
      
      setService(mockService);
      setProvider(mockService.provider);
      
      // Calculate coin cost
      const cost = Math.ceil(mockService.hourlyRate * (durationMinutes / 60));
      setCoinCost(cost);
      
      setLoading(false);
    }, 1000);
    
    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [serviceId]);
  
  // Update coin cost when duration changes
  useEffect(() => {
    if (service) {
      const cost = Math.ceil(service.hourlyRate * (durationMinutes / 60));
      setCoinCost(cost);
    }
  }, [durationMinutes, service]);
  
  // Start timer when call becomes active
  useEffect(() => {
    if (callStatus === 'active' && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;
          
          // Check if call time is up
          if (newTime >= durationMinutes * 60) {
            endCall();
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [callStatus, durationMinutes]);
  
  // Initialize call (simulated)
  const initiateCall = async () => {
    if (!currentUser || currentUser.coins < coinCost) {
      setError(`Insufficient coins. You need ${coinCost} coins for this call.`);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Simulate API call
      setTimeout(() => {
        // In a real implementation, this would use the browser's getUserMedia API
        // and connect to Twilio or another video service
        
        setCallStatus('connecting');
        
        // After a short delay, consider the call active
        setTimeout(() => {
          setCallStatus('active');
          
          // Mock video elements
          if (localVideoRef.current) {
            const mockLocalVideo = document.createElement('div');
            mockLocalVideo.style.width = '100%';
            mockLocalVideo.style.height = '100%';
            mockLocalVideo.style.backgroundColor = '#333';
            mockLocalVideo.textContent = 'Your video';
            mockLocalVideo.style.display = 'flex';
            mockLocalVideo.style.alignItems = 'center';
            mockLocalVideo.style.justifyContent = 'center';
            mockLocalVideo.style.color = 'white';
            localVideoRef.current.appendChild(mockLocalVideo);
          }
          
          if (remoteVideoRef.current) {
            const mockRemoteVideo = document.createElement('div');
            mockRemoteVideo.style.width = '100%';
            mockRemoteVideo.style.height = '100%';
            mockRemoteVideo.style.backgroundColor = '#222';
            mockRemoteVideo.textContent = `${provider.profile.firstName}'s video`;
            mockRemoteVideo.style.display = 'flex';
            mockRemoteVideo.style.alignItems = 'center';
            mockRemoteVideo.style.justifyContent = 'center';
            mockRemoteVideo.style.color = 'white';
            remoteVideoRef.current.appendChild(mockRemoteVideo);
          }
        }, 2000);
        
        setLoading(false);
      }, 1500);
      
    } catch (err) {
      setError('Failed to initiate call: ' + err.message);
      setLoading(false);
    }
  };
  
  // End the call
  const endCall = async () => {
    try {
      setLoading(true);
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Update call status
      setCallStatus('ended');
      
      // Clear video elements
      if (localVideoRef.current) {
        localVideoRef.current.innerHTML = '';
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.innerHTML = '';
      }
      
      // Show rating dialog
      setShowRatingDialog(true);
      
    } catch (err) {
      setError('Error ending call: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle audio mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    // In a real implementation, this would control the audio track
  };
  
  // Toggle video
  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    // In a real implementation, this would control the video track
  };
  
  // Submit rating and feedback
  const submitRating = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        // Navigate back to services
        navigate('/member/services');
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      setError('Failed to submit rating: ' + err.message);
      setLoading(false);
    }
  };
  
  // Format time display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle duration change
  const handleDurationChange = (event) => {
    setDurationMinutes(parseInt(event.target.value));
  };
  
  if (loading && !service) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error && callStatus === 'preparing') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={() => navigate('/member/services')}>
          Back to Services
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      {callStatus === 'preparing' && service && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>Start Call with {provider?.profile?.firstName}</Typography>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">{service.title}</Typography>
                <Chip 
                  label={`${service.hourlyRate} coins/hour`} 
                  color="primary" 
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
              
              <Typography variant="body1" paragraph>
                {service.description}
              </Typography>
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Select Call Duration</Typography>
              <Box sx={{ mb: 3 }}>
                <select 
                  value={durationMinutes} 
                  onChange={handleDurationChange}
                  style={{ padding: '10px', width: '100%', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="5">5 minutes ({Math.ceil(service.hourlyRate * (5/60))} coins)</option>
                  <option value="15">15 minutes ({Math.ceil(service.hourlyRate * (15/60))} coins)</option>
                  <option value="30">30 minutes ({Math.ceil(service.hourlyRate * (30/60))} coins)</option>
                  <option value="60">60 minutes ({service.hourlyRate} coins)</option>
                </select>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                p: 2,
                borderRadius: 1,
                mb: 3
              }}>
                <Typography variant="subtitle1">
                  Total cost for this call:
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {coinCost} coins
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/member/services')}
                  sx={{ flexGrow: 1 }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  onClick={initiateCall}
                  disabled={loading}
                  sx={{ flexGrow: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Start Call Now'}
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  src={provider?.profile?.profileImage || '/assets/images/default-avatar.png'} 
                  sx={{ width: 80, height: 80, mr: 2 }}
                />
                <Box>
                  <Typography variant="h6">{provider?.profile?.firstName} {provider?.profile?.lastName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Expert Consultant
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {(callStatus === 'connecting' || callStatus === 'active') && (
        <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                src={provider?.profile?.profileImage || '/assets/images/default-avatar.png'}
                sx={{ width: 40, height: 40, mr: 2 }}
              />
              <Typography variant="h6">
                {provider?.profile?.firstName} {provider?.profile?.lastName}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip 
                label={callStatus === 'connecting' ? 'Connecting...' : 'Active Call'} 
                color={callStatus === 'connecting' ? 'warning' : 'success'} 
              />
              <Chip 
                label={`Time Remaining: ${formatTime((durationMinutes * 60) - elapsedTime)}`} 
                color="primary"
                variant="outlined"
              />
            </Box>
          </Paper>
          
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {/* Remote video (takes most space) */}
            <Box 
              ref={remoteVideoRef} 
              sx={{ 
                flex: 1, 
                bgcolor: 'black',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              {callStatus === 'connecting' && (
                <Box sx={{ 
                  position: 'absolute', 
                  top: 0, left: 0, right: 0, bottom: 0, 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  bgcolor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  zIndex: 2
                }}>
                  <CircularProgress color="inherit" sx={{ mb: 2 }} />
                  <Typography variant="h6">Connecting to {provider?.profile?.firstName}...</Typography>
                </Box>
              )}
            </Box>
            
            {/* Local video (small overlay) */}
            <Box 
              ref={localVideoRef} 
              sx={{ 
                position: 'absolute', 
                width: '20%', 
                maxWidth: 200,
                minWidth: 160,
                height: 'auto',
                aspectRatio: '16/9',
                bottom: 80, 
                right: 20, 
                bgcolor: 'black',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 3,
                border: '2px solid white'
              }}
            />
            
            {/* Call controls */}
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2,
              bgcolor: 'background.paper',
              borderRadius: 2,
              mt: 2
            }}>
              <Button 
                variant="contained" 
                color={isMuted ? 'error' : 'primary'}
                onClick={toggleMute}
                startIcon={isMuted ? <MicOffIcon /> : <MicIcon />}
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </Button>
              
              <Button 
                variant="contained" 
                color={isVideoOff ? 'error' : 'primary'}
                onClick={toggleVideo}
                startIcon={isVideoOff ? <VideocamOffIcon /> : <VideocamIcon />}
              >
                {isVideoOff ? 'Start Video' : 'Stop Video'}
              </Button>
              
              <Button 
                variant="contained" 
                color="error"
                onClick={endCall}
                startIcon={<CallEndIcon />}
              >
                End Call
              </Button>
            </Box>
          </Box>
          
          {/* Error message if any */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
          )}
        </Box>
      )}
      
      {/* Rating dialog */}
      <Dialog open={showRatingDialog} onClose={() => setShowRatingDialog(false)}>
        <DialogTitle>Rate your call with {provider?.profile?.firstName}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Your call has ended. Please rate your experience.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Box
                key={star}
                onClick={() => setRating(star)}
                sx={{
                  cursor: 'pointer',
                  fontSize: '2.5rem',
                  color: star <= rating ? 'gold' : 'gray',
                  '&:hover': {
                    transform: 'scale(1.2)'
                  }
                }}
              >
                ★
              </Box>
            ))}
          </Box>
          
          <TextField
            label="Feedback (optional)"
            multiline
            rows={4}
            fullWidth
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your experience with this service provider..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate('/member/services')}>Skip</Button>
          <Button onClick={submitRating} variant="contained" color="primary">
            Submit Rating
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SimplifiedVideoCallInterface;