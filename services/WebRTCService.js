import { v4 as uuidv4 } from 'uuid';

class WebRTCService {
    constructor(onMessageReceived) {
        this.onMessageReceived = onMessageReceived;
        this.peerConnection = new RTCPeerConnection();
        this.channel = this.peerConnection.createDataChannel('messaging');
        this.channel.onmessage = (event) => this.onMessageReceived(event.data);
        this.connectionHandler = null;
        this.heartbeatInterval = null;
        this.reconnectInterval = 1000; // Start with 1 second
        this.isConnected = false;
        this.sessionId = uuidv4(); // Unique session ID

        console.log(`WebRTCService initialized with session ID: ${this.sessionId}`);
    }

    async createOffer() {
        console.log('Creating WebRTC offer...');
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            console.log('Sending WebRTC offer via WebSocket');
            this.socket.send(JSON.stringify({ type: 'offer', sessionId: this.sessionId, data: offer }));
        } else {
            console.warn('WebSocket is not open. Offer not sent.');
        }
    }

    connect(websocketURL) {
        const urlWithSession = `${websocketURL}?sessionId=${this.sessionId}`;
        console.log(`Connecting to WebSocket at: ${urlWithSession}`);
        this.socket = new WebSocket(urlWithSession);

        this.socket.onopen = () => {
            console.log('WebSocket connection established');
            this.reconnectInterval = 1000; // Reset reconnect interval
            this.createOffer();
            this.startHeartbeat();
        };

        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'answer') {
                console.log('Received WebRTC answer');
                this.peerConnection.setRemoteDescription(new RTCSessionDescription(message.data));
                this.isConnected = true;
                if (this.connectionHandler) this.connectionHandler();
            } else if (message === 'pong') {
                console.log('Heartbeat pong received');
            } else {
                console.log('Unknown message received via WebSocket:', message);
            }
        };

        this.socket.onclose = () => {
            console.warn('WebSocket connection closed. Attempting to reconnect...');
            this.stopHeartbeat();
            this.isConnected = false;
            setTimeout(() => this.connect(websocketURL), this.reconnectInterval);
            this.reconnectInterval = Math.min(this.reconnectInterval * 2, 30000); // Exponential backoff
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket encountered an error:', error);
        };
    }

    onConnection(callback) {
        this.connectionHandler = callback;
        console.log('Connection handler set for WebRTCService');
    }

    async sendMessage(message) {
        if (this.channel.readyState === 'open') {
            console.log('Sending message via data channel:', message);
            this.channel.send(message);
        } else {
            console.warn('Data channel is not open. Message not sent.');
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
        console.log('Starting heartbeat...');
        this.heartbeatInterval = setInterval(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                console.log('Sending heartbeat ping');
                this.socket.send('ping');
            }
        }, 5000);
    }

    stopHeartbeat() {
        clearInterval(this.heartbeatInterval);
        console.log('Heartbeat stopped');
    }
}

export default WebRTCService;