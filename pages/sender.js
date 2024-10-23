import React, { useEffect, useState } from "react";
import WebRTCService from "../services/WebRTCService";
import { AntComponents } from "../antComponents/AntComponents";
import QRCodeDisplay from "../components/QRCodeDisplay";  // Assuming you already have this
import { faker } from '@faker-js/faker';

const SenderApp = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [message, setMessage] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [webrtcService, setWebrtcService] = useState(null);
    const websocketURL = process.env.NEXT_PUBLIC_WS_URL;

    // Generate a unique session ID for the sender
    const generateUniqueSessionId = () => {
        const word1 = faker.word.adjective();
        const word2 = faker.word.adjective();
        const word3 = faker.animal.type();
        return `${word1}-${word2}-${word3}`; // e.g., clever-blue-elephant
    };

    useEffect(() => {
        // Generate the session ID when the sender app loads
        const newSessionId = generateUniqueSessionId();
        setSessionId(newSessionId);

        // Automatically start WebRTC connection for the sender
        const webrtc = new WebRTCService((receivedMessage) => {
            console.log("Received:", receivedMessage);
        }, true);

        webrtc.connect(websocketURL, newSessionId, {
            transports: ['websocket'],
        });

        setWebrtcService(webrtc); // Store the service instance

        webrtc.onConnection(() => setIsConnected(true));  // Set connection status

        return () => {
            if (webrtc) webrtc.disconnect();
        };
    }, [websocketURL]);

    const sendMessage = () => {
        if (webrtcService && message.trim()) {
            webrtcService.sendMessage(
                JSON.stringify({ type: "message", content: message })
            );
            setMessage("");
        }
    };

    return (
        <AntComponents.Flex className="sender-container" gap="middle" vertical="true">
            <AntComponents.Layout className="sender-layout">
                <AntComponents.Header className="sender-header">
                    <AntComponents.Title level={2} className="sender-title">
                        OWD Sender App (Demo)
                    </AntComponents.Title>
                </AntComponents.Header>

                <AntComponents.Content className="sender-input-container">
                    <QRCodeDisplay sessionId={sessionId} />
                </AntComponents.Content>

                <AntComponents.Content className="sender-input-container">
                    <AntComponents.Input
                        className="sender-input"
                        disabled={!isConnected}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message"
                        type="text"
                        value={message}
                    />
                    <AntComponents.Button
                        className="sender-button"
                        disabled={!isConnected || !message.trim()}
                        onClick={sendMessage}
                        type="primary"
                    >
                        Send Message
                    </AntComponents.Button>
                </AntComponents.Content>

                <AntComponents.Footer className="sender-footer">
                    <AntComponents.Text
                        className="sender-connect-state"
                        type={isConnected ? "success" : "warning"}
                    >
                        {isConnected ? `Connected to display session: ${sessionId}` : "Waiting for display to connect..."}
                    </AntComponents.Text>
                </AntComponents.Footer>
            </AntComponents.Layout>
        </AntComponents.Flex>
    );
};

export default SenderApp;