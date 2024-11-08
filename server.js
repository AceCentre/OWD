import { createServer } from "http";
import next from "next";
import { parse } from "url";
import { Server } from "socket.io";
import cron from "node-cron";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const persistentSessions = {};
const sessions = {};

// Helper functions for session access
const getSessionStorage = (isPersistent) => (isPersistent ? persistentSessions : sessions);

const getSession = (sessionId) => sessions[sessionId] || persistentSessions[sessionId];

const deleteSessionIfEmpty = (sessionStorage, sessionId) => {
    if (sessionStorage[sessionId] && sessionStorage[sessionId].size === 0) {
        delete sessionStorage[sessionId];
        console.log(`Deleted session ${sessionId} due to inactivity`);
    }
};

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

    io.on("connection", (socket) => {
        // Join session
        socket.on("joinSession", (sessionId, isPersistent = false) => {
            const sessionStorage = getSessionStorage(isPersistent);

            if (!sessionStorage[sessionId]) {
                sessionStorage[sessionId] = new Set();
                sessionStorage[sessionId].lastAccessed = Date.now();
            }

            sessionStorage[sessionId].lastAccessed = Date.now();
            sessionStorage[sessionId].add(socket.id);
            socket.join(sessionId);

            const peerId = socket.id;
            socket.emit("peerId", { peerId });
            console.log(`Assigned peerId: ${peerId} to socket joining session: ${sessionId}`);

            socket.to(sessionId).emit("peerJoined", { peerId });
            console.log(`Notified other peers in session ${sessionId} that ${peerId} joined`);
        });

        // Relay signaling messages
        socket.on("signal", (message) => {
            const { sessionId, peerId, data } = message;
            console.log(`Server received signal from ${socket.id} for session ${sessionId}, targeting ${peerId}`, data);

            const sessionStorage = getSession(sessionId);
            if (sessionStorage) {
                socket.to(peerId).emit("signal", { peerId: socket.id, data });
                console.log(`Server relayed signal from ${socket.id} to ${peerId}`);
            } else {
                console.warn(`Session ${sessionId} does not exist; signal not relayed`);
            }
        });

        // Handle disconnection
        socket.on("disconnect", () => {
            const handleDisconnection = (sessionStorage) => {
                for (const sessionId in sessionStorage) {
                    if (sessionStorage[sessionId].has(socket.id)) {
                        sessionStorage[sessionId].delete(socket.id);
                        deleteSessionIfEmpty(sessionStorage, sessionId);
                    } else {
                        socket.to(sessionId).emit("peerLeft", { peerId: socket.id });
                    }
                }
            };

            handleDisconnection(sessions);
            handleDisconnection(persistentSessions);
        });
    });

    server.listen(process.env.PORT || 3000, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${process.env.PORT || 3000}`);
    });
});

// Cleanup sessions on a schedule
cron.schedule("0 * * * *", () => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const threeDays = 3 * 24 * 60 * 60 * 1000;

    const cleanupSessions = (sessionStorage, maxAge) => {
        for (const sessionId in sessionStorage) {
            if (now - sessionStorage[sessionId].lastAccessed > maxAge) {
                delete sessionStorage[sessionId];
                console.log(`Deleted session ${sessionId} due to inactivity`);
            }
        }
    };

    cleanupSessions(sessions, oneHour);
    cleanupSessions(persistentSessions, threeDays);
});