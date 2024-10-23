import React, { useState, useEffect } from "react";
import { AntComponents } from "../antComponents/AntComponents";
import SettingsPanel from "../components/SettingsPanel";
import TextDisplay from "../components/TextDisplay";
import WebRTCService from "../services/WebRTCService";

const Home = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [sessionId, setSessionId] = useState("");
    const [settings, setSettings] = useState({
        animationType: "typing",
        backgroundColor: "#FFFFFF",
        color: "#000000",
        fontSize: 72,
        fontFamily: "Arial",
        lines: 3,
        speed: 25,
    });
    const [showSettings, setShowSettings] = useState(false);
    const [text, setText] = useState("Waiting for messages...");
    const [websocketURL, setWebsocketURL] = useState(process.env.NEXT_PUBLIC_WS_URL);

    const handleConnect = () => {
        if (sessionId && websocketURL) {
            const webrtc = new WebRTCService((receivedMessage) => {
                const messageData = JSON.parse(receivedMessage);
                if (messageData.type === "connected") {
                    setIsConnected(true);
                } else if (messageData.type === "message") {
                    setText(messageData.content);
                }
            }, false);

            webrtc.connect(websocketURL, sessionId, { transports: ['websocket'] });

            return () => webrtc.disconnect();
        }
    };

    return (
        <AntComponents.Flex justify="center" align="center" style={{ height: "100vh", width: "100vw" }}>
            {!isConnected ? (
                <AntComponents.Content className="session-id-input-container">
                    <AntComponents.Input
                        className="session-id-input"
                        placeholder="Enter the 3-word session ID"
                        value={sessionId}
                        onChange={(e) => setSessionId(e.target.value)}
                    />
                    <AntComponents.Button
                        className="connect-button"
                        disabled={!sessionId}
                        onClick={handleConnect}
                        type="primary"
                    >
                        Connect
                    </AntComponents.Button>
                </AntComponents.Content>
            ) : (
                <TextDisplay
                    key={text}
                    text={text}
                    fontSize={settings.fontSize}
                    fontFamily={settings.fontFamily}
                    animationType={settings.animationType}
                    backgroundColor={settings.backgroundColor}
                    color={settings.color}
                    lines={settings.lines}
                    speed={settings.speed}
                />
            )}

            <div className="settings-button-container">
                <div className="settings-button" onClick={() => setShowSettings(true)}>⚙️ Settings</div>
                <div className="session-id" style={{ color: isConnected ? "green" : "red" }}>
                    {isConnected ? "●" : "●"} Session ID: {sessionId}
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