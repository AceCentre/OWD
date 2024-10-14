import React, { useState, useEffect } from 'react';
import DisplayText from '../components/DisplayText';
import SettingsPanel from '../components/SettingsPanel';
import QRCodeDisplay from '../components/QRCodeDisplay';
import WebRTCService from '../services/WebRTCService';
import BLEService from '../services/BLEService';

const generateSessionId = () => Math.random().toString(36).substring(2, 15); // Simple random ID generator

const Home = () => {
  const [text, setText] = useState('Waiting for messages...');
  const [settings, setSettings] = useState({ fontSize: '24px', color: '#000', speed: 50, lines: 3 });
  const websocketURL = process.env.NEXT_PUBLIC_WS_URL;
  const sessionId = generateSessionId();

  useEffect(() => {
    const webrtc = new WebRTCService(setText);
    webrtc.connect(websocketURL, sessionId); // Pass session ID here
    webrtc.createOffer(sessionId); // Pass session ID to offer creation

    if ('bluetooth' in navigator) {
      const ble = new BLEService(setText);
      ble.connect();
    }
  }, [websocketURL, sessionId]);

  return (
    <>
      <DisplayText text={text} {...settings} />
      <SettingsPanel onSettingsChange={setSettings} />
      <QRCodeDisplay websocketURL={`${websocketURL}?sessionId=${sessionId}`} /> {/* Include session ID in QR code */}
    </>
  );
};

export default Home;