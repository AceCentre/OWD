import React, { useState, useEffect } from "react";
import { AntComponents } from "../antComponents/AntComponents";
import SettingsPanel from "../components/SettingsPanel";
import TextDisplay from "../components/TextDisplay";
import WebRTCService from "../services/WebRTCService";
import { useRouter } from "next/router"; // To handle auto-filling from QR code

const Home = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [sessionId, setSessionId] = useState("");  // Session ID will be manually entered
    const [webrtcService, setWebrtcService] = useState(null); // Add this state for WebRTC service
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
    const router = useRouter();

    useEffect(() => {
        // Set WebSocket URL from environment variables
        setWebsocketURL(process.env.NEXT_PUBLIC_WS_URL);
        if (router.query.sessionId) {
            setSessionId(router.query.sessionId);
        }
    }, []);

    // Connect to the WebRTC service once session ID is entered and WebSocket URL is set
    useEffect(() => {
        if (sessionId && websocketURL) {
            const webrtc = new WebRTCService((receivedMessage) => {
                const messageData = JSON.parse(receivedMessage);
                console.log("Message received on display:", messageData);

                if (messageData.type === "connected") {
                    console.log("Sender App connected to Display");
                    setIsConnected(true);
                } else if (messageData.type === "typing") {
                    setText("Typing...");
                } else if (messageData.type === "message") {
                    setText(messageData.content);
                }
            }, false);  // false as this is the display app side

            webrtc.connect(websocketURL, sessionId, {
                transports: ['websocket'],
            });

            setWebrtcService(webrtc);  // Set WebRTC service after initialization
            console.log("WebRTC service set for session:", sessionId);

            // This callback is triggered when the WebRTC connection is successfully established
            webrtc.onConnection(() => {
                console.log("Display App connected to WebRTC channel, sending 'connected' signal...");

                // Ensure the channel is ready before sending the "connected" signal
                if (webrtc.isDataChannelReady()) {
                    webrtc.sendMessage(
                        JSON.stringify({
                            type: "connected",
                            content: "Connected"
                        })
                    );
                    console.log("Sent 'connected' message to the sender");
                } else {
                    console.warn("Data channel not ready. Cannot send 'connected' message.");
                }
            });

            return () => {
                webrtc.disconnect();
                setIsConnected(false);
                console.log("Disconnected WebRTC for session:", sessionId);
            };
        }
    }, [sessionId, websocketURL]);

    // Handle user input for session ID
    const handleSessionIdChange = (e) => {
        setSessionId(e.target.value);
    };

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
                    gap="small" // Optional for spacing
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
                        onClick={() => setIsConnected(true)}
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