import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AntComponents } from "../antComponents/AntComponents";
import SessionInput from "../components/receiver/SessionInput";
import SettingsButton from "../components/receiver/SettingsButton";
import SettingsPanel from "../components/receiver/SettingsPanel";
import TextDisplay from "../components/receiver/TextDisplay";
import messageTypes from "../utils/messageTypes.json";
import initialTextSettings from "../utils/initialTextSettings.json";
import WebRTCService from "../services/WebRTCService";

const Home = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [sessionId, setSessionId] = useState("");
    const [webrtcService, setWebrtcService] = useState(null);
    const [settings, setSettings] = useState(initialTextSettings);
    const [live, setLive] = useState(false);
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

                setLive(messageData.isLiveTyping);

                if (messageData.type === messageTypes.CONNECTED) {
                    setIsConnected(true);
                } else if (messageData.type === messageTypes.TYPING) {
                    setText("Typing...");
                } else if (messageData.type === messageTypes.MESSAGE) {
                    setText(messageData.content);
                }
            }, false);

            webrtc.onChannelOpen(() => {
                setIsConnected(true);
                webrtc.sendMessage(
                    JSON.stringify({ type: messageTypes.CHANNEL_CONNECTED })
                );
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
            className="receiver-container"
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
                    animationType={live ? "none" : settings.animationType}
                    backgroundColor={settings.backgroundColor}
                    color={settings.color}
                    lines={settings.lines}
                    speed={settings.speed}
                />
            ) : (
                <SessionInput
                    sessionId={sessionId}
                    handleSessionIdChange={handleSessionIdChange}
                    handleConnect={handleConnect}
                />
            )}

            <SettingsButton
                isConnected={isConnected}
                setShowSettings={setShowSettings}
                sessionId={sessionId}
            />

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
