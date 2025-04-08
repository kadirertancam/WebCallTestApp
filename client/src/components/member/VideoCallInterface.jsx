// client/src/components/member/VideoCallInterface.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { callService, serviceAdService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Video } from 'twilio-video';
import CallControls from './CallControls';
import CallTimer from './CallTimer';
import RatingDialog from './RatingDialog';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorBoundary from '../common/ErrorBoundary';

const VideoCallInterface = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { currentUser, updateCoins } = useAuth();
  
  const [service, setService] = useState(null);
  const [callStatus, setCallStatus] = useState('preparing'); 
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activeCall, setActiveCall] = useState(null);
  const [twilioRoom, setTwilioRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const timerRef = useRef(null);
  
  // Fetch service details
  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await serviceAdService.getAllAds({ serviceId });
        if (response.data && response.data.length > 0) {
          setService(response.data[0]);
        } else {
          throw new Error('Service not found');
        }
      } catch (err) {
        setError('Failed to load service details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchService();
    
    // Cleanup resources on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Disconnect from Twilio room if active
      if (twilioRoom) {
        twilioRoom.disconnect();
      }
    };
  }, [serviceId]);
  
  // Handle participants in Twilio room
  useEffect(() => {
    if (!twilioRoom) return;
    
    const participantConnected = participant => {
      setParticipants(prevParticipants => [...prevParticipants, participant]);
      
      // When a participant connects, set up their video
      participant.tracks.forEach(publication => {
        if (publication.isSubscribed) {
          const track = publication.track;
          if (track.kind === 'video' && remoteVideoRef.current) {
            remoteVideoRef.current.appendChild(track.attach());
          }
        }
      });
      
      participant.on('trackSubscribed', track => {
        if (track.kind === 'video' && remoteVideoRef.current) {
          remoteVideoRef.current.appendChild(track.attach());
        }
      });
    };
    
    const participantDisconnected = participant => {
      setParticipants(prevParticipants => 
        prevParticipants.filter(p => p !== participant)
      );
      
      // When a participant disconnects, clean up their video
      participant.tracks.forEach(publication => {
        if (publication.track) {
          const attachedElements = publication.track.detach();
          attachedElements.forEach(element => element.remove());
        }
      });
    };
    
    // Set up event listeners for the room
    twilioRoom.on('participantConnected', participantConnected);
    twilioRoom.on('participantDisconnected', participantDisconnected);
    
    // Add any participants already in the room
    twilioRoom.participants.forEach(participantConnected);
    
    return () => {
      twilioRoom.off('participantConnected', participantConnected);
      twilioRoom.off('participantDisconnected', participantDisconnected);
    };
  }, [twilioRoom]);
  
  // Start call timer when call becomes active
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
  
  // Handle initiating call
  const initiateCall = async () => {
    try {
      setLoading(true);
      
      const response = await callService.initiateCall({
        serviceAdId: service._id,
        durationMinutes
      });
      
      setActiveCall(response.data.call);
      updateCoins(response.data.remainingCoins);
      
      // Connect to Twilio room
      const twilioToken = response.data.twilioToken;
      
      // Get local video and audio tracks
      const localTracks = await Video.createLocalTracks({
        audio: true,
        video: { width: 640 }
      });
      
      // Attach local video to the page
      const videoTrack = localTracks.find(track => track.kind === 'video');
      if (videoTrack && localVideoRef.current) {
        localVideoRef.current.appendChild(videoTrack.attach());
      }
      
      // Connect to Twilio room
      const room = await Video.connect(twilioToken, {
        name: `call-${response.data.call._id}`,
        tracks: localTracks
      });
      
      setTwilioRoom(room);
      setCallStatus('connecting');
      
      // After a short delay, consider the call active
      setTimeout(() => {
        setCallStatus('active');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate call');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle ending call
  const endCall = async () => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Disconnect from Twilio room
      if (twilioRoom) {
        twilioRoom.disconnect();
      }
      
      setCallStatus('ended');
      
      if (activeCall) {
        await callService.completeCall(activeCall._id, {
          actualDurationMinutes: Math.ceil(elapsedTime / 60)
        });
      }
      
      // Show rating dialog
      setShowRatingDialog(true);
      
    } catch (err) {
      console.error('Error ending call:', err);
      setError('Failed to properly end call');
    }
  };
  
  // Handle submitting rating
  const handleRatingSubmit = async (rating, feedback) => {
    try {
      if (activeCall) {
        await callService.completeCall(activeCall._id, {
          actualDurationMinutes: Math.ceil(elapsedTime / 60),
          rating,
          feedback
        });
      }
      
      setShowRatingDialog(false);
      navigate('/member/services');
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError('Failed to submit rating');
    }
  };
  
  // Handle duration change
  const handleDurationChange = (e) => {
    setDurationMinutes(parseInt(e.target.value));
  };
  
  if (loading && !service) {
    return <LoadingSpinner message="Loading service details..." />;
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/member/services')}
        >
          Back to Services
        </button>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <div className="video-call-interface">
        {callStatus === 'preparing' && (
          <div className="call-setup">
            <div className="service-details card">
              <h2>{service.title}</h2>
              <div className="provider-info">
                <img 
                  src={service.provider.profile.profileImage || '/assets/images/default-avatar.png'} 
                  alt="Provider" 
                  className="provider-avatar"
                />
                <div className="provider-name">
                  {service.provider.profile.firstName} {service.provider.profile.lastName}
                </div>
              </div>
              <p className="rate-info">{service.hourlyRate} coins per hour</p>
              
              <div className="duration-selector">
                <label>Call Duration:</label>
                <select 
                  value={durationMinutes} 
                  onChange={handleDurationChange}
                  className="form-select"
                >
                  <option value="5">5 minutes ({Math.ceil(service.hourlyRate * (5/60))} coins)</option>
                  <option value="15">15 minutes ({Math.ceil(service.hourlyRate * (15/60))} coins)</option>
                  <option value="30">30 minutes ({Math.ceil(service.hourlyRate * (30/60))} coins)</option>
                  <option value="60">60 minutes ({service.hourlyRate} coins)</option>
                </select>
              </div>
              
              <div className="call-cost-info">
                <p>You will be charged {Math.ceil(service.hourlyRate * (durationMinutes/60))} coins for this call.</p>
                <p>Your current balance: {currentUser.coins} coins</p>
              </div>
              
              <button 
                className="btn btn-primary btn-lg start-call-btn" 
                onClick={initiateCall}
                disabled={loading || currentUser.coins < Math.ceil(service.hourlyRate * (durationMinutes/60))}
              >
                {loading ? 'Connecting...' : 'Start Video Call'}
              </button>
              
              {currentUser.coins < Math.ceil(service.hourlyRate * (durationMinutes/60)) && (
                <div className="insufficient-coins-warning">
                  <p>You don't have enough coins for this call.</p>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => navigate('/member/coins/purchase')}
                  >
                    Purchase Coins
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {(callStatus === 'connecting' || callStatus === 'active') && (
          <div className="active-call-container">
            <div className="video-grid">
              <div className="remote-video-container">
                {callStatus === 'connecting' && (
                  <div className="connecting-overlay">
                    <div className="spinner-border text-light" role="status">
                      <span className="visually-hidden">Connecting...</span>
                    </div>
                    <p>Connecting to service provider...</p>
                  </div>
                )}
                <div ref={remoteVideoRef} className="remote-video"></div>
              </div>
              <div className="local-video-container">
                <div ref={localVideoRef} className="local-video"></div>
              </div>
            </div>
            
            <div className="call-controls-container">
              <CallTimer 
                durationMinutes={durationMinutes} 
                elapsedTime={elapsedTime} 
              />
              
              <CallControls 
                twilioRoom={twilioRoom}
                onEndCall={endCall}
              />
            </div>
          </div>
        )}
        
        {showRatingDialog && (
          <RatingDialog 
            onSubmit={handleRatingSubmit}
            onCancel={() => navigate('/member/services')}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default VideoCallInterface;