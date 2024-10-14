// pages/sender.js
import React, { useState, useEffect } from 'react';
import WebRTCService from '../services/WebRTCService';
import { QRCodeCanvas } from 'qrcode.react';
import dynamic from 'next/dynamic';

// Dynamically import QR code scanner to avoid SSR issues
const QrReader = dynamic(() => import('react-qr-reader'), { ssr: false });

const Sender = () => {
  const [message, setMessage] = useState('');
  const [wsUrl, setWsUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [webrtcService, setWebrtcService] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (wsUrl) {
      const webrtc = new WebRTCService();
      webrtc.createOffer();
      webrtc.connect(wsUrl); // Connect to WebSocket URL
      setWebrtcService(webrtc);

      // Update connection status based on WebRTC connection
      webrtc.onConnectionStatusChange((status) => setIsConnected(status));
    }
  }, [wsUrl]);

  const handleSend = () => {
    if (webrtcService && isConnected) {
      webrtcService.sendMessage(message);
      setMessage('');
    } else {
      alert('Connect to a WebSocket URL first.');
    }
  };

  const handleScan = (data) => {
    if (data) {
      setWsUrl(data); // Set the WebSocket URL from QR code
      setShowScanner(false); // Hide scanner after successful scan
    }
  };

  const handleError = (err) => {
    console.error(err);
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
            placeholder="Enter WebSocket URL or scan QR code"
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
          />
        </label>
        <button onClick={() => setShowScanner((prev) => !prev)} style={{ padding: '10px 20px', marginTop: '10px' }}>
          {showScanner ? 'Hide QR Scanner' : 'Scan QR Code'}
        </button>
      </div>

      {showScanner && (
        <div style={{ marginBottom: '20px' }}>
          <QrReader
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '100%' }}
          />
        </div>
      )}

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