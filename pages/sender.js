import React, { useEffect, useState } from 'react';
import WebRTCService from '../services/WebRTCService';

const SenderApp = () => {
  const [webrtcService, setWebrtcService] = useState(null);
  const [message, setMessage] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const websocketURL = process.env.NEXT_PUBLIC_WS_URL;

  const handleConnect = () => {
    if (sessionId) {
      const webrtc = new WebRTCService((receivedMessage) => {
        console.log('Received:', receivedMessage);
      });

      webrtc.onConnection(() => setIsConnected(true)); // Confirm connection
      webrtc.connect(websocketURL, sessionId);
      setWebrtcService(webrtc);
    } else {
      console.warn("Session ID is required to connect");
    }
  };

  const sendMessage = () => {
    if (webrtcService && isConnected) {
      webrtcService.sendMessage(message);
    } else {
      console.warn("Not connected to a display session");
    }
  };

  // Clean up the connection on unmount
  useEffect(() => {
    return () => {
      if (webrtcService) {
        webrtcService.disconnect();
        setIsConnected(false);
      }
    };
  }, [webrtcService]);

  return (
    <div>
      <h1>Sender App</h1>
      <input
        type="text"
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        placeholder="Enter Session ID"
      />
      <button onClick={handleConnect} disabled={isConnected || !sessionId}>
        {isConnected ? "Connected" : "Connect"}
      </button>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
        disabled={!isConnected}
      />
      <button onClick={sendMessage} disabled={!isConnected || !message}>
        Send Message
      </button>
      <p>{isConnected ? `Connected to display session ${sessionId}` : "Waiting to connect..."}</p>
    </div>
  );
};

export default SenderApp;