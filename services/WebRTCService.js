class WebRTCService {
    constructor(onMessageReceived) {
        this.onMessageReceived = onMessageReceived;
        this.peerConnection = new RTCPeerConnection();
        this.channel = this.peerConnection.createDataChannel('messaging');
        this.channel.onmessage = (event) => this.onMessageReceived(event.data);
        this.connectionHandler = null; // Handler for connection confirmation
    }

    async createOffer(sessionId) {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        // Send the offer along with the session ID to the signaling server
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type: 'offer', sessionId, data: offer }));
        }
    }

    connect(websocketURL, sessionId) {
        // Include session ID in the WebSocket URL if necessary
        const urlWithSession = `${websocketURL}?sessionId=${sessionId}`;
        this.socket = new WebSocket(urlWithSession);
        
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'answer') {
                this.peerConnection.setRemoteDescription(new RTCSessionDescription(message.data));
                if (this.connectionHandler) this.connectionHandler(); // Trigger connection confirmation
            }
        };
        
        this.socket.onopen = () => {
            console.log('WebSocket connection established');
            this.createOffer(sessionId); // Create offer after WebSocket is open
        };
    }

    onConnection(callback) {
        this.connectionHandler = callback; // Set the connection confirmation callback
    }

    async sendMessage(message) {
        if (this.channel.readyState === 'open') {
            this.channel.send(message);
        }
    }

    disconnect() {
        if (this.channel) {
            this.channel.close();
        }
        if (this.peerConnection) {
            this.peerConnection.close();
        }
        if (this.socket) {
            this.socket.close();
        }
        console.log("WebRTC and WebSocket connections closed");
    }
}

export default WebRTCService;