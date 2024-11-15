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
    const [messageHistory, setMessageHistory] = useState([]);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0); 
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
        if (router.query.sessionId && sessionId === "") {
            setSessionId(router.query.sessionId);
        }
    }, [router]);

    // Initialize WebRTCService if sessionId and websocketURL are available
    useEffect(() => {
        console.log("Attempting to connect:", sessionId, websocketURL);
        if (sessionId && websocketURL) {            
            const service = new WebRTCService((receivedMessage) => {
                 console.log("Received message on Receiver:", receivedMessage); 

                try {
                    const messageData = JSON.parse(receivedMessage);
                    console.log("Parsed message data:", messageData);
                    setLive(messageData.isLiveTyping);
                    if (messageData.type === messageTypes.MESSAGE) {
                        setText(messageData.content);
                        setMessageHistory((prevHistory) => {
                            const newHistory = [...prevHistory, messageData.content];
                            return newHistory.slice(-5); // Keep last 5 messages
                        });
                    }
                } catch (error) {
                    console.error("Error parsing message:", error);
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

    useEffect(() => {
    if (settings.enableHistory && messageHistory.length > 0) {
        setCurrentMessageIndex(messageHistory.length - 1); // Set to "Live"
    }
    }, [settings.enableHistory, messageHistory]);

    const navigateHistory = (direction) => {
        setCurrentMessageIndex((prevIndex) => {
            const newIndex = prevIndex + direction;
            return Math.max(0, Math.min(newIndex, messageHistory.length - 1));
        });
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
                    text={settings.enableHistory ? (messageHistory[currentMessageIndex] || text) : text}
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

        {isConnected && settings.enableHistory ? (
            <AntComponents.Flex direction="row" gap="small">
                <AntComponents.Button 
                    onClick={() => navigateHistory(-1)} 
                    disabled={currentMessageIndex === 0}
                >
                    ←
                </AntComponents.Button>
                <AntComponents.Button 
                    onClick={() => setCurrentMessageIndex(messageHistory.length - 1)}
                    style={{
                        backgroundColor: currentMessageIndex === messageHistory.length - 1 ? "rgba(255, 255, 0, 0.4)" : undefined,
                        color: currentMessageIndex === messageHistory.length - 1 ? "black" : undefined,
                        animation: currentMessageIndex === messageHistory.length - 1 ? "glow 1.5s infinite" : undefined, // Pulsating glow
                    }}
                >
                    Live
                </AntComponents.Button>
                <AntComponents.Button 
                    onClick={() => navigateHistory(1)} 
                    disabled={currentMessageIndex === messageHistory.length - 1}
                >
                    →
                </AntComponents.Button>
            </AntComponents.Flex>
            ) : null}
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