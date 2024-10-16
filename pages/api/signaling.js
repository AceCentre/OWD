import { Server } from 'ws';
import WebRTCService from '../../services/WebRTCService';

let wsServer;
const sessions = {};

export default function handler(req, res) {
    if (!wsServer) {
        wsServer = new Server({ noServer: true });
        const webrtcService = new WebRTCService();

        wsServer.on('connection', (socket, req) => {
            const params = new URLSearchParams(req.url.split('?')[1]);
            const sessionId = params.get('sessionId');

            if (!sessions[sessionId]) sessions[sessionId] = new Set();
            sessions[sessionId].add(socket);

            // Respond to ping messages for heartbeat
            socket.on('message', (message) => {
                if (message === 'ping') {
                    socket.send('pong');
                    return;
                }

                try {
                    // Parse and handle message if it's not a heartbeat
                    const parsedMessage = JSON.parse(message);
                    if (!parsedMessage.type) {
                        console.error('Message missing type field');
                        return;
                    }

                    // Forward to other clients in session
                    sessions[sessionId].forEach((client) => {
                        if (client !== socket && client.readyState === client.OPEN) {
                            client.send(message);
                        }
                    });
                } catch (error) {
                    console.error('Error parsing or handling message:', error.message);
                }
            });

            socket.on('close', () => {
                sessions[sessionId].delete(socket);
                if (sessions[sessionId].size === 0) delete sessions[sessionId];
            });
        });
    }

    res.status(200).end();
}

export const config = { api: { bodyParser: false } };