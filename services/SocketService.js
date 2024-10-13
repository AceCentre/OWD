
                class SocketService {
                    constructor(url) { this.socket = new WebSocket(url); }
                    sendMessage(data) { this.socket.send(JSON.stringify(data)); }
                }
                export default SocketService;
            