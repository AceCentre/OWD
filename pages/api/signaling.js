import { Server } from 'ws';

let wsServer;

const sessions = {}; // Store clients per session

export default function handler(req, res) {
    if (!wsServer) {
        wsServer = new Server({ noServer: true });

        wsServer.on('connection', (socket, req) => {
            const params = new URLSearchParams(req.url.split('?')[1]);
            const sessionId = params.get('sessionId');

            if (!sessions[sessionId]) sessions[sessionId] = new Set();
            sessions[sessionId].add(socket);

            socket.on('message', (message) => {
                // Relay the message only to clients within the same session
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

    if (req.method === 'GET') {
        res.status(200).json({ status: 'Signaling server active' });
    }
}

export const config = { api: { bodyParser: false } };