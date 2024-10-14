
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
            }

            async sendMessage(message) {
                if (this.channel.readyState === 'open') {
                    this.channel.send(message);
                }
            }
        }

        export default WebRTCService;
    