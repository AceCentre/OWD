import { Server } from "socket.io";

let io;

export default function handler(req, res) {
    if (!res.socket.server.io) {
        io = new Server(res.socket.server, {
            transports: ["websocket"],
            allowUpgrades: true,
        });
        res.socket.server.io = io;
        const sessions = {};

        io.on("connection", (socket) => {
            socket.on("createSession", (sessionId) => {
                if (!sessions[sessionId]) {
                    sessions[sessionId] = new Set();
                }
                console.log(
                    `Session ${sessionId} created by sender ${socket.id}`
                );
            });

            socket.on("joinSession", (sessionId) => {
                if (!sessions[sessionId]) {
                    sessions[sessionId] = new Set();
                }

                sessions[sessionId].add(socket.id);
                socket.join(sessionId);
                console.log(`Client ${socket.id} joined session ${sessionId}`);

                socket.to(sessionId).emit("peerJoined", { sessionId });
            });

            socket.on("signal", (message) => {
                const { sessionId, data } = message;
                if (sessions[sessionId]) {
                    console.log(
                        `Signal received in session ${sessionId}:`,
                        data
                    );
                    socket.to(sessionId).emit("signal", data);
                    console.log(`Signal forwarded to session ${sessionId}`);
                } else {
                    console.warn(`Session ${sessionId} does not exist`);
                }
            });

            socket.on("disconnect", () => {
                for (const sessionId in sessions) {
                    sessions[sessionId].delete(socket.id);
                    if (sessions[sessionId].size === 0)
                        delete sessions[sessionId];
                }
                console.log(`Client ${socket.id} disconnected`);
            });
        });

        console.log("Socket.io server initialized");
    } else {
        console.log("Socket.io server already running");
    }
    res.end();
}

export const config = { api: { bodyParser: false } };
