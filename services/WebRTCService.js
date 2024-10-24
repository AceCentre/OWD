import { io } from "socket.io-client";

class WebRTCService {
    constructor(onMessageReceived, isSender = true) {
        this.channel = null;
        this.isSender = isSender;
        this.isChannelOpen = false;
        this.onMessageReceived = onMessageReceived;
        this.peerConnection = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.l.google.com:19302",
                },
                {
                    urls: "stun:stun.relay.metered.ca:80",
                },
                {
                    urls: "turn:global.relay.metered.ca:80",
                    username: "dc6707c0bdabae99498a0570",
                    credential: "t0a8EBJnJrZjLTV/",
                },
                {
                    urls: "turn:global.relay.metered.ca:80?transport=tcp",
                    username: "dc6707c0bdabae99498a0570",
                    credential: "t0a8EBJnJrZjLTV/",
                },
                {
                    urls: "turn:global.relay.metered.ca:443",
                    username: "dc6707c0bdabae99498a0570",
                    credential: "t0a8EBJnJrZjLTV/",
                },
                {
                    urls: "turns:global.relay.metered.ca:443?transport=tcp",
                    username: "dc6707c0bdabae99498a0570",
                    credential: "t0a8EBJnJrZjLTV/",
                },
            ],
        });

        this.initializeDataChannel();
        this.setupPeerConnection();
    }

    initializeDataChannel() {
        if (this.isSender) {
            console.log("Creating data channel as sender");
            this.channel = this.peerConnection.createDataChannel("messaging");
            this.setupChannelEvents(this.channel);
        } else {
            this.peerConnection.ondatachannel = (event) => {
                console.log("Data channel received on the receiver");
                this.channel = event.channel;
                this.setupChannelEvents(this.channel);
            };
        }
    }

    setupChannelEvents(channel) {
        channel.onopen = () => {
            console.log("Data channel opened");
            this.isChannelOpen = true;
            if (this.channelOpenCallback) this.channelOpenCallback();
        };

        channel.onclose = () => {
            console.log("Data channel closed");
            this.isChannelOpen = false;
        };

        channel.onerror = (error) => {
            console.error("Data channel error:", error);
        };

        channel.onmessage = (event) => {
            console.log("Data channel message received:", event.data);
            this.onMessageReceived(event.data);
        };
    }

    setupPeerConnection() {
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log("ICE candidate gathered:", event.candidate);
                this.socket.emit("signal", {
                    sessionId: this.sessionId,
                    data: { type: "ice-candidate", candidate: event.candidate },
                });
            } else {
                console.log("All ICE candidates have been sent");
            }
        };

        this.peerConnection.onconnectionstatechange = () => {
            console.log(
                "Connection state changed:",
                this.peerConnection.connectionState
            );
            if (this.peerConnection.connectionState === "connected") {
                console.log("Peers connected successfully");
            } else if (
                this.peerConnection.connectionState === "disconnected" ||
                this.peerConnection.connectionState === "failed"
            ) {
                console.error("Connection failed or disconnected");
            }
        };
    }

    async createOffer() {
        try {
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            console.log("Created and set local offer SDP:", offer.sdp);
            this.socket.emit("signal", {
                sessionId: this.sessionId,
                data: { type: "offer", offer },
            });
        } catch (error) {
            console.error("Error creating or sending offer", error);
        }
    }

    async createAnswer() {
        try {
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            console.log("Created and set local answer SDP:", answer.sdp);
            this.socket.emit("signal", {
                sessionId: this.sessionId,
                data: { type: "answer", answer },
            });
        } catch (error) {
            console.error("Error creating or sending answer", error);
        }
    }

    connect(websocketURL, sessionId) {
        this.sessionId = sessionId;
        console.log(
            `Connecting to WebSocket server at ${websocketURL} with session ID: ${sessionId}`
        );

        this.socket = io(websocketURL, {
            transports: ["websocket"],
            withCredentials: true,
        });

        this.socket.emit("joinSession", this.sessionId);
        console.log(`Joining session with ID: ${this.sessionId}`);

        this.socket.on("connect", () => {
            console.log("WebSocket is connected");
            if (this.isSender) {
                console.log("Sender detected. Creating offer...");
                this.createOffer();
            }
        });

        this.socket.on("disconnect", () => {
            console.log("WebSocket disconnected");
        });

        this.socket.on("signal", async (message) => {
            console.log("Received signal:", message);
            await this.handleSignalMessage(message);
        });

        this.socket.on("peerJoined", async () => {
            console.log("Peer joined session:", this.sessionId);
            if (this.isSender) {
                console.log("Creating offer after peer joined...");
                await this.createOffer();
            }
        });

        setTimeout(() => {
            if (!this.isChannelOpen) {
                console.warn("Data channel did not open within 10 seconds");
            }
        }, 10000);
    }

    async handleSignalMessage(message) {
        
        console.log(this.isSender ? "Sender" : "Receiver", message)
        if (message.type === "answer" && this.isSender) {
            await this.peerConnection.setRemoteDescription(
                new RTCSessionDescription(message.answer)
            );
            console.log(
                "Remote answer set successfully with SDP:",
                message.answer.sdp
            );
        } else if (message.type === "offer" && !this.isSender) {
            console.log("Received offer SDP:", message.offer.sdp);
            await this.peerConnection.setRemoteDescription(
                new RTCSessionDescription(message.offer)
            );
            console.log("Creating and sending answer...");
            await this.createAnswer();
        } else if (message.type === "ice-candidate" && message.candidate) {
            try {
                await this.peerConnection.addIceCandidate(
                    new RTCIceCandidate(message.candidate)
                );
                console.log(
                    "ICE candidate added successfully:",
                    message.candidate
                );
            } catch (e) {
                console.error("Error adding received ICE candidate", e);
            }
        }
    }

    onChannelOpen(callback) {
        this.channelOpenCallback = callback;
        if (this.isChannelOpen && this.channelOpenCallback) {
            this.channelOpenCallback();
        }
    }

    async sendMessage(message) {
        if (this.channel && this.channel.readyState === "open") {
            this.channel.send(message);
            console.log("Message sent:", message);
        } else {
            console.warn("Data channel is not open. Message not sent.");
        }
    }

    disconnect() {
        if (this.channel) {
            console.log("Closing data channel");
            this.channel.close();
        }
        if (this.peerConnection) {
            console.log("Closing peer connection");
            this.peerConnection.close();
        }
        if (this.socket) {
            console.log("Disconnecting from WebSocket");
            this.socket.disconnect();
        }
        console.log("Disconnected from WebRTC service");
    }
}

export default WebRTCService;
