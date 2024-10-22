import React, { useState, useEffect } from "react";
import { AntComponents } from "../antComponents/AntComponents";
import QRCodeDisplay from "../components/QRCodeDisplay";
import SettingsPanel from "../components/SettingsPanel";
import TextDisplay from "../components/TextDisplay";
import WebRTCService from "../services/WebRTCService";
import { v4 as uuidv4 } from "uuid";

const Home = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [sessionId, setSessionId] = useState("");
    const [settings, setSettings] = useState({
        animationType: "typing",  // Animation options
        backgroundColor: "#FFFFFF",
        color: "#000000",
        fontSize: 72,  // Increased default font size to 72px
        fontFamily: "default",  // Default font family
        lines: 3,
        speed: 25,
    });
    const [showSettings, setShowSettings] = useState(false);
    const [text, setText] = useState("Waiting for messages...");
    const [websocketURL, setWebsocketURL] = useState("");

    useEffect(() => {
        setSessionId(uuidv4());
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
                    key={text}  // Forces re-render to animate only on new message
                    text={text}
                    fontSize={settings.fontSize}
                    fontFamily={settings.fontFamily}
                    animationType={settings.animationType}
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