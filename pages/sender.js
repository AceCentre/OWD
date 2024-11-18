import React, { useState, useEffect } from "react";
import { faker } from "@faker-js/faker";
import { AntComponents } from "../antComponents/AntComponents";
import QRCodeDisplay from "../components/sender/QRCodeDisplay";
import SenderText from "../components/sender/SenderText";
import messageTypes from "../utils/messageTypes.json";
import DualService from "../services/DualService";

const generateWordCode = () => {
    const word1 = faker.word.adjective();
    const word2 = faker.word.adjective();
    const word3 = faker.animal.type();
    return `${word1}-${word2}-${word3}`;
};

const SenderApp = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [sessionId, setSessionId] = useState("");
    const [dualService, setDualService] = useState(null);
    const [connectionType, setConnectionType] = useState("");
    const [message, setMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isLiveTyping, setIsLiveTyping] = useState(false);
    const [isPersistent, setIsPersistent] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false); 

    const websocketURL = process.env.NEXT_PUBLIC_WS_URL;

    useEffect(() => {
        const savedSessionId = localStorage.getItem("persistentSessionId");
        if (savedSessionId) {
            setSessionId(savedSessionId);
            setIsPersistent(true);
        } else {
            setSessionId(generateWordCode());
        }
    }, []);

    useEffect(() => {
        if (sessionId) {
            const service = new DualService((receivedMessage) => {
                try {
                    const messageData = JSON.parse(receivedMessage);
                    console.log("Sender received message:", messageData);

                    if (messageData.type === messageTypes.CONNECTED) {
                        console.log("Display acknowledged connection on sender side.");
                        setIsConnected(true);
                    } else {
                        console.warn("Unexpected message type received:", messageData.type);
                    }
                } catch (error) {
                    console.error("Error parsing received message on sender:", error);
                }
            });

            service.onConnected((type) => {
                setIsConnected(true);
                setConnectionType(type);
                console.log(`Connected using ${type}.`);

                // Ensure data channel is ready before sending the message
                if (type === "WebRTC" && service.webrtcService?.channel?.readyState === "open") {
                    service.sendMessage(
                        JSON.stringify({ type: messageTypes.CHANNEL_CONNECTED })
                    );
                    console.log("Sender sent CHANNEL_CONNECTED message to display.");
                }
            });

            service.initConnections("sender");
            setDualService(service);

            return () => {
                service.cleanup();
                setIsConnected(false);
                setConnectionType("");
            };
        }
    }, [sessionId]);



    const togglePersistence = () => {
        setIsPersistent(!isPersistent);
        if (!isPersistent) {
            localStorage.setItem("persistentSessionId", sessionId);
        } else {
            localStorage.removeItem("persistentSessionId");
        }
    };

    const sendMessage = () => {
        if (dualService && isConnected && message.length > 0) {
            dualService.sendMessage(
                JSON.stringify({
                    type: messageTypes.MESSAGE,
                    content: message,
                    isLiveTyping: isLiveTyping,
                })
            );
            setMessage("");
            setIsTyping(false);
        } else {
            console.warn("Not connected to a display session or message is empty.");
        }
    };

    const handleTyping = (e) => {
        const newMessage = e.target.value;
        setMessage(newMessage);

        if (isLiveTyping && webrtcService && isConnected) {
            dualService.sendMessage(
                JSON.stringify({
                    type: messageTypes.MESSAGE,
                    content: newMessage,
                    isLiveTyping: isLiveTyping,
                })
            );
            setIsTyping(false);
        } else if (!isLiveTyping && newMessage.length > 0 && !isTyping) {
            setIsTyping(true);
            dualService.sendMessage(
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

            <AntComponents.Button className="advanced-toggle" type="link" onClick={() => setShowAdvanced(!showAdvanced)}>
                {showAdvanced ? "Hide Session ID Options" : "Show Session ID Options"}
            </AntComponents.Button>

            {showAdvanced && (
                <div className="advanced-options">
                    <AntComponents.Input
                        placeholder="Custom Session ID"
                        value={sessionId}
                        onChange={(e) => setSessionId(e.target.value)}
                    />
                    <AntComponents.Checkbox
                        checked={isPersistent}
                        onChange={togglePersistence}
                    >
                        Persistent Session
                    </AntComponents.Checkbox>
                </div>
            )}

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
