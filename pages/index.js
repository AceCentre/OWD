import React, { useState, useEffect } from "react";
import { Typography, Button, Input, Modal, Row, Col, QRCode } from "antd";
import { v4 as uuidv4 } from "uuid";
import WebRTCService from "../services/WebRTCService";

const { Title, Text } = Typography;

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
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        setSessionId(uuidv4());
    }, []);

    useEffect(() => {
        setWebsocketURL(process.env.NEXT_PUBLIC_WS_URL);
    }, []);

    useEffect(() => {
        if (sessionId && websocketURL) {
            const webrtc = new WebRTCService((receivedMessage) => {
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

    const openSettings = () => setIsSettingsOpen(true);
    const closeSettings = () => setIsSettingsOpen(false);

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <Row justify="center" style={{ marginBottom: '20px' }}>
                <Col>
                    <Title level={2}>Open Wireless Display</Title>
                </Col>
            </Row>

            <Row justify="center">
                <Col>
                    {isConnected && !isSettingsOpen ? (
                        <Text style={{ fontSize: settings.fontSize, color: settings.color }}>
                            {text}
                        </Text>
                    ) : (
                        <div>
                            <QRCode value={sessionId} />
                            <Text strong>Session ID: {sessionId}</Text>
                            <p>Scan the QR code to connect from a sender device.</p>
                        </div>
                    )}
                </Col>
            </Row>

            <Row justify="center" style={{ marginTop: '20px' }}>
                <Col>
                    <Button type="primary" onClick={openSettings}>
                        Settings
                    </Button>
                </Col>
            </Row>

            <Modal
                title="Settings"
                visible={isSettingsOpen}
                onOk={closeSettings}
                onCancel={closeSettings}
            >
                <Input
                    addonBefore="Font Size"
                    value={settings.fontSize}
                    onChange={(e) => setSettings({ ...settings, fontSize: e.target.value })}
                />
                <Input
                    addonBefore="Color"
                    type="color"
                    value={settings.color}
                    onChange={(e) => setSettings({ ...settings, color: e.target.value })}
                />
                <Input
                    addonBefore="Speed"
                    value={settings.speed}
                    onChange={(e) => setSettings({ ...settings, speed: e.target.value })}
                />
                <Input
                    addonBefore="Lines"
                    value={settings.lines}
                    onChange={(e) => setSettings({ ...settings, lines: e.target.value })}
                />
            </Modal>
        </div>
    );
};

export default Home;