// pages/sender.js
import React, { useState, useEffect } from 'react';
import WebRTCService from '../services/WebRTCService';

const Sender = () => {
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [webrtcService, setWebrtcService] = useState(null);

  // Use the WebSocket URL from the environment variable
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || '';

  useEffect(() => {
    if (wsUrl) {
      const webrtc = new WebRTCService();
      webrtc.createOffer();
      webrtc.connect(wsUrl);
      setWebrtcService(webrtc);

      webrtc.onConnectionStatusChange((status) => setIsConnected(status));
    }
  }, [wsUrl]);

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
            readOnly
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