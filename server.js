import { createServer } from "http";
import next from "next";
import { parse } from "url";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const SESSION_LIFETIME = 7 * 24 * 60 * 60 * 1000;  // 7 days
const sessions = {};  // Track sessions and connected clients

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
            allowUpgrades: true,
        },
        transports: ["websocket", "polling"],
    });

    // Clean up expired sessions periodically
    setInterval(() => {
        const now = Date.now();
        for (const sessionId in sessions) {
            if (now - sessions[sessionId].createdAt > SESSION_LIFETIME) {
                delete sessions[sessionId];  // Expire session if it's too old
                console.log(`Session ${sessionId} expired.`);
            }
        }
    }, 60 * 60 * 1000);  // Run every hour

    io.on("connection", (socket) => {
        console.log(`Client connected: ${socket.id}`);

        socket.on("joinSession", (sessionId) => {
            // Add client to session or create new session
            if (!sessions[sessionId]) {
                sessions[sessionId] = {
                    clients: new Set(),
                    createdAt: Date.now(),
                };
                console.log(`Session created: ${sessionId}`);
            }

            sessions[sessionId].clients.add(socket.id);
            socket.join(sessionId);
            console.log(`Client ${socket.id} joined session: ${sessionId}`);
        });

        socket.on("signal", (message) => {
            const { sessionId, data } = message;
            socket.to(sessionId).emit("signal", data);  // Broadcast signal to session
            console.log(`Signal forwarded to session ${sessionId}:`, data);
        });

        socket.on("disconnect", () => {
            for (const sessionId in sessions) {
                sessions[sessionId].clients.delete(socket.id);
                if (sessions[sessionId].clients.size === 0) {
                    delete sessions[sessionId];
                    console.log(`Session ${sessionId} cleaned up due to no clients.`);
                }
            }
        });
    });

    const port = process.env.PORT || 3000;
    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`);
    });
});