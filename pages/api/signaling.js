import { Server } from "socket.io";

let io;
const sessions = {};

export default function socketHandler(req, res) {
    if (!io) {
        const httpServer = res.socket.server;

        io = new Server(httpServer, {
            cors: {
                origin:
                    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
                methods: ["GET", "POST"],
                credentials: true,
            },
            transports: ["websocket"],
        });

        io.on("connection", (socket) => {
            socket.on("joinSession", (sessionId) => {
                if (!sessions[sessionId]) {
                    sessions[sessionId] = new Set();
                }

                sessions[sessionId].add(socket.id);
                socket.join(sessionId);

                const peerId = socket.id;
                socket.emit("peerId", { peerId });

                socket.to(sessionId).emit("peerJoined", { peerId });
            });

            socket.on("signal", (message) => {
                const { sessionId, peerId, data } = message;

                if (sessions[sessionId]) {
                    socket
                        .to(peerId)
                        .emit("signal", { peerId: socket.id, data });
                } else {
                    console.warn(`Session ${sessionId} does not exist`);
                }
            });

            socket.on("disconnect", () => {
                for (const sessionId in sessions) {
                    if (sessions[sessionId].has(socket.id)) {
                        sessions[sessionId].delete(socket.id);

                        if (sessions[sessionId].size === 0) {
                            delete sessions[sessionId];
                        } else {
                            socket
                                .to(sessionId)
                                .emit("peerLeft", { peerId: socket.id });
                        }
                    }
                }
            });
        });

        console.log("Socket.IO server initialized");
    } else {
        console.log("Socket.IO server already initialized");
    }

    res.end();
}
