import { createServer } from "http";
import next from "next";
import { parse } from "url";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const allowedOrigin = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const SESSION_LIFETIME = 7 * 24 * 60 * 60 * 1000;  // 7 days
const sessions = {};  // Track sessions

app.prepare().then(() => {
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    // Configure Socket.io with CORS
    const io = new Server(server, {
        cors: {
            origin: allowedOrigin,
            methods: ["GET", "POST"],
            credentials: true,
            allowUpgrades: true,
        },
        transports: ["websocket", "polling"],  // Ensure WebSocket and polling are enabled
    });

    // Helper: Check if a session is expired
    function isSessionExpired(sessionId) {
        const session = sessions[sessionId];
        if (!session) return true;
        const now = Date.now();
        return now - session.createdAt > SESSION_LIFETIME;
    }

    // Helper: Create a new session
    function createSession(sessionId) {
        if (!sessions[sessionId]) {
            sessions[sessionId] = {
                createdAt: Date.now(),
                clients: new Set()
            };
            console.log(`Session created: ${sessionId}`);
        }
    }

    // Clean up expired sessions periodically
    setInterval(() => {
        for (const sessionId in sessions) {
            if (isSessionExpired(sessionId)) {
                delete sessions[sessionId];
                console.log(`Session expired and deleted: ${sessionId}`);
            }
        }
    }, 60 * 60 * 1000);  // Check every hour

    // Handle WebSocket connection
    io.on("connection", (socket) => {
        console.log(`Client connected: ${socket.id}`);

        // Join session handler
        socket.on("joinSession", (sessionId) => {
            // Create session if it doesn't exist
            createSession(sessionId);

            // Check if session exists and hasn't expired
            if (isSessionExpired(sessionId)) {
                socket.emit("sessionError", "Session expired or nonexistent.");
                return;
            }

            // Add client to session
            socket.join(sessionId);
            sessions[sessionId].clients.add(socket.id);
            console.log(`Client ${socket.id} joined session: ${sessionId}`);
        });

        // Signal handler
        socket.on("signal", (message) => {
            const { sessionId, data } = message;

            // Check if session exists and hasn't expired
            if (isSessionExpired(sessionId)) {
                socket.emit("sessionError", "Session expired or nonexistent.");
                return;
            }

            // Forward the signal to other clients in the session
            socket.to(sessionId).emit("signal", data);
            console.log(`Signal forwarded to session ${sessionId}:`, data);
        });

        // Disconnect handler
        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);
            // Remove the client from all sessions it was part of
            for (const sessionId in sessions) {
                sessions[sessionId].clients.delete(socket.id);
                if (sessions[sessionId].clients.size === 0) {
                    delete sessions[sessionId];  // Clean up empty sessions
                    console.log(`Session ${sessionId} cleaned up due to no clients.`);
                }
            }
        });
    });

    // Start the server
    const port = process.env.PORT || 3000;
    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`);
    });
});