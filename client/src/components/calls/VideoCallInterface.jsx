// client/src/components/calls/VideoCallInterface.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Paper, Grid, Avatar, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { callService, serviceAdService } from '../../services/api';

const VideoCallInterface = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  
  // State variables
  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [callStatus, setCallStatus] = useState('preparing'); // preparing, connecting, active, ended
  const [callData, setCallData] = useState(null);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [extensionMinutes, setExtensionMinutes] = useState(5);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warningShown, setWarningShown] = useState(false);
  
  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const timerRef = useRef(null);
  const roomRef = useRef(null);
  const localTracksRef = useRef([]);
  
  // Fetch service details
  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        const response = await serviceAdService.getServiceById(serviceId);
        setService(response.data);
        setProvider(response.data.provider);
        setLoading(false);
      } catch (err) {
        setError('Failed to load service details: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };
    
    fetchServiceDetails();
    
    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      disconnectFromCall();
    };
  }, [serviceId]);
  
  // Start timer when call becomes active
  useEffect(() => {
    if (callStatus === 'active' && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;
          
          // Check if warning needs to be shown (2 minutes before end)
          if (!warningShown && newTime >= (durationMinutes * 60 - 120)) {
            setWarningShown(true);
            setShowExtendDialog(true);
          }
          
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
  }, [callStatus, durationMinutes, warningShown]);
  
  // Disconnect from Twilio room
  const disconnectFromCall = () => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    
    // Stop and release local tracks
    localTracksRef.current.forEach(track => {
      track.stop();
    });
    localTracksRef.current = [];
    
    // Clear DOM elements
    if (localVideoRef.current) {
      localVideoRef.current.innerHTML = '';
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.innerHTML = '';
    }
  };
  
  // Initialize call
  const initiateCall = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Call API to initiate call
      const response = await callService.initiateCall({
        serviceAdId: serviceId,
        durationMinutes
      });
      
      setCallData(response.data);
      
      // Connect to Twilio room
      await connectToTwilioRoom(response.data.memberToken);
      
      setCallStatus('connecting');
      
      // After a short delay, consider the call active
      // In a real implementation, this would be based on provider accepting the call
      setTimeout(() => {
        setCallStatus('active');
      }, 3000);
      
    } catch (err) {
      setError('Failed to initiate call: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Connect to Twilio video room
  const connectToTwilioRoom = async (token) => {
    try {
      // Import Twilio Video dynamically to reduce initial bundle size
      const { connect, createLocalTracks } = await import('twilio-video');
      
      // Get local video and audio tracks
      const tracks = await createLocalTracks({
        audio: true,
        video: { width: 640, height: 480 }
      });
      
      localTracksRef.current = tracks;
      
      // Attach local video to DOM
      const videoTrack = tracks.find(track => track.kind === 'video');
      const audioTrack = tracks.find(track => track.kind === 'audio');
      
      if (videoTrack) {
        const videoElement = videoTrack.attach();
        localVideoRef.current.appendChild(videoElement);
      }
      
      // Connect to the room
      const room = await connect(token, {
        name: callData.twilioRoom,
        tracks
      });
      
      roomRef.current = room;
      
      // Handle remote participant connections
      room.participants.forEach(participant => {
        handleParticipantConnected(participant);
      });
      
      room.on('participantConnected', handleParticipantConnected);
      room.on('participantDisconnected', handleParticipantDisconnected);
      
    } catch (err) {
      console.error('Error connecting to Twilio room:', err);
      setError('Failed to connect to video call: ' + err.message);
    }
  };
  
  // Handle remote participant connection
  const handleParticipantConnected = (participant) => {
    // Create div for participant's video
    const participantDiv = document.createElement('div');
    participantDiv.id = participant.sid;
    remoteVideoRef.current.appendChild(participantDiv);
    
    // Handle participant's existing tracks
    participant.tracks.forEach(publication => {
      if (publication.isSubscribed) {
        handleTrackSubscribed(participantDiv, publication.track);
      }
    });
    
    // Handle participant's track subscriptions
    participant.on('trackSubscribed', track => {
      handleTrackSubscribed(participantDiv, track);
    });
    
    // Handle participant's track unsubscriptions
    participant.on('trackUnsubscribed', track => {
      handleTrackUnsubscribed(track);
    });
  };
  
  // Handle track subscribed event
  const handleTrackSubscribed = (div, track) => {
    const element = track.attach();
    div.appendChild(element);
  };
  
  // Handle track unsubscribed event
  const handleTrackUnsubscribed = (track) => {
    track.detach().forEach(element => element.remove());
  };
  
  // Handle participant disconnection
  const handleParticipantDisconnected = (participant) => {
    document.getElementById(participant.sid)?.remove();
  };
  
  // Toggle audio mute
  const toggleMute = () => {
    const audioTrack = localTracksRef.current.find(track => track.kind === 'audio');
    if (audioTrack) {
      if (isMuted) {
        audioTrack.enable();
      } else {
        audioTrack.disable();
      }
      setIsMuted(!isMuted);
    }
  };
  
  // Toggle video
  const toggleVideo = () => {
    const videoTrack = localTracksRef.current.find(track => track.kind === 'video');
    if (videoTrack) {
      if (isVideoOff) {
        videoTrack.enable();
      } else {
        videoTrack.disable();
      }
      setIsVideoOff(!isVideoOff);
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
      
      // Disconnect from Twilio room
      disconnectFromCall();
      
      // Update call status
      setCallStatus('ended');
      
      // Complete call in backend
      if (callData) {
        await callService.completeCall(callData.call._id, {
          actualDurationMinutes: Math.ceil(elapsedTime / 60)
        });
      }
      
      // Show rating dialog
      setShowRatingDialog(true);
      
    } catch (err) {
      setError('Error ending call: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Extend call duration
  const extendCall = async () => {
    try {
      setLoading(true);
      
      // Call API to extend call
      const response = await callService.extendCall(callData.call._id, extensionMinutes);
      
      // Update duration
      setDurationMinutes(prev => prev + extensionMinutes);
      setWarningShown(false);
      
      // Close dialog
      setShowExtendDialog(false);
      
    } catch (err) {
      setError('Failed to extend call: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Submit rating and feedback
  const submitRating = async () => {
    try {
      setLoading(true);
      
      if (callData) {
        await callService.rateCall(callData.call._id, {
          rating,
          feedback
        });
      }
      
      // Navigate back to services
      navigate('/member/services');
      
    } catch (err) {
      setError('Failed to submit rating: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setShowRatingDialog(false);
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
              <Typography variant="h5">{service.title}</Typography>
              <Chip 
                label={`${service.hourlyRate} coins/hour`} 
                color="primary" 
                sx={{ mt: 1, mb: 2 }}
              />
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
                  style={{ padding: '8px', width: '100%', fontSize: '16px' }}
                >
                  <option value="5">5 minutes ({Math.ceil(service.hourlyRate * (5/60))} coins)</option>
                  <option value="15">15 minutes ({Math.ceil(service.hourlyRate * (15/60))} coins)</option>
                  <option value="30">30 minutes ({Math.ceil(service.hourlyRate * (30/60))} coins)</option>
                  <option value="60">60 minutes ({service.hourlyRate} coins)</option>
                </select>
              </Box>
              
              <Button 
                variant="contained" 
                fullWidth 
                size="large"
                onClick={initiateCall}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Start Call Now'}
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  src={provider?.profile?.profileImage || '/assets/images/default-avatar.png'} 
                  sx={{ width: 60, height: 60, mr: 2 }}
                />
                <Box>
                  <Typography variant="h6">{provider?.profile?.firstName} {provider?.profile?.lastName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {provider?.profile?.bio?.substring(0, 50)}...
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body2" paragraph>
                Rating: 4.8/5 (24 reviews)
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {(callStatus === 'connecting' || callStatus === 'active') && (
        <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Call with {provider?.profile?.firstName} {provider?.profile?.lastName}
            </Typography>
            
            <Box>
              <Chip 
                label={callStatus === 'connecting' ? 'Connecting...' : 'Active Call'} 
                color={callStatus === 'connecting' ? 'warning' : 'success'} 
                sx={{ mr: 2 }}
              />
              <Chip 
                label={`Time Remaining: ${formatTime((durationMinutes * 60) - elapsedTime)}`} 
                color="primary"
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
                position: 'relative'
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
                bottom: 20, 
                right: 20, 
                bgcolor: 'black',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 3,
                '& video': {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }
              }}
            />
            
            {/* Call controls */}
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2,
              bgcolor: 'background.paper'
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
                color="error"
                onClick={endCall}
                startIcon={<CallEndIcon />}
              >
                End Call
              </Button>
              
              <Button 
                variant="contained" 
                color={isVideoOff ? 'error' : 'primary'}
                onClick={toggleVideo}
                startIcon={isVideoOff ? <VideocamOffIcon /> : <VideocamIcon />}
              >
                {isVideoOff ? 'Start Video' : 'Stop Video'}
              </Button>
            </Box>
          </Box>
          
          {/* Error message if any */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
          )}
        </Box>
      )}
      
      {/* Extend call dialog */}
      <Dialog open={showExtendDialog} onClose={() => setShowExtendDialog(false)}>
        <DialogTitle>Call time is running out</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            You have about 2 minutes left in your call. Would you like to extend the duration?
          </Typography>
          <TextField
            select
            label="Additional Minutes"
            value={extensionMinutes}
            onChange={(e) => setExtensionMinutes(parseInt(e.target.value))}
            fullWidth
            SelectProps={{
              native: true,
            }}
          >
            <option value={5}>5 minutes ({Math.ceil(service?.hourlyRate * (5/60))} coins)</option>
            <option value={15}>15 minutes ({Math.ceil(service?.hourlyRate * (15/60))} coins)</option>
            <option value={30}>30 minutes ({Math.ceil(service?.hourlyRate * (30/60))} coins)</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExtendDialog(false)}>Cancel</Button>
          <Button onClick={extendCall} variant="contained" color="primary">
            Extend Call
          </Button>
        </DialogActions>
      </Dialog>
      
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
                  fontSize: '2rem',
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

export default VideoCallInterface;