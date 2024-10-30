import { io } from "socket.io-client";
import iceServers from "../utils/iceServers";

class WebRTCService {
    constructor(onMessageReceived, isSender = true) {
        this.isSender = isSender;
        this.peerConnections = {};
        this.channels = {};
        this.isChannelOpen = {};
        this.retryCount = {}
        this.maxRetries = 5;
        this.retryInterval = 3000;
        this.channelOpenCallback = null;
        this.onMessageReceived = onMessageReceived;
    }

    initializePeerConnection(peerId) {
        const peerConnection = new RTCPeerConnection({ iceServers });

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.socket.emit("signal", {
                    sessionId: this.sessionId,
                    peerId,
                    data: { type: "ice-candidate", candidate: event.candidate },
                });
            }
        };

        peerConnection.onconnectionstatechange = () => {
            const state = peerConnection.connectionState;
            if (state === "connected") {
                console.log(`Peers connected with ${peerId} successfully`);
                this.retryCount[peerId] = 0;
            } else if (state === "disconnected" || state === "failed") {
                console.error(`Connection failed or disconnected with ${peerId}`);

                if (!this.retryCount[peerId]) this.retryCount[peerId] = 0;

                if (this.retryCount[peerId] < this.maxRetries) {
                    this.retryCount[peerId]++;
                    setTimeout(() => this.retryConnection(peerId), this.retryInterval);
                } else {
                    console.error(`Max retries reached for ${peerId}`);
                    this.cleanUpPeer(peerId);
                }
            }
        };

        return peerConnection;
    }

    async retryConnection(peerId) {
        console.log(`Retrying connection with ${peerId}...`);
        this.cleanUpPeer(peerId);

        const peerConnection = this.initializePeerConnection(peerId);
        this.peerConnections[peerId] = peerConnection;
        this.initializeDataChannel(peerId, peerConnection);

        if (this.isSender) {
            await this.createOffer(peerId);
        }
    }

    initializeDataChannel(peerId, peerConnection) {
        if (this.isSender) {
            const channel = peerConnection.createDataChannel("messaging");
            this.setupChannelEvents(peerId, channel);
            this.channels[peerId] = channel;
        } else {
            peerConnection.ondatachannel = (event) => {
                const channel = event.channel;
                this.setupChannelEvents(peerId, channel);
                this.channels[peerId] = channel;
            };
        }
    }

    setupChannelEvents(peerId, channel) {
        channel.onopen = () => {
            console.log(`Data channel with ${peerId} opened`);
            this.isChannelOpen[peerId] = true;
            if (this.channelOpenCallback) this.channelOpenCallback(peerId);
        };

        channel.onclose = () => {
            console.log(`Data channel with ${peerId} closed`);
            this.isChannelOpen[peerId] = false;
        };

        channel.onerror = (error) => {
            console.error("Data channel error:", error);
            // Avoid calling close here to prevent unintended premature closure
            // Only log the error and monitor if channel can still function
        };

        channel.onmessage = (event) => {
            console.log("Raw message received on data channel:", event.data);
            this.onMessageReceived(event.data, peerId);
        };

        if (channel.readyState === "open") {
            this.isChannelOpen[peerId] = true;
            if (this.channelOpenCallback) {
                this.channelOpenCallback(peerId);
            }
        }
    }

    async createOffer(peerId) {
        const peerConnection = this.peerConnections[peerId];
        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            this.socket.emit("signal", {
                sessionId: this.sessionId,
                peerId,
                data: { type: "offer", offer },
            });
        } catch (error) {
            console.error(
                `Error creating or sending offer for ${peerId}`,
                error
            );
        }
    }

    async createAnswer(peerId) {
        const peerConnection = this.peerConnections[peerId];
        try {
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            this.socket.emit("signal", {
                sessionId: this.sessionId,
                peerId,
                data: { type: "answer", answer },
            });
        } catch (error) {
            console.error(
                `Error creating or sending answer for ${peerId}`,
                error
            );
        }
    }

    connect(websocketURL, sessionId) {
        this.sessionId = sessionId;

        this.socket = io(websocketURL, {
            transports: ["websocket"],
            withCredentials: true,
        });

        this.socket.emit("joinSession", this.sessionId);

        this.socket.on("peerId", (data) => {
            this.peerId = data.peerId;
        });

        this.socket.on("signal", async (message) => {
            const { peerId } = message;
            await this.handleSignalMessage(peerId, message.data);
        });

        this.socket.on("peerJoined", async (data) => {
            const peerId = data.peerId;

            if (this.isSender) {
                const peerConnection = this.initializePeerConnection(peerId);
                this.peerConnections[peerId] = peerConnection;
                this.initializeDataChannel(peerId, peerConnection);
                await this.createOffer(peerId);
            } else {
                if (!this.peerConnections[peerId]) {
                    const peerConnection =
                        this.initializePeerConnection(peerId);
                    this.peerConnections[peerId] = peerConnection;
                }
            }
        });

        this.socket.on("peerLeft", (data) => {
            this.cleanUpPeer(data.peerId);
        });
    }

    async handleSignalMessage(peerId, message) {
        let peerConnection = this.peerConnections[peerId];

        if (!peerConnection) {
            peerConnection = this.initializePeerConnection(peerId);
            this.peerConnections[peerId] = peerConnection;

            if (!this.isSender && message.type === "offer") {
                this.initializeDataChannel(peerId, peerConnection);
            }
        }

        if (message.type === "answer" && this.isSender) {
            await peerConnection.setRemoteDescription(
                new RTCSessionDescription(message.answer)
            );
        } else if (message.type === "offer" && !this.isSender) {
            await peerConnection.setRemoteDescription(
                new RTCSessionDescription(message.offer)
            );
            await this.createAnswer(peerId);
        } else if (message.type === "ice-candidate" && message.candidate) {
            try {
                await peerConnection.addIceCandidate(
                    new RTCIceCandidate(message.candidate)
                );
            } catch (e) {
                console.error("Error adding received ICE candidate", e);
            }
        }
    }

    onChannelOpen(callback) {
        this.channelOpenCallback = callback;
    }

    async sendMessage(message) {
        Object.keys(this.channels).forEach((peerId) => {
            const channel = this.channels[peerId];
            if (channel && channel.readyState === "open") {
                console.log(`Sending message to ${peerId}:`, message)
                channel.send(message);
            } else {
                console.warn(
                    `Data channel is not open for ${peerId}. Message not sent.`
                );
            }
        });
    }

    disconnect() {
        Object.keys(this.channels).forEach((peerId) => {
            const channel = this.channels[peerId];
            if (channel) channel.close();
        });

        Object.keys(this.peerConnections).forEach((peerId) => {
            const peerConnection = this.peerConnections[peerId];
            if (peerConnection) peerConnection.close();
        });

        if (this.socket) this.socket.disconnect();
    }

    cleanUpPeer(peerId) {
        if (this.peerConnections[peerId]) {
            this.peerConnections[peerId].close();
            delete this.peerConnections[peerId];
        }
        if (this.channels[peerId]) {
            this.channels[peerId].close();
            delete this.channels[peerId];
        }
    }
}

export default WebRTCService;
