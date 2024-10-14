import React, { useEffect, useState } from 'react';
import WebRTCService from '../services/WebRTCService';

const SenderApp = () => {
  const [webrtcService, setWebrtcService] = useState(null);
  const [message, setMessage] = useState('');
  const websocketURL = process.env.NEXT_PUBLIC_WS_URL;

  useEffect(() => {
    const webrtc = new WebRTCService((receivedMessage) => {
      console.log('Received:', receivedMessage);
    });
    webrtc.connect(websocketURL);
    setWebrtcService(webrtc);
  }, [websocketURL]);

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
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send Message</button>
    </div>
  );
};

export default SenderApp;