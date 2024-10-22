import { Server } from "socket.io";

let io;

export default function handler(req, res) {
    if (!io) {
        if (!res.socket.server.io) {
            io = new Server(res.socket.server, {
                transports: ['websocket'],  // Force WebSocket transport
                allowUpgrades: true,        // Allow upgrades from HTTP polling (if needed)
            });
            res.socket.server.io = io;
            const sessions = {};

            io.on("connection", (socket) => {
                socket.on("joinSession", (sessionId) => {
                    socket.join(sessionId);

                    if (!sessions[sessionId]) {
                        sessions[sessionId] = new Set();
                    }

                    sessions[sessionId].add(socket.id);
                    console.log(`Client ${socket.id} joined session ${sessionId}`);
                });

                socket.on("signal", (message) => {
                    const { sessionId, data } = message;
                    console.log(`Signal received in session ${sessionId}:`, data);
                    socket.to(sessionId).emit("signal", data);
                });

                socket.on("disconnect", () => {
                    for (const sessionId in sessions) {
                        sessions[sessionId].delete(socket.id);

                        if (sessions[sessionId].size === 0)
                            delete sessions[sessionId];
                    }
                });
            });

            res.socket.server.io = io;
            console.log("Socket.io server initialized");
        } else {
            console.log("Socket.io server already running");
        }
    }
    res.end();
}

export const config = { api: { bodyParser: false } };
