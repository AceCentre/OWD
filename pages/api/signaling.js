import { Server } from 'ws';

let wsServer;

const sessions = {}; // Store clients per session

export default function handler(req, res) {
    if (!wsServer) {
        console.log("Initializing WebSocket server...");
        wsServer = new Server({ noServer: true });

        wsServer.on('connection', (socket, req) => {
            const params = new URLSearchParams(req.url.split('?')[1]);
            const sessionId = params.get('sessionId');
            console.log(`New WebSocket connection established for session ID: ${sessionId}`);

            if (!sessions[sessionId]) {
                sessions[sessionId] = new Set();
                console.log(`Created new session with ID: ${sessionId}`);
            }

            sessions[sessionId].add(socket);
            console.log(`Added client to session ${sessionId}. Total clients in session: ${sessions[sessionId].size}`);

            socket.on('message', (message) => {
                console.log(`Received message in session ${sessionId}:`, message);

                // Relay the message only to clients within the same session
                sessions[sessionId].forEach((client) => {
                    if (client !== socket && client.readyState === client.OPEN) {
                        client.send(message);
                        console.log(`Relayed message to another client in session ${sessionId}`);
                    }
                });
            });

            socket.on('close', () => {
                console.log(`Client disconnected from session ${sessionId}`);
                sessions[sessionId].delete(socket);
                if (sessions[sessionId].size === 0) {
                    delete sessions[sessionId];
                    console.log(`Deleted empty session with ID: ${sessionId}`);
                } else {
                    console.log(`Remaining clients in session ${sessionId}: ${sessions[sessionId].size}`);
                }
            });
        });
    }

    if (req.method === 'GET') {
        console.log("Received GET request to signaling server endpoint");
        res.status(200).json({ status: 'Signaling server active' });
    }
}

export const config = { api: { bodyParser: false } };