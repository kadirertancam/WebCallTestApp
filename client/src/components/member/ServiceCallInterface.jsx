// client/src/components/member/ServiceCallInterface.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { callService, serviceAdService } from '../../services/api';

const ServiceCallInterface = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  
  const [service, setService] = useState(null);
  const [callStatus, setCallStatus] = useState('preparing'); // preparing, connecting, active, ended
  const [durationMinutes, setDurationMinutes] = useState(15); // Default duration
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activeCall, setActiveCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  
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
    
    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [serviceId]);
  
  // Start call timer when call becomes active
  useEffect(() => {
    if (callStatus === 'active' && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [callStatus]);
  
  // Check if call time is up
  useEffect(() => {
    if (elapsedTime >= durationMinutes * 60) {
      endCall();
    }
  }, [elapsedTime, durationMinutes]);
  
  // Handle initiating call
  const initiateCall = async () => {
    try {
      setLoading(true);
      
      const response = await callService.initiateCall({
        serviceAdId: service._id,
        durationMinutes
      });
      
      setActiveCall(response.data.call);
      setCallStatus('connecting');
      
      // Simulate call connection (in a real app, this would be handled by WebRTC or similar)
      setTimeout(() => {
        setCallStatus('active');
        
        // Simulate audio (in a real app, this would be real-time audio)
        if (audioRef.current) {
          audioRef.current.play();
        }
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
      
      setCallStatus('ended');
      
      if (activeCall) {
        await callService.completeCall(activeCall._id, {
          actualDurationMinutes: Math.ceil(elapsedTime / 60)
        });
      }
      
    } catch (err) {
      console.error('Error ending call:', err);
      setError('Failed to properly end call');
    }
  };
  
  // Handle duration change
  const handleDurationChange = (e) => {
    setDurationMinutes(parseInt(e.target.value));
  };
  
  // Format time display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (loading && !service) {
    return <div className="loading">Loading service details...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <div className="service-call-interface">
      {/* Hidden audio element for call simulation */}
      <audio ref={audioRef} loop hidden>
        <source src="/assets/audio/call-background.mp3" type="audio/mpeg" />
      </audio>
      
      <div className="service-details">
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
      </div>
      
      <div className="call-container">
        {callStatus === 'preparing' && (
          <div className="call-setup">
            <h3>Prepare for Call</h3>
            <div className="duration-selector">
              <label>Call Duration:</label>
              <select value={durationMinutes} onChange={handleDurationChange}>
                <option value="5">5 minutes ({Math.ceil(service.hourlyRate * (5/60))} coins)</option>
                <option value="15">15 minutes ({Math.ceil(service.hourlyRate * (15/60))} coins)</option>
                <option value="30">30 minutes ({Math.ceil(service.hourlyRate * (30/60))} coins)</option>
                <option value="60">60 minutes ({service.hourlyRate} coins)</option>
              </select>
            </div>
            <p className="call-instruction">You will be charged {Math.ceil(service.hourlyRate * (durationMinutes/60))} coins for this call.</p>
            <button 
              className="call-button" 
              onClick={initiateCall}
              disabled={loading}
            >
              Start Call
            </button>
          </div>
        )}
        
        {callStatus === 'connecting' && (
          <div className="call-connecting">
            <div className="connecting-animation">
              <div className="pulse-ring"></div>
              <div className="pulse-dot"></div>
            </div>
            <p>Connecting to service provider...</p>
          </div>
        )}
        
        {callStatus === 'active' && (
          <div className="active-call">
            <div className="call-timer">
              <div className="timer-label">Call Time Remaining:</div>
              <div className="timer-display">
                {formatTime((durationMinutes * 60) - elapsedTime)}
              </div>
            </div>
            
            <div className="call-controls">
              <button className="mute-button">
                <i className="fas fa-microphone-slash"></i>
                Mute
              </button>
              <button className="end-call-button" onClick={endCall}>
                <i className="fas fa-phone-slash"></i>
                End Call
              </button>
              <button className="speaker-button">
                <i className="fas fa-volume-up"></i>
                Speaker
              </button>
            </div>
          </div>
        )}
        
        {callStatus === 'ended' && (
          <div className="call-ended">
            <h3>Call Ended</h3>
            <p>Call duration: {formatTime(elapsedTime)}</p>
            <div className="rating-section">
              <h4>Rate this call:</h4>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="star">★</span>
                ))}
              </div>
              <textarea 
                placeholder="Leave feedback (optional)"
                className="feedback-input"
              ></textarea>
              <button className="submit-rating">Submit Rating</button>
            </div>
            <button 
              className="return-button"
              onClick={() => navigate('/member/services')}
            >
              Return to Services
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCallInterface;