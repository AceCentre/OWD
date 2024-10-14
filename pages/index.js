import React, { useState, useEffect } from 'react';
import DisplayText from '../components/DisplayText';
import SettingsPanel from '../components/SettingsPanel';
import QRCodeDisplay from '../components/QRCodeDisplay';
import WebRTCService from '../services/WebRTCService';
import BLEService from '../services/BLEService';

const Home = () => {
    const [text, setText] = useState('Waiting for messages...'); // Default text
    const [settings, setSettings] = useState({ fontSize: '24px', color: '#000', speed: 50, lines: 3 });

    useEffect(() => {
        const webrtc = new WebRTCService(setText);
        webrtc.createOffer();

        if ('bluetooth' in navigator) {
            const ble = new BLEService(setText);
            ble.connect();
        }
    }, []);

    return (
        <>
            {text && <DisplayText text={text} {...settings} />} {/* Conditional render */}
            <SettingsPanel onSettingsChange={setSettings} />
            <QRCodeDisplay websocketURL="wss://yourdomain.com/api/signaling" />
        </>
    );
};

export default Home;