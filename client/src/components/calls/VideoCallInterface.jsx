// Enhanced VideoCallInterface.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Paper, Grid, Avatar, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, IconButton } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import { callService, serviceAdService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const VideoCallInterface = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { currentUser, updateCoins } = useAuth();
  
  // State variables
  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [callStatus, setCallStatus] = useState('preparing'); // preparing, connecting, active, ended
  const [callData, setCallData] = useState(null);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [extensionMinutes, setExtensionMinutes] = useState(5);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warningShown, setWarningShown] = useState(false);
  const [coinCost, setCoinCost] = useState(0);
  
  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const timerRef = useRef(null);
  const roomRef = useRef(null);
  const localTracksRef = useRef([]);
  const screenShareTrackRef = useRef(null);
  
  // Fetch service details
  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        const response = await serviceAdService.getServiceById(serviceId);
        setService(response.data);
        setProvider(response.data.provider);
        
        // Calculate coin cost
        const cost = Math.ceil(response.data.hourlyRate * (durationMinutes / 60));
        setCoinCost(cost);
        
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
    
    // Stop screen sharing if active
    if (screenShareTrackRef.current) {
      screenShareTrackRef.current.stop();
      screenShareTrackRef.current = null;
    }
    
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
    if (currentUser.coins < coinCost) {
      setError(`Insufficient coins. You need ${coinCost} coins for this call.`);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Call API to initiate call
      const response = await callService.initiateCall({
        serviceAdId: serviceId,
        durationMinutes
      });
      
      setCallData(response.data);
      
      // Connect to Twilio room using the provided token
      await connectToTwilioRoom(response.data.twilioToken);
      
      setCallStatus('connecting');
      
      // Update user's coin balance
      updateCoins(response.data.remainingCoins);
      
      // After a short delay, consider the call active (in a real app, this would happen when the provider accepts)
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
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      
      localTracksRef.current = tracks;
      
      // Attach local video to DOM
      const videoTrack = tracks.find(track => track.kind === 'video');
      if (videoTrack) {
        const videoElement = videoTrack.attach();
        videoElement.classList.add('local-video-element');
        localVideoRef.current.appendChild(videoElement);
      }
      
      // Connect to the Twilio room
      const room = await connect(token, {
        name: callData.twilioRoom,
        tracks,
        bandwidthProfile: {
          video: {
            mode: 'collaboration',
            dominantSpeakerPriority: 'high',
            renderDimensions: {
              high: { width: 1280, height: 720 },
              standard: { width: 640, height: 480 },
              low: { width: 320, height: 240 }
            }
          }
        },
        networkQuality: { local: 1, remote: 1 }
      });
      
      roomRef.current = room;
      
      // Handle remote participant connections
      room.participants.forEach(participant => {
        handleParticipantConnected(participant);
      });
      
      room.on('participantConnected', handleParticipantConnected);
      room.on('participantDisconnected', handleParticipantDisconnected);
      room.on('disconnected', handleRoomDisconnected);
      
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
    participantDiv.classList.add('remote-participant');
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
    if (track.kind === 'video') {
      element.classList.add('remote-video-element');
    }
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
  
  // Handle room disconnection
  const handleRoomDisconnected = (room, error) => {
    if (error) {
      console.error('Room disconnected with error:', error);
    }
    
    // Clean up all participants' elements
    room.participants.forEach(participant => {
      document.getElementById(participant.sid)?.remove();
    });
    
    // If call was active and not ended by user, show error
    if (callStatus === 'active') {
      setError('Call disconnected unexpectedly. Please try reconnecting.');
      setCallStatus('ended');
    }
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
  
  // Toggle screen sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenShareTrackRef.current) {
        screenShareTrackRef.current.stop();
        
        // Get the video track that was replaced by screen sharing
        const videoTrack = localTracksRef.current.find(track => track.kind === 'video');
        if (videoTrack && roomRef.current) {
          // Republish the video track
          roomRef.current.localParticipant.publishTrack(videoTrack);
        }
        
        screenShareTrackRef.current = null;
      }
    } else {
      try {
        // Request screen share
        const { createLocalVideoTrack } = await import('twilio-video');
        const screenTrack = await createLocalVideoTrack({
          name: 'screen',
          height: 720,
          width: 1280,
          video: { source: 'screen' }
        });
        
        screenShareTrackRef.current = screenTrack;
        
        // Unpublish the camera video track
        const videoTrack = localTracksRef.current.find(track => track.kind === 'video');
        if (videoTrack && roomRef.current) {
          roomRef.current.localParticipant.unpublishTrack(videoTrack);
        }
        
        // Publish the screen share track
        if (roomRef.current) {
          roomRef.current.localParticipant.publishTrack(screenTrack);
        }
        
        // Listen for the user ending screen sharing via browser UI
        screenTrack.addEventListener('stopped', () => {
          setIsScreenSharing(false);
          screenShareTrackRef.current = null;
          
          // Republish camera track
          if (videoTrack && roomRef.current) {
            roomRef.current.localParticipant.publishTrack(videoTrack);
          }
        });
      } catch (err) {
        console.error('Screen sharing error:', err);
        setError('Failed to share screen: ' + err.message);
      }
    }
    
    setIsScreenSharing(!isScreenSharing);
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
      
      // Calculate additional cost
      const additionalCost = Math.ceil(service.hourlyRate * (extensionMinutes / 60));
      
      // Check if user has enough coins
      if (currentUser.coins < additionalCost) {
        setError(`Insufficient coins. You need ${additionalCost} more coins to extend the call.`);
        return;
      }
      
      // Call API to extend call
      const response = await callService.extendCall(callData.call._id, extensionMinutes);
      
      // Update duration
      setDurationMinutes(prev => prev + extensionMinutes);
      setWarningShown(false);
      
      // Update user's coin balance
      updateCoins(response.data.remainingCoins);
      
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
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (remoteVideoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        remoteVideoRef.current.requestFullscreen();
      }
    }
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
              
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Service Details:
              </Typography>
              <Typography variant="body1" paragraph>
                {service.serviceDetails}
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
              
              {currentUser.coins < coinCost && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  You don't have enough coins for this call. Please purchase more coins or select a shorter duration.
                </Alert>
              )}
              
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
                  disabled={loading || currentUser.coins < coinCost}
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
                    {provider?.profile?.bio?.substring(0, 50)}...
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Your Balance:
              </Typography>
              <Typography variant="h6" color="primary" gutterBottom>
                {currentUser.coins} coins
              </Typography>
              
              {currentUser.coins < coinCost && (
                <Button 
                  variant="contained" 
                  color="secondary" 
                  fullWidth
                  onClick={() => navigate('/member/coins/purchase')}
                  sx={{ mt: 1 }}
                >
                  Purchase Coins
                </Button>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Connection Information:
              </Typography>
              <Typography variant="body2" paragraph>
                This call uses secure end-to-end encrypted video via Twilio.
              </Typography>
              <Typography variant="body2">
                Call quality may vary based on your internet connection. A minimum speed of 1Mbps is recommended.
              </Typography>
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
                overflow: 'hidden',
                '& .remote-video-element': {
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                },
                '& .remote-participant': {
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }
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
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Please wait while we establish a secure connection
                  </Typography>
                </Box>
              )}
              
              <IconButton
                onClick={toggleFullscreen}
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.7)'
                  }
                }}
              >
                <FullscreenIcon />
              </IconButton>
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
                border: '2px solid white',
                '& .local-video-element': {
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
              bgcolor: 'background.paper',
              borderRadius: 2,
              mt: 2
            }}>
              <Button 
                variant="contained" 
                color={isMuted ? 'error' : 'primary'}
                onClick={toggleMute}
                startIcon={isMuted ? <MicOffIcon /> : <MicIcon />}
                sx={{ borderRadius: 8, px: 3 }}
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </Button>
              
              <Button 
                variant="contained" 
                color={isVideoOff ? 'error' : 'primary'}
                onClick={toggleVideo}
                startIcon={isVideoOff ? <VideocamOffIcon /> : <VideocamIcon />}
                sx={{ borderRadius: 8, px: 3 }}
              >
                {isVideoOff ? 'Start Video' : 'Stop Video'}
              </Button>
              
              <Button 
                variant="contained" 
                color={isScreenSharing ? 'secondary' : 'primary'}
                onClick={toggleScreenShare}
                startIcon={isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                sx={{ borderRadius: 8, px: 3 }}
              >
                {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
              </Button>
              
              <Button 
                variant="contained" 
                color="error"
                onClick={endCall}
                startIcon={<CallEndIcon />}
                sx={{ borderRadius: 8, px: 3 }}
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
          
          <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="primary.contrastText">
              Your current balance: {currentUser.coins} coins
            </Typography>
          </Box>
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

export default VideoCallInterface;