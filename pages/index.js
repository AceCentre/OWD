
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

            useEffect(() => {
                const webrtc = new WebRTCService(setText);
                webrtc.createOffer();
                setWebrtcService(webrtc);

                if ('bluetooth' in navigator) {
                    const ble = new BLEService(setText);
                    ble.connect();
                    setBleService(ble);
                }
            }, []);

            return (
                <>
                    <DisplayText text={text} {...settings} />
                    <SettingsPanel onSettingsChange={setSettings} />
                    <QRCodeDisplay websocketURL="wss://yourdomain.com/api/signaling" />
                </>
            );
        };

        export default Home;
    