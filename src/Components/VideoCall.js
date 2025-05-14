import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import './VideoCall.css';

const VideoCall = ({ socket, roomId, onClose, incomingCall, setIncomingCall, acceptorPeerId }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [peer, setPeer] = useState(null);
  const [peerId, setPeerId] = useState(null);
  const [isPeerReady, setIsPeerReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const currentCallRef = useRef(null);

  // Check for available devices on mount
  useEffect(() => {
    const checkDevices = async () => {
      try {
        const devices = await navigator?.mediaDevices?.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const audioDevices = devices.filter(device => device.kind === 'audioinput');
        console.log('Available video devices:', videoDevices);
        console.log('Available audio devices:', audioDevices);
        if (videoDevices.length === 0) {
          setErrorMessage('No camera detected. Please connect a camera to start a video call.');
        }
        if (audioDevices.length === 0) {
          setErrorMessage(prev => prev ? prev + ' No microphone detected.' : 'No microphone detected.');
        }
      } catch (error) {
        console.error('Error enumerating devices:', error);
        setErrorMessage('Error checking devices: ' + error.message);
      }
    };

    checkDevices();
  }, []);

  // Initialize PeerJS
  useEffect(() => {
    const peerInstance = new Peer();
    setPeer(peerInstance);

    peerInstance.on('open', (id) => {
      console.log('My peer ID is: ' + id);
      setPeerId(id);
      setIsPeerReady(true);
    });

    peerInstance.on('call', (call) => {
      console.log('Received incoming PeerJS call from:', call.peer);
      currentCallRef.current = call;
      setIsCallActive(true);
      setIsVideoLoading(true);

      // Start local stream for the receiving user
      navigator?.mediaDevices?.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          console.log('Local stream obtained for answering call:', stream);
          setLocalStream(stream);
          call.answer(stream); // Answer the call with the local stream

          call.on('stream', (remoteStream) => {
            console.log('Received remote stream from caller:', remoteStream);
            const videoTracks = remoteStream.getVideoTracks();
            const audioTracks = remoteStream.getAudioTracks();
            console.log('Remote stream video tracks:', videoTracks);
            console.log('Remote stream audio tracks:', audioTracks);
            if (videoTracks.length === 0) {
              setErrorMessage('No video track in remote stream');
            }
            setRemoteStream(remoteStream);
          });

          call.on('close', () => {
            console.log('Call closed by caller');
            endCall();
          });

          call.on('error', (err) => {
            console.error('Call error:', err);
            setErrorMessage(`Call error: ${err.message}`);
            endCall();
          });

          setIsVideoLoading(false);
        })
        .catch((error) => {
          console.error('Error accessing media devices:', error);
          setErrorMessage(`Failed to access camera/microphone: ${error.message}`);
          setIsVideoLoading(false);
          setIsCallActive(false);
        });
    });

    peerInstance.on('error', (error) => {
      console.error('PeerJS error:', error);
      setErrorMessage(`PeerJS error: ${error.message}`);
    });

    return () => {
      peerInstance.destroy();
    };
  }, []);

  // Set local stream on localVideoRef when localStream changes
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      console.log('Setting local stream to video element');
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.onloadedmetadata = () => {
        console.log('Local video metadata loaded');
        localVideoRef.current.play().then(() => {
          console.log('Local video playing');
        }).catch((err) => {
          console.error('Error playing local video:', err);
          setErrorMessage(`Error playing local video: ${err.message}`);
        });
      };
    }
  }, [localStream]);

  // Set remote stream on remoteVideoRef when remoteStream changes
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log('Setting remote stream to video element');
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.onloadedmetadata = () => {
        console.log('Remote video metadata loaded');
        remoteVideoRef.current.play().then(() => {
          console.log('Remote video playing');
        }).catch((err) => {
          console.error('Error playing remote video:', err);
          setErrorMessage(`Error playing remote video: ${err.message}`);
        });
      };
    }
  }, [remoteStream]);

  // Show modal when there's an incoming call
  useEffect(() => {
    if (incomingCall && !isCallActive) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [incomingCall, isCallActive]);

  // Initiate call when acceptorPeerId is received (for User A)
  useEffect(() => {
    if (acceptorPeerId && !incomingCall && isCallActive) {
      console.log('Acceptor peer ID received, initiating call:', acceptorPeerId);
      initiateCall(acceptorPeerId);
    }
  }, [acceptorPeerId, incomingCall, isCallActive]);

  const startVideoCall = async () => {
    if (!isPeerReady || !peerId) {
      console.error('Peer ID not available yet');
      setErrorMessage('Peer connection not ready. Please try again.');
      return;
    }

    try {
      setIsVideoLoading(true);
      setErrorMessage('');
      console.log('Requesting media devices...');
      const stream = await navigator?.mediaDevices?.getUserMedia({ video: true, audio: true });
      console.log('Local stream obtained:', stream);
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();
      console.log('Local stream video tracks (caller):', videoTracks);
      console.log('Local stream audio tracks (caller):', audioTracks);
      if (videoTracks.length === 0) {
        setErrorMessage('No video track in local stream (caller)');
        setIsVideoLoading(false);
        return;
      }
      setLocalStream(stream);

      const callData = {
        roomId,
        callerId: localStorage.getItem('userName'),
        callerPeerId: peerId,
      };
      console.log('Emitting start_video_call event with data:', callData);
      socket.emit('start_video_call', callData);

      setIsCallActive(true);
      setIsVideoLoading(false);
    } catch (error) {
      console.error('Error starting video call:', error);
      setErrorMessage(`Failed to start video call: ${error.message}`);
      setIsVideoLoading(false);
    }
  };

  const acceptCall = async () => {
    if (!incomingCall || !peer) {
      console.error('No incoming call or peer not available');
      setErrorMessage('Cannot accept call: No incoming call or peer not available');
      setIsModalOpen(false);
      return;
    }

    if (!isPeerReady || !peerId) {
      console.error('Peer ID not ready yet');
      setErrorMessage('Peer connection not ready. Please wait...');
      return;
    }

    setIsModalOpen(false);
    setIsVideoLoading(true);
    setErrorMessage('');
    setIncomingCall(null);

    try {
      const stream = await navigator?.mediaDevices?.getUserMedia({ video: true, audio: true });
      console.log('Local stream obtained for accepting call:', stream);
      setLocalStream(stream);

      const acceptData = { roomId, acceptorPeerId: peerId };
      console.log('Emitting accept_video_call event:', acceptData);
      socket.emit('accept_video_call', acceptData);
      setIsCallActive(true);
      setIsVideoLoading(false);
    } catch (error) {
      console.error('Error accepting call:', error);
      setErrorMessage(`Failed to accept call: ${error.message}`);
      setIsVideoLoading(false);
      setIsCallActive(false);
    }
  };

  const initiateCall = (remotePeerId) => {
    if (!localStream || !peer) {
      console.error('Local stream or peer not available');
      setErrorMessage('Cannot initiate call: Local stream or peer not available');
      return;
    }

    console.log('Initiating call to:', remotePeerId);
    const call = peer.call(remotePeerId, localStream);
    currentCallRef.current = call;

    call.on('stream', (remoteStream) => {
      console.log('Received remote stream from acceptor:', remoteStream);
      const videoTracks = remoteStream.getVideoTracks();
      const audioTracks = remoteStream.getAudioTracks();
      console.log('Remote stream video tracks (initiator):', videoTracks);
      console.log('Remote stream audio tracks (initiator):', audioTracks);
      if (videoTracks.length === 0) {
        setErrorMessage('No video track in remote stream (initiator)');
      }
      setRemoteStream(remoteStream);
    });

    call.on('close', () => {
      console.log('Call closed by acceptor');
      endCall();
    });

    call.on('error', (err) => {
      console.error('Call error:', err);
      setErrorMessage(`Call error: ${err.message}`);
      endCall();
    });
  };

  const endCall = () => {
    if (currentCallRef.current) {
      currentCallRef.current.close();
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsCallActive(false);
    setErrorMessage('');
    setIsVideoLoading(false);
    setIsModalOpen(false);
    socket.emit('end_video_call', { roomId });
    onClose();
  };

  const declineCall = () => {
    console.log('Declining call');
    setIncomingCall(null);
    setIsModalOpen(false);
    socket.emit('end_video_call', { roomId });
  };

  return (
    <div className="video-call-container">
      {errorMessage && (
        <div className="error-message">
          <p>{errorMessage}</p>
        </div>
      )}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Incoming Video Call</h3>
            <p>Incoming video call from {incomingCall?.callerId}</p>
            <div className="modal-buttons">
              <button
                onClick={acceptCall}
                className="accept-button"
                disabled={!isPeerReady}
              >
                {isPeerReady ? 'Accept' : 'Loading...'}
              </button>
              <button onClick={declineCall} className="decline-button">Decline</button>
            </div>
          </div>
        </div>
      )}
      <div className="video-wrapper">
        <div className="local-video-container">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className={`local-video ${isCallActive ? 'visible' : 'hidden'}`}
          />
          {isCallActive && <span className="video-label">You</span>}
        </div>
        {isCallActive ? (
          remoteStream ? (
            <div className="remote-video-container">
              <video
                ref={remoteVideoRef}
                autoPlay
                className="remote-video"
              />
              <span className="video-label">{incomingCall?.callerId || 'Remote'}</span>
            </div>
          ) : (
            <div className="remote-video-placeholder">
              {isVideoLoading ? 'Loading remote video...' : 'Waiting for remote video...'}
            </div>
          )
        ) : isVideoLoading ? (
          <div className="local-video-placeholder">Loading local video...</div>
        ) : null}
      </div>
      {isCallActive && (
        <button onClick={endCall} className="end-call-button">End Call</button>
      )}
      {!isCallActive && !incomingCall && (
        <button
          onClick={startVideoCall}
          className="start-call-button"
          disabled={!isPeerReady}
        >
          {isPeerReady ? 'Start Video Call' : 'Connecting...'}
        </button>
      )}
    </div>
  );
};

export default VideoCall;