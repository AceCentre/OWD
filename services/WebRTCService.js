class WebRTCService {
    constructor(onMessageReceived) {
        this.onMessageReceived = onMessageReceived;
        this.peerConnection = new RTCPeerConnection();
        this.channel = this.peerConnection.createDataChannel('messaging');
        this.channel.onmessage = (event) => this.onMessageReceived(event.data);
    }

    async createOffer() {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        // Use WebSocket signaling if necessary
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type: 'offer', data: offer }));
        }
    }

    connect(websocketURL) {
        this.socket = new WebSocket(websocketURL);
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'answer') {
                this.peerConnection.setRemoteDescription(new RTCSessionDescription(message.data));
            }
        };
        this.socket.onopen = () => console.log('WebSocket connection established');
    }

    async sendMessage(message) {
        if (this.channel.readyState === 'open') {
            this.channel.send(message);
        }
    }
}

export default WebRTCService;