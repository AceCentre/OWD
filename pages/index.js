import React, { useState, useEffect } from "react";
import DisplayText from "../components/DisplayText";
import QRCodeDisplay from "../components/QRCodeDisplay";
import SettingsPanel from "../components/SettingsPanel";
import WebRTCService from "../services/WebRTCService";
import { v4 as uuidv4 } from "uuid";

const Home = () => {
    const [text, setText] = useState("Waiting for messages...");
    const [settings, setSettings] = useState({
        fontSize: "24px",
        color: "#000",
        speed: 50,
        lines: 3,
    });
    const [isConnected, setIsConnected] = useState(false);
    const [sessionId, setSessionId] = useState("");
    const [websocketURL, setWebsocketURL] = useState("");

    useEffect(() => {
        setSessionId(uuidv4());
    }, []);

    useEffect(() => {
        setWebsocketURL(process.env.NEXT_PUBLIC_WS_URL);
    }, []);

    useEffect(() => {
        if (sessionId && websocketURL) {
            const webrtc = new WebRTCService((receivedMessage) => {
                console.log("Received:", receivedMessage);

                const messageData = JSON.parse(receivedMessage);
                if (messageData.type === "typing") {
                    setText("Writing...");
                } else if (messageData.type === "message") {
                    setText(messageData.content);
                }
            }, false);

            webrtc.connect(websocketURL, sessionId);
            setIsConnected(true);

            return () => {
                webrtc.disconnect();
                setIsConnected(false);
            };
        }
    }, [websocketURL, sessionId]);

    return (
        <div id="display-container">
            <h1>Open Wireless Display</h1>

            {isConnected ? (
                <>
                    <p>Connected to session: {sessionId}</p>
                    <DisplayText text={text} {...settings} />
                </>
            ) : (
                <>
                    <p>Session ID: {sessionId}</p>
                    <QRCodeDisplay sessionId={sessionId} />
                    <p>Scan the QR code to connect from a sender device.</p>
                </>
            )}

            <div
                className="settings-button"
                onClick={() => setIsConnected(!isConnected)}
            >
                ⚙️ Settings
            </div>

            {isConnected && <SettingsPanel onSettingsChange={setSettings} />}
        </div>
    );
};

export default Home;
