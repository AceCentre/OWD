
        import { Server } from 'ws';

        let wsServer;
        export default function handler(req, res) {
            if (!wsServer) {
                wsServer = new Server({ noServer: true });
                wsServer.on('connection', (socket) => {
                    socket.on('message', (message) => {
                        wsServer.clients.forEach((client) => {
                            if (client !== socket && client.readyState === client.OPEN) {
                                client.send(message);
                            }
                        });
                    });
                });
            }
            if (req.method === 'GET') { res.status(200).json({ status: 'Signaling server active' }); }
        }
        export const config = { api: { bodyParser: false } };
    