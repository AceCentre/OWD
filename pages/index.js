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
import CopyButton from "../components/receiver/CopyButton";

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

    const handleCopyText = async () => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };

    // Extract sessionId from URL query
    useEffect(() => {
        if (router.query.sessionId) {
            setSessionId(router.query.sessionId);
        }
    }, [router]);

    // Initialize WebRTCService if sessionId and websocketURL are available
    useEffect(() => {
        if (sessionId && websocketURL) {
            const service = new WebRTCService((receivedMessage) => {
                const messageData = JSON.parse(receivedMessage);

                setLive(messageData.isLiveTyping);
                if (messageData.type === messageTypes.MESSAGE) {
                    setText(messageData.content);
                }
            }, false);

            service.onChannelOpen(() => {
                setIsConnected(true);
                console.log("Data channel opened with sender.");
                service.sendMessage(
                    JSON.stringify({ type: messageTypes.CONNECTED })
                );
                console.log("Sent CHANNEL_CONNECTED message to sender.");
            });

            service.connect(websocketURL, sessionId);
            setWebrtcService(service);

            return () => {
                // Clean up on unmount
                service.disconnect();
                setIsConnected(false);
            };
        }
    }, [sessionId, websocketURL]);

    const handleConnect = () => {
        if (sessionId && websocketURL) {
            const service = new WebRTCService((receivedMessage) => {
                const messageData = JSON.parse(receivedMessage);

                setLive(messageData.isLiveTyping);
                if (messageData.type === messageTypes.MESSAGE) {
                    setText(messageData.content);
                }
            }, false);

            service.onChannelOpen(() => {
                setIsConnected(true);
                service.sendMessage(
                    JSON.stringify({ type: messageTypes.CONNECTED })
                );
            });

            service.connect(websocketURL, sessionId);
            setWebrtcService(service);
        } else {
            console.warn(
                "Session ID and WebSocket URL are required to connect."
            );
        }
    };

    const handleSessionIdChange = (e) => {
        setSessionId(e.target.value);
    };

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
        
        <div className="button-container">
            <SettingsButton
                isConnected={isConnected}
                setShowSettings={setShowSettings}
                sessionId={sessionId}
            />
            {settings.showCopyButton && (
            <CopyButton onCopy={handleCopyText} isConnected={isConnected} />
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