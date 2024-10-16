import React, { useState, useEffect } from 'react';
import DisplayText from '../components/DisplayText';
import SettingsPanel from '../components/SettingsPanel';
import QRCodeDisplay from '../components/QRCodeDisplay';
import WebRTCService from '../services/WebRTCService';
import BLEService from '../services/BLEService';
import { v4 as uuidv4 } from 'uuid';

const Home = () => {
  const [text, setText] = useState('Waiting for messages...');
  const [settings, setSettings] = useState({ fontSize: '24px', color: '#000', speed: 50, lines: 3 });
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState('');
  
  const websocketURL = `${process.env.NEXT_PUBLIC_WS_URL}/${sessionId}`;

  useEffect(() => {
    // Retrieve or generate a session ID
    const savedSessionId = localStorage.getItem('sessionId') || uuidv4();
    setSessionId(savedSessionId);
    localStorage.setItem('sessionId', savedSessionId);
  }, []);

  useEffect(() => {
    const webrtc = new WebRTCService(setText);

    // Set connection state upon successful WebRTC connection
    webrtc.onConnection(() => {
      setIsConnected(true);
      console.log('Display connected to WebRTC session');
    });

    webrtc.connect(websocketURL);
    webrtc.createOffer();

    // Initialize Bluetooth if supported
    let ble;
    if ('bluetooth' in navigator) {
      ble = new BLEService(setText);
      ble.connect();
    }

    return () => {
      setIsConnected(false);
      webrtc.disconnect();
      if (ble) ble.disconnect(); // Clean up BLE connection
    };
  }, [websocketURL]);

  return (
    <div id="display-container">
      <h1>Open Wireless Display</h1>

      {isConnected ? (
        <>
          <p>Connected to session: {sessionId}</p>
          <DisplayText text={text} {...settings} />
        </>
      ) : (
        <>
          <p>Session ID: {sessionId}</p>
          <QRCodeDisplay sessionId={sessionId} /> {/* Pass only sessionId */}
          <p>Scan the QR code to connect from a sender device.</p>
        </>
      )}

      <div className="settings-button" onClick={() => setIsConnected(!isConnected)}>
        ⚙️ Settings
      </div>

      {isConnected && <SettingsPanel onSettingsChange={setSettings} />}
    </div>
  );
};

export default Home;