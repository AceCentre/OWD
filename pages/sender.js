import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import WebRTCService from "../services/WebRTCService";
import { AntComponents } from "../antComponents/AntComponents";

const SenderApp = () => {
    const router = useRouter();
    const [isConnected, setIsConnected] = useState(false);
    const [message, setMessage] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [webrtcService, setWebrtcService] = useState(null);

    const websocketURL = process.env.NEXT_PUBLIC_WS_URL;

    useEffect(() => {
        if (router.query.sessionId) {
            setSessionId(router.query.sessionId);
        }
    }, [router.query]);

    useEffect(() => {
        if (webrtcService) {
            webrtcService.onChannelOpen(() => {
                if (isConnected && message.length === 0) {
                    webrtcService.sendMessage(
                        JSON.stringify({
                            type: "connected",
                            content: "Connected",
                        })
                    );
                }
            });
        }
    }, [isConnected, webrtcService]);

    useEffect(() => {
        if (
            isConnected &&
            webrtcService &&
            webrtcService.isDataChannelReady() &&
            message.length > 0
        ) {
            webrtcService.sendMessage(
                JSON.stringify({ type: "typing", content: "Writing..." })
            );
        }
    }, [message]);

    const handleSessionId = (e) => {
        const newSessionId = e.target.value;
        setSessionId(newSessionId);

        router.replace(
            {
                pathname: "/sender",
                query: { sessionId: newSessionId },
            },
            undefined,
            { shallow: true }
        );
    };

    const handleConnect = () => {
        if (sessionId) {
            const webrtc = new WebRTCService((receivedMessage) => {
                console.log("Received:", receivedMessage);
            }, true);

            webrtc.onConnection(() => setIsConnected(true));
            webrtc.connect(websocketURL, sessionId, {
                transports: ['websocket'],
            });
            setWebrtcService(webrtc);
        } else {
            console.warn("Session ID is required to connect");
        }
    };

    const sendMessage = () => {
        if (
            webrtcService &&
            isConnected &&
            message.length > 0 &&
            webrtcService.isDataChannelReady()
        ) {
            webrtcService.sendMessage(
                JSON.stringify({ type: "message", content: message })
            );
            setMessage("");
        } else {
            console.warn(
                "Not connected to a display session or message is empty"
            );
        }
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
            className="sender-container"
            gap="middle"
            vertical="true"
        >
            <AntComponents.Layout className="sender-layout">
                <AntComponents.Header className="sender-header">
                    <AntComponents.Title level={2} className="sender-title">
                        Sender App
                    </AntComponents.Title>
                </AntComponents.Header>

                <AntComponents.Content className="sender-input-container">
                    <AntComponents.Input
                        className="sender-input"
                        disabled={isConnected}
                        onChange={handleSessionId}
                        placeholder="Enter Session ID"
                        type="text"
                        value={sessionId}
                    />
                    <AntComponents.Button
                        className="sender-button"
                        disabled={isConnected || !sessionId}
                        onClick={handleConnect}
                        type="primary"
                    >
                        {isConnected ? "Connected" : "Connect"}
                    </AntComponents.Button>
                </AntComponents.Content>

                <AntComponents.Content className="sender-input-container">
                    <AntComponents.Input
                        className="sender-input"
                        disabled={!isConnected}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message"
                        type="text"
                        value={message}
                    />
                    <AntComponents.Button
                        className="sender-button"
                        disabled={!isConnected || !message.trim()}
                        onClick={sendMessage}
                        type="primary"
                    >
                        Send Message
                    </AntComponents.Button>
                </AntComponents.Content>

                <AntComponents.Footer className="sender-footer">
                    <AntComponents.Text
                        className="sender-connect-state"
                        type={isConnected ? "success" : "warning"}
                    >
                        {isConnected ? (
                            <>
                                Connected to display session: <br />
                                {sessionId}
                            </>
                        ) : (
                            "Waiting to connect..."
                        )}
                    </AntComponents.Text>
                </AntComponents.Footer>
            </AntComponents.Layout>
        </AntComponents.Flex>
    );
};

export default SenderApp;
