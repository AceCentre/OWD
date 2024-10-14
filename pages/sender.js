import React, { useEffect, useState } from 'react';
import WebRTCService from '../services/WebRTCService';

const SenderApp = () => {
  const [webrtcService, setWebrtcService] = useState(null);
  const [message, setMessage] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isConnected, setIsConnected] = useState(false); // State for connection status
  const websocketURL = process.env.NEXT_PUBLIC_WS_URL;

  useEffect(() => {
    if (sessionId) { 
      const webrtc = new WebRTCService((receivedMessage) => {
        console.log('Received:', receivedMessage);
      });

      // Add event listener to confirm connection
      webrtc.onConnection(() => setIsConnected(true));
      
      webrtc.connect(websocketURL, sessionId);
      setWebrtcService(webrtc);
    }

    return () => {
      // Clean up by disconnecting when component unmounts
      if (webrtcService) {
        webrtcService.disconnect();
        setIsConnected(false); // Reset connection status
      }
    };
  }, [websocketURL, sessionId]);

  const sendMessage = () => {
    if (webrtcService) {
      webrtcService.sendMessage(message);
    }
  };

  return (
    <div>
      <h1>Sender App</h1>
      <input
        type="text"
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        placeholder="Enter Session ID"
      />
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage} disabled={!sessionId}>Send Message</button>

      {/* Display connection status */}
      {isConnected ? (
        <p>Connected to display session {sessionId}</p>
      ) : (
        <p>Waiting to connect...</p>
      )}
    </div>
  );
};

export default SenderApp;