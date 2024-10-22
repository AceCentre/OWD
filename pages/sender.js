import React, { useEffect, useState } from "react";
import WebRTCService from "../services/WebRTCService";
import { AntComponents } from "../antComponents/AntComponents";
import { QRCodeCanvas } from "qrcode.react";
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

        // Automatically attempt to connect
        const webrtc = new WebRTCService((receivedMessage) => {
            console.log("Received:", receivedMessage);
            const messageData = JSON.parse(receivedMessage);

            if (messageData.type === "connected") {
                console.log("Display app connected");
                setIsConnected(true); // When display app connects, update state
            } else if (messageData.type === "message") {
                console.log("Received message:", messageData.content);
            }
        }, true);

        webrtc.connect(websocketURL, newSessionId, {
            transports: ['websocket'],
        });

        setWebrtcService(webrtc);

        return () => {
            if (webrtcService) {
                webrtcService.disconnect();
                setIsConnected(false);
            }
        };
    }, [websocketURL]);

    const sendMessage = () => {
        if (
            webrtcService &&
            isConnected &&
            message.length > 0 &&
            webrtcService.isDataChannelReady()
        ) {
            webrtcService.sendMessage(
                JSON.stringify({ type: "message", content: message })
            );
            setMessage("");
        } else {
            console.warn(
                "Not connected to a display session or message is empty"
            );
        }
    };

    return (
        <AntComponents.Flex
            className="sender-container"
            gap="middle"
            vertical="true"
        >
            <AntComponents.Layout className="sender-layout">
                <AntComponents.Header className="sender-header">
                    <AntComponents.Title level={2} className="sender-title">
                        OWD Sender App (Demo)
                    </AntComponents.Title>
                </AntComponents.Header>

                <AntComponents.Content className="sender-input-container">
                    <AntComponents.Flex align="center" vertical="true" gap="middle">
                        <AntComponents.Card className="qr-code">
                            <AntComponents.Flex align="center" vertical="true">
                                <QRCodeCanvas value={`${process.env.NEXT_PUBLIC_BASE_URL}/sender?sessionId=${sessionId}`} size={192} className="qr-code-img" />
                                <AntComponents.Paragraph>
                                    Session ID: {sessionId}
                                </AntComponents.Paragraph>
                            </AntComponents.Flex>
                        </AntComponents.Card>
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
                    </AntComponents.Flex>
                </AntComponents.Content>

                <AntComponents.Footer className="sender-footer">
                    <AntComponents.Text
                        className="sender-connect-state"
                        type={isConnected ? "success" : "warning"}
                    >
                        {isConnected ? (
                            <>
                                Connected to display session: <br />
                                {sessionId}
                            </>
                        ) : (
                            "Waiting to connect..."
                        )}
                    </AntComponents.Text>
                </AntComponents.Footer>
            </AntComponents.Layout>
        </AntComponents.Flex>
    );
};

export default SenderApp;