// pages/sender.js
import React, { useState } from 'react';
import WebRTCService from '../services/WebRTCService';

const Sender = () => {
  const [message, setMessage] = useState('');
  const [webrtcService, setWebrtcService] = useState(null);

  // Initialize WebRTCService on component mount
  React.useEffect(() => {
    const webrtc = new WebRTCService();
    webrtc.createOffer();
    setWebrtcService(webrtc);
  }, []);

  const handleSend = () => {
    if (webrtcService) {
      webrtcService.sendMessage(message); // Send the message over WebRTC
      setMessage(''); // Clear input after sending
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Sender Demo</h2>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here"
        style={{ width: '100%', padding: '10px' }}
      />
      <button onClick={handleSend} style={{ padding: '10px 20px', marginTop: '10px' }}>
        Send
      </button>
    </div>
  );
};

export default Sender;