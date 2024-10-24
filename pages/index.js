import React, { useState, useEffect } from "react";
import { AntComponents } from "../antComponents/AntComponents";
import SettingsPanel from "../components/SettingsPanel";
import TextDisplay from "../components/TextDisplay";
import WebRTCService from "../services/WebRTCService";
import { useRouter } from "next/router";

const Home = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [sessionId, setSessionId] = useState("");
    const [webrtcService, setWebrtcService] = useState(null);
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
    const router = useRouter();

    const websocketURL = process.env.NEXT_PUBLIC_WS_URL;

    useEffect(() => {
        if (router.query.sessionId) {
            setSessionId(router.query.sessionId);
        }
    }, [router]);

    const handleConnect = () => {
        if (sessionId && websocketURL) {
            const webrtc = new WebRTCService((receivedMessage) => {
                const messageData = JSON.parse(receivedMessage);
                setText(
                    messageData.type === "typing"
                        ? "Typing..."
                        : messageData.content
                );
            }, false);

            webrtc.onChannelOpen(() => {
                console.log("Receiver connected");
                setIsConnected(true);
            });

            webrtc.connect(websocketURL, sessionId);
            setWebrtcService(webrtc);
        } else {
            console.warn(
                "Session ID and WebSocket URL are required to connect."
            );
        }
    };

    const handleSessionIdChange = (e) => {
        setSessionId(e.target.value);
    };

    useEffect(() => {
        return () => {
            if (webrtcService) {
                webrtcService.disconnect();
                setIsConnected(false);
            }
        };
    }, [webrtcService]);

    return (
        <AntComponents.Flex
            className="display-container"
            direction="column"
            justify="center"
            align="center"
        >
            {isConnected ? (
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
            ) : (
                <AntComponents.Flex
                    className="session-id-container"
                    direction="column"
                    justify="center"
                    align="center"
                    gap="small"
                >
                    <AntComponents.Input
                        className="session-id-input"
                        placeholder="Enter the 3-word session ID"
                        value={sessionId}
                        onChange={handleSessionIdChange}
                    />
                    <AntComponents.Button
                        className="connect-button"
                        disabled={!sessionId}
                        onClick={handleConnect}
                        type="primary"
                    >
                        Connect
                    </AntComponents.Button>
                </AntComponents.Flex>
            )}

            <div className="settings-button-container">
                <div
                    className="settings-button"
                    onClick={() => setShowSettings(true)}
                >
                    ⚙️ Settings
                </div>
                <div
                    className="session-id"
                    style={{ color: isConnected ? "green" : "red" }}
                >
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
