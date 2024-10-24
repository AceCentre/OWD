import React, { useState, useEffect } from "react";
import WebRTCService from "../services/WebRTCService";
import { AntComponents } from "../antComponents/AntComponents";
import QRCodeDisplay from "../components/QRCodeDisplay";
import { faker } from "@faker-js/faker";

const SenderApp = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [message, setMessage] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [webrtcService, setWebrtcService] = useState(null);
    const [liveTyping, setLiveTyping] = useState(false);

    const websocketURL = process.env.NEXT_PUBLIC_WS_URL;

    useEffect(() => {
        const generatedSessionId = `${faker.word.adjective()}-${faker.word.adjective()}-${faker.animal.type()}`;
        setSessionId(generatedSessionId);
    }, []);

    useEffect(() => {
        if (sessionId && websocketURL) {
            const webrtc = new WebRTCService((receivedMessage) => {
                console.log("Message received:", receivedMessage);
            }, true);

            webrtc.onChannelOpen(() => {
                setIsConnected(true);
            });

            webrtc.connect(websocketURL, sessionId);
            setWebrtcService(webrtc);

            return () => {
                if (webrtc) {
                    webrtc.disconnect();
                    setIsConnected(false);
                }
            };
        }
    }, [sessionId, websocketURL]);

    const sendMessage = () => {
        if (webrtcService && isConnected && message.trim()) {
            webrtcService.sendMessage(
                JSON.stringify({
                    type: "message",
                    content: message,
                    liveTyping: liveTyping,
                })
            );
            setMessage("");
        }
    };

    const handleTyping = (e) => {
        const newMessage = e.target.value;
        setMessage(newMessage);

        if (liveTyping && webrtcService && isConnected) {
            webrtcService.sendMessage(
                JSON.stringify({
                    type: "typing",
                    content: newMessage,
                })
            );
        }
    };

    return (
        <AntComponents.Flex
            className="sender-container"
            gap="middle"
            vertical="true"
        >
            <AntComponents.Title level={2} className="sender-title">
                OWD Sender App (Demo)
            </AntComponents.Title>

            <QRCodeDisplay sessionId={sessionId} />

            <AntComponents.Content className="sender-input-container">
                <AntComponents.Checkbox
                    onChange={(e) => setLiveTyping(e.target.checked)}
                    disabled={!isConnected}
                >
                    Enable Live Typing
                </AntComponents.Checkbox>
            </AntComponents.Content>

            <AntComponents.Flex align="center" vertical="true" gap="middle">
                <AntComponents.Input
                    className="sender-input"
                    disabled={!isConnected}
                    onChange={handleTyping}
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
        </AntComponents.Flex>
    );
};

export default SenderApp;
