import React, { useState, useEffect } from 'react';
import DisplayText from '../components/DisplayText';
import SettingsPanel from '../components/SettingsPanel';
import QRCodeDisplay from '../components/QRCodeDisplay';
import WebRTCService from '../services/WebRTCService';
import BLEService from '../services/BLEService';

const Home = () => {
  const [text, setText] = useState('Waiting for messages...');
  const [settings, setSettings] = useState({ fontSize: '24px', color: '#000', speed: 50, lines: 3 });
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const websocketURL = process.env.NEXT_PUBLIC_WS_URL;

  useEffect(() => {
    // Generate or retrieve a sessionId if needed
    const id = sessionId || generateSessionId(); // Replace generateSessionId with your session ID generation logic
    setSessionId(id);

    const webrtc = new WebRTCService(setText);
    webrtc.connect(websocketURL, id);
    webrtc.createOffer();
    setIsConnected(true);

    if ('bluetooth' in navigator) {
      const ble = new BLEService(setText);
      ble.connect();
    }

    return () => {
      setIsConnected(false);
      webrtc.disconnect(); // Ensure cleanup if needed
    };
  }, [websocketURL, sessionId]);

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
          <QRCodeDisplay websocketURL={`${websocketURL}/${sessionId}`} />
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