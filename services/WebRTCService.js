import { v4 as uuidv4 } from 'uuid';

class WebRTCService {
    constructor(onMessageReceived) {
        this.onMessageReceived = onMessageReceived;
        this.peerConnection = new RTCPeerConnection();
        this.channel = this.peerConnection.createDataChannel('messaging');
        this.channel.onmessage = (event) => this.onMessageReceived(event.data);
        this.connectionHandler = null; // Handler for connection confirmation
        this.heartbeatInterval = null;
        this.reconnectInterval = 1000; // Start with 1 second
        this.isConnected = false;
        this.sessionId = uuidv4(); // Unique session ID
    }

    async createOffer() {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        // Send the offer along with the session ID to the signaling server
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type: 'offer', sessionId: this.sessionId, data: offer }));
        }
    }

    connect(websocketURL) {
        // Include session ID in the WebSocket URL
        const urlWithSession = `${websocketURL}?sessionId=${this.sessionId}`;
        this.socket = new WebSocket(urlWithSession);

        this.socket.onopen = () => {
            console.log('WebSocket connection established');
            this.reconnectInterval = 1000; // Reset reconnect interval
            this.createOffer(); // Create offer after WebSocket is open
            this.startHeartbeat();
        };

        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'answer') {
                this.peerConnection.setRemoteDescription(new RTCSessionDescription(message.data));
                this.isConnected = true;
                if (this.connectionHandler) this.connectionHandler();
            } else if (message === 'pong') {
                console.log('Heartbeat pong received');
            }
        };

        this.socket.onclose = () => {
            console.log('WebSocket connection closed, attempting to reconnect...');
            this.stopHeartbeat();
            this.isConnected = false;
            setTimeout(() => this.connect(websocketURL), this.reconnectInterval);
            this.reconnectInterval = Math.min(this.reconnectInterval * 2, 30000); // Exponential backoff, max 30 seconds
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    onConnection(callback) {
        this.connectionHandler = callback; // Set the connection confirmation callback
    }

    async sendMessage(message) {
        if (this.channel.readyState === 'open') {
            this.channel.send(message);
        } else {
            console.warn('Data channel is not open');
        }
    }

    disconnect() {
        if (this.channel) this.channel.close();
        if (this.peerConnection) this.peerConnection.close();
        if (this.socket) this.socket.close();
        this.stopHeartbeat();
        console.log("WebRTC and WebSocket connections closed");
    }

    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send('ping');
            }
        }, 5000); // Send a ping every 5 seconds
    }

    stopHeartbeat() {
        clearInterval(this.heartbeatInterval);
    }
}

export default WebRTCService;