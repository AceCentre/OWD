// pages/sender.js
import React, { useState, useEffect } from 'react';
import WebRTCService from '../services/WebRTCService';

const Sender = () => {
  const [message, setMessage] = useState('');
  const [wsUrl, setWsUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [webrtcService, setWebrtcService] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure this runs only on the client
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const currentDomain = window.location.origin.replace(/^http/, 'ws');
      setWsUrl(`${currentDomain}/api/signaling`);
    }
  }, [isClient]);

  // Initialize WebRTC service once the WebSocket URL is set
  useEffect(() => {
    if (wsUrl && isClient) {
      const webrtc = new WebRTCService();
      webrtc.createOffer();
      webrtc.connect(wsUrl);
      setWebrtcService(webrtc);

      webrtc.onConnectionStatusChange((status) => setIsConnected(status));
    }
  }, [wsUrl, isClient]);

  const handleSend = () => {
    if (webrtcService && isConnected) {
      webrtcService.sendMessage(message);
      setMessage('');
    } else {
      alert('Connect to the WebSocket URL first.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Sender Demo</h2>

      <div style={{ marginBottom: '20px' }}>
        <label>
          WebSocket URL:
          <input
            type="text"
            value={wsUrl}
            onChange={(e) => setWsUrl(e.target.value)}
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
          />
        </label>
      </div>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here"
        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
      />
      <button onClick={handleSend} style={{ padding: '10px 20px', marginTop: '10px' }}>
        Send
      </button>

      <p>Status: {isConnected ? 'Connected' : 'Not Connected'}</p>
    </div>
  );
};

export default Sender;