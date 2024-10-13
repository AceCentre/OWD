
                import React, { useState, useEffect } from 'react';
                import WebRTCService from '../services/WebRTCService';

                const Sender = () => {
                    const [message, setMessage] = useState('');
                    const [webrtcService, setWebrtcService] = useState(null);

                    useEffect(() => {
                        const webrtc = new WebRTCService();
                        webrtc.createOffer();
                        setWebrtcService(webrtc);
                    }, []);

                    const sendMessage = () => {
                        if (webrtcService) webrtcService.sendMessage(message);
                    };

                    return (
                        <div>
                            <h1>Message Sender</h1>
                            <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
                            <button onClick={sendMessage}>Send</button>
                        </div>
                    );
                };

                export default Sender;
            