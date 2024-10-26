import { createServer } from "http";
import next from "next";
import { parse } from "url";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    const io = new Server(server, {
        cors: {
            origin: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true,
        },
        transports: ["websocket"],
    });

    const sessions = {};

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
                socket.to(peerId).emit("signal", { peerId: socket.id, data });
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

    server.listen(process.env.PORT || 3000, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${process.env.PORT || 3000}`);
    });
});
