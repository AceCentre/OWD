import { io } from "socket.io-client";

class WebRTCService {
    constructor(onMessageReceived, isSender = true) {
        this.channel = null;
        this.channelOpenCallback = null;
        this.isChannelOpen = false;
        this.isSender = isSender;
        this.onMessageReceived = onMessageReceived;
        var myPeerConnection = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.l.google.com:19302",  // Google's public STUN server
                },
                {
                    urls: "stun:stun.relay.metered.ca:80",  // Metered's STUN server
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

        if (isSender) {
            this.channel = this.peerConnection.createDataChannel("messaging");
            this.channel.onopen = () => {
                this.isChannelOpen = true;
                if (this.channelOpenCallback) this.channelOpenCallback();
            };
            this.channel.onclose = () => (this.isChannelOpen = false);
            this.channel.onmessage = (event) =>
                this.onMessageReceived(event.data);
        } else {
            this.peerConnection.ondatachannel = (event) => {
                this.channel = event.channel;
                this.channel.onopen = () => {
                    this.isChannelOpen = true;
                    if (this.channelOpenCallback) this.channelOpenCallback();
                };
                this.channel.onclose = () => (this.isChannelOpen = false);
                this.channel.onmessage = (msgEvent) =>
                    this.onMessageReceived(msgEvent.data);
            };
        }

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.socket.emit("signal", {
                    sessionId: this.sessionId,
                    data: { type: "ice-candidate", candidate: event.candidate },
                });
            }
        };

        this.connectionHandler = null;
        this.isConnected = false;
    }

    async createOffer() {
        if (this.isSender) {
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            this.socket.emit("signal", {
                sessionId: this.sessionId,
                data: { type: "offer", offer },
            });
        }
    }

    connect(websocketURL, sessionId) {
        this.sessionId = sessionId;
        this.socket = io(websocketURL, {
            transports: ['websocket'],  // Force WebSocket
            withCredentials: true       // Enable credentials if necessary
        });

        this.socket.emit("joinSession", this.sessionId);

        this.socket.on("signal", async (message) => {
            if (this.isSender) {
                if (message.type === "answer") {
                    await this.peerConnection.setRemoteDescription(
                        new RTCSessionDescription(message.answer)
                    );
                    this.isConnected = true;
                    if (this.connectionHandler) this.connectionHandler();
                }
            } else {
                if (message.type === "offer") {
                    await this.peerConnection.setRemoteDescription(
                        new RTCSessionDescription(message.offer)
                    );
                    const answer = await this.peerConnection.createAnswer();
                    await this.peerConnection.setLocalDescription(answer);
                    this.socket.emit("signal", {
                        sessionId: this.sessionId,
                        data: { type: "answer", answer },
                    });
                }
            }

            if (message.type === "ice-candidate" && message.candidate) {
                try {
                    await this.peerConnection.addIceCandidate(
                        new RTCIceCandidate(message.candidate)
                    );
                } catch (e) {
                    console.error("Error adding received ICE candidate", e);
                }
            }
        });

        this.socket.on("connect", () => {
            console.log("WebSocket connected to:", websocketURL);
            if (this.isSender) this.createOffer();
        });
    }

    onConnection(callback) {
        this.connectionHandler = callback;
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
        } else {
            console.warn("Data channel is not open. Message not sent.");
        }
    }

    isDataChannelReady() {
        return this.isChannelOpen;
    }

    disconnect() {
        if (this.channel) this.channel.close();
        if (this.peerConnection) this.peerConnection.close();
        if (this.socket) this.socket.disconnect();
    }
}

export default WebRTCService;
