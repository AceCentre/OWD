import React, { useEffect, useState } from 'react';
import WebRTCService from '../services/WebRTCService';

const SenderApp = () => {
  const [webrtcService, setWebrtcService] = useState(null);
  const [message, setMessage] = useState('');
  const [sessionId, setSessionId] = useState('');
  const websocketURL = process.env.NEXT_PUBLIC_WS_URL;

  useEffect(() => {
    if (sessionId) { // Connect only if session ID is provided
      const webrtc = new WebRTCService((receivedMessage) => {
        console.log('Received:', receivedMessage);
      });
      webrtc.connect(websocketURL, sessionId); // Pass session ID to WebRTC service
      setWebrtcService(webrtc);
    }
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
    </div>
  );
};

export default SenderApp;