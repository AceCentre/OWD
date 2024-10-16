import { Server } from 'ws';
import WebRTCService from '../../services/WebRTCService';

let wsServer;
const sessions = {}; // Store clients per session

export default function handler(req, res) {
    if (!wsServer) {
        wsServer = new Server({ noServer: true });
        const webrtcService = new WebRTCService();

        wsServer.on('connection', (socket, req) => {
            const params = new URLSearchParams(req.url.split('?')[1]);
            const sessionId = params.get('sessionId');

            if (!sessions[sessionId]) sessions[sessionId] = new Set();
            sessions[sessionId].add(socket);

            socket.on('message', (message) => {
                sessions[sessionId].forEach((client) => {
                    if (client !== socket && client.readyState === client.OPEN) {
                        client.send(message);
                    }
                });
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