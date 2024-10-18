import { io } from "socket.io-client";

class WebRTCService {
    constructor(onMessageReceived, isSender = true) {
        this.onMessageReceived = onMessageReceived;
        this.isSender = isSender;
        this.peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        this.channel = null;

        if (isSender) {
            this.channel = this.peerConnection.createDataChannel("messaging");
            this.channel.onopen = () => console.log("Data channel opened");
            this.channel.onclose = () => console.log("Data channel closed");
            this.channel.onmessage = (event) =>
                this.onMessageReceived(event.data);
        } else {
            this.peerConnection.ondatachannel = (event) => {
                this.channel = event.channel;
                this.channel.onopen = () => console.log("Data channel opened");
                this.channel.onclose = () => console.log("Data channel closed");
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
        this.socket = io(websocketURL);
        this.sessionId = sessionId;

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
            if (this.isSender) this.createOffer();
        });
    }

    onConnection(callback) {
        this.connectionHandler = callback;
    }

    async sendMessage(message) {
        if (this.channel && this.channel.readyState === "open") {
            this.channel.send(message);
        } else {
            console.warn("Data channel is not open. Message not sent.");
        }
    }

    disconnect() {
        if (this.channel) this.channel.close();
        if (this.peerConnection) this.peerConnection.close();
        if (this.socket) this.socket.disconnect();
        console.log("WebRTC and Socket.io connections closed");
    }
}

export default WebRTCService;
