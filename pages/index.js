
                import React, { useState, useEffect } from 'react';
                import DisplayText from '../components/DisplayText';
                import SettingsPanel from '../components/SettingsPanel';
                import QRCodeDisplay from '../components/QRCodeDisplay';
                import WebRTCService from '../services/WebRTCService';
                import BLEService from '../services/BLEService';

                const Home = () => {
                    const [text, setText] = useState('Waiting for messages...');
                    const [settings, setSettings] = useState({ fontSize: '24px', color: '#000', animationType: 'fade' });
                    const [webrtcService, setWebrtcService] = useState(null);
                    const [bleService, setBleService] = useState(null);
                    const websocketURL = "wss://yourdomain.com/api/signaling"; // Replace with actual WebSocket URL

                    useEffect(() => {
                        const webrtc = new WebRTCService(setText);
                        webrtc.createOffer();
                        setWebrtcService(webrtc);

                        const ble = new BLEService(setText);
                        ble.connect();
                        setBleService(ble);
                    }, []);

                    const sendMessage = (message) => {
                        if (webrtcService) webrtcService.sendMessage(message);
                        if (bleService) bleService.sendMessage(message);
                    };

                    return (
                        <>
                            <DisplayText text={text} {...settings} />
                            <SettingsPanel onSettingsChange={setSettings} />
                            <QRCodeDisplay websocketURL={websocketURL} />
                        </>
                    );
                };

                export default Home;
            