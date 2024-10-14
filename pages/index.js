import React, { useState, useEffect } from 'react';
import DisplayText from '../components/DisplayText';
import SettingsPanel from '../components/SettingsPanel';
import QRCodeDisplay from '../components/QRCodeDisplay';
import WebRTCService from '../services/WebRTCService';
import BLEService from '../services/BLEService';
import './Home.css'; // Import CSS for styling

const Home = () => {
  const [text, setText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [settings, setSettings] = useState({ fontSize: '24px', color: '#000', speed: 50, lines: 3 });
  const websocketURL = process.env.NEXT_PUBLIC_WS_URL;

  useEffect(() => {
    const webrtc = new WebRTCService((incomingMessage) => {
      setText(incomingMessage);
      setIsConnected(true);
    });
    webrtc.connect(websocketURL);
    webrtc.createOffer();

    if ('bluetooth' in navigator) {
      const ble = new BLEService(setText);
      ble.connect();
    }
  }, [websocketURL]);

  return (
    <div className="home-container">
      <h1 className="title">Open Wireless Display</h1>

      {!isConnected ? (
        <div className="connection-info">
          <QRCodeDisplay websocketURL={websocketURL} />
          <p className="instructions">Scan the QR code or enter the session details to connect.</p>
          <p className="session-details">Session URL: {websocketURL}</p>
        </div>
      ) : (
        <div className="connected-info">
          <DisplayText text={text || "Waiting for messages..."} {...settings} />
          <p className="connected-session">Connected to session</p>
        </div>
      )}

      <div className="settings-button" onClick={() => setSettings({ ...settings })}>
        ⚙️
      </div>
      <SettingsPanel onSettingsChange={setSettings} />
    </div>
  );
};

export default Home;