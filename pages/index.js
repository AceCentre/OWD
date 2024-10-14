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
  const websocketURL = process.env.NEXT_PUBLIC_WS_URL;
  const [sessionId] = useState(uuidv4()); // Generate a unique session ID

  useEffect(() => {
    const webrtc = new WebRTCService(setText);
    webrtc.connect(websocketURL, sessionId); // Connect using session ID
    webrtc.createOffer();

    if ('bluetooth' in navigator) {
      const ble = new BLEService(setText);
      ble.connect();
    }
  }, [websocketURL, sessionId]);

  return (
    <>
      <DisplayText text={text} {...settings} />
      <SettingsPanel onSettingsChange={setSettings} />
      <QRCodeDisplay websocketURL={`${websocketURL}?sessionId=${sessionId}`} /> {/* Display session QR */}
      <p>Session ID: {sessionId}</p> {/* Show session ID as text for manual entry */}
    </>
  );
};

export default Home;