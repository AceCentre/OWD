import React, { useState, useEffect } from "react";
import { faker } from "@faker-js/faker";
import { AntComponents } from "../antComponents/AntComponents";
import QRCodeDisplay from "../components/sender/QRCodeDisplay";
import SenderText from "../components/sender/SenderText";
import messageTypes from "../utils/messageTypes.json";
import WebRTCService from "../services/WebRTCService";

const generateWordCode = () => {
    const word1 = faker.word.adjective();
    const word2 = faker.word.adjective();
    const word3 = faker.animal.type();
    return `${word1}-${word2}-${word3}`;
};

const SenderApp = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [sessionId, setSessionId] = useState("");
    const [webrtcService, setWebrtcService] = useState(null);
    const [message, setMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isLiveTyping, setIsLiveTyping] = useState(false);

    const websocketURL = process.env.NEXT_PUBLIC_WS_URL;

    useEffect(() => {
        const generatedSessionId = generateWordCode();
        setSessionId(generatedSessionId);
    }, []);

    useEffect(() => {
        if (sessionId && websocketURL) {
            const webrtc = new WebRTCService((receivedMessage) => {
                const messageData = JSON.parse(receivedMessage);

                if (messageData.type === messageTypes.CHANNEL_CONNECTED) {
                    setIsConnected(true);
                }
            }, true);

            webrtc.onChannelOpen(() => {
                setIsConnected(true);
                webrtc.sendMessage(
                    JSON.stringify({ type: messageTypes.CHANNEL_CONNECTED })
                );
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

    useEffect(() => {
        if (webrtcService) {
            webrtcService.onChannelOpen(() => {
                if (isConnected && message.length === 0) {
                    webrtcService.sendMessage(
                        JSON.stringify({
                            type: messageTypes.CONNECTED,
                            isLiveTyping: isLiveTyping,
                        })
                    );
                }
            });
        }
    }, [isConnected, webrtcService]);

    const sendMessage = () => {
        if (webrtcService && isConnected && message.length > 0) {
            webrtcService.sendMessage(
                JSON.stringify({
                    type: messageTypes.MESSAGE,
                    content: message,
                    isLiveTyping: isLiveTyping,
                })
            );
            setMessage("");
            setIsTyping(false);
        } else {
            console.warn(
                "Not connected to a display session or message is empty"
            );
        }
    };

    const handleTyping = (e) => {
        const newMessage = e.target.value;
        setMessage(newMessage);

        if (isLiveTyping && webrtcService && isConnected) {
            webrtcService.sendMessage(
                JSON.stringify({
                    type: messageTypes.MESSAGE,
                    content: newMessage,
                    isLiveTyping: isLiveTyping,
                })
            );
            setIsTyping(false);
        } else if (!isLiveTyping && newMessage.length > 0 && !isTyping) {
            setIsTyping(true);
            webrtcService.sendMessage(
                JSON.stringify({
                    type: messageTypes.TYPING,
                    content: "Typing...",
                    isLiveTyping: isLiveTyping,
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

            <SenderText
                isConnected={isConnected}
                setIsLiveTyping={setIsLiveTyping}
                isLiveTyping={isLiveTyping}
                handleTyping={handleTyping}
                message={message}
                sendMessage={sendMessage}
            />
        </AntComponents.Flex>
    );
};

export default SenderApp;
