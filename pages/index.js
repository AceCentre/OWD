import React, { useState, useEffect } from 'react';
import DisplayText from '../components/DisplayText';
import SettingsPanel from '../components/SettingsPanel';
import QRCodeDisplay from '../components/QRCodeDisplay';
import WebRTCService from '../services/WebRTCService';
import BLEService from '../services/BLEService';

const Home = () => {
  const [text, setText] = useState('Waiting for messages...');
  const [settings, setSettings] = useState({ fontSize: '24px', color: '#000', speed: 50, lines: 3 });
  const [webrtcService, setWebrtcService] = useState(null);
  const [bleService, setBleService] = useState(null);

  // Use WebSocket URL from the environment variable
  const websocketURL = process.env.NEXT_PUBLIC_WS_URL;

  useEffect(() => {
    const webrtc = new WebRTCService(setText);
    webrtc.createOffer();
    webrtc.connect(websocketURL);
    setWebrtcService(webrtc);

    if ('bluetooth' in navigator) {
      const ble = new BLEService(setText);
      ble.connect();
      setBleService(ble);
    }
  }, [websocketURL]);

  return (
    <>
      <DisplayText text={text} {...settings} />
      <SettingsPanel onSettingsChange={setSettings} />
      <QRCodeDisplay websocketURL={websocketURL} />
    </>
  );
};

export default Home;