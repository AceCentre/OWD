import React, { useState, useEffect } from "react";
import { AntComponents } from "../antComponents/AntComponents";
import QRCodeDisplay from "../components/QRCodeDisplay";
import SettingsPanel from "../components/SettingsPanel";
import TextDisplay from "../components/TextDisplay";
import WebRTCService from "../services/WebRTCService";
import { faker } from '@faker-js/faker';  // Import faker to generate word-based session ID

// Store active sessions here
const sessions = {};

// Function to generate a word-based session ID using faker
const generateWordCode = () => {
    const word1 = faker.word.adjective();
    const word2 = faker.word.adjective();
    const word3 = faker.animal.type();
    return `${word1}-${word2}-${word3}`; // e.g., clever-blue-elephant
};

// Check for collision and generate a new code if collision happens
const generateUniqueSessionId = () => {
    let sessionId;
    do {
        sessionId = generateWordCode();
    } while (sessions[sessionId]);  // Regenerate if session ID is taken
    return sessionId;
};

const Home = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [sessionId, setSessionId] = useState("");
    const [settings, setSettings] = useState({
        animationType: "typing",  // Default animation
        backgroundColor: "#FFFFFF",
        color: "#000000",
        fontSize: 72,  // Default font size
        fontFamily: "Arial",  // Default font family
        lines: 3,
        speed: 25,
    });
    const [showSettings, setShowSettings] = useState(false);
    const [text, setText] = useState("Waiting for messages...");
    const [websocketURL, setWebsocketURL] = useState("");

    useEffect(() => {
        const uniqueSessionId = generateUniqueSessionId(); // Generate unique session ID
        setSessionId(uniqueSessionId);
        sessions[uniqueSessionId] = true;  // Store the session in the sessions list
        setWebsocketURL(process.env.NEXT_PUBLIC_WS_URL);
    }, []);

    useEffect(() => {
        if (sessionId && websocketURL) {
            const webrtc = new WebRTCService((receivedMessage) => {
                const messageData = JSON.parse(receivedMessage);
                if (messageData.type === "connected") {
                    setIsConnected(true);
                } else if (messageData.type === "typing") {
                    setText("Typing...");
                } else if (messageData.type === "message") {
                    setText(messageData.content);
                }
            }, false);

            webrtc.connect(websocketURL, sessionId, {
                transports: ['websocket'],
            });

            return () => {
                webrtc.disconnect();
                setIsConnected(false);
                if (sessions[sessionId]) {
                    delete sessions[sessionId];  // Clean up session on disconnect
                }
            };
        }
    }, [websocketURL, sessionId]);

    return (
        <AntComponents.Flex
            justify="center"
            align="center"
            style={{ ...settings, height: "100vh", width: "100vw" }}
        >
            {isConnected ? (
                <TextDisplay
                    key={text}  // Re-render on new message to trigger animation
                    text={text}
                    fontSize={settings.fontSize}
                    fontFamily={settings.fontFamily}
                    animationType={settings.animationType}
                    backgroundColor={settings.backgroundColor}
                    color={settings.color}
                    lines={settings.lines}
                    speed={settings.speed}
                />
            ) : (
                <QRCodeDisplay sessionId={sessionId} />
            )}

            <div className="settings-button-container">
                <div
                    className="settings-button"
                    onClick={() => setShowSettings(true)}
                >
                    ⚙️Settings
                </div>
                {isConnected && (
                    <div className="session-id">
                        Session ID: {sessionId}
                    </div>
                )}
            </div>

            {showSettings && (
                <SettingsPanel
                    settings={settings}
                    onSettingsChange={setSettings}
                    closeSettings={() => setShowSettings(false)}
                />
            )}
        </AntComponents.Flex>
    );
};

export default Home;