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

    // Create a new Socket.io server
    const io = new Server(server, {
        cors: {
            origin: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true,
        },
        transports: ["websocket"],
    });

    // Store sessions with connected clients
    const sessions = {};

    io.on("connection", (socket) => {
        console.log(`Client connected: ${socket.id}`);

        // When a client joins a session
        socket.on("joinSession", (sessionId) => {
            if (!sessions[sessionId]) {
                sessions[sessionId] = new Set();
            }
            sessions[sessionId].add(socket.id);
            socket.join(sessionId);
            console.log(`Client ${socket.id} joined session ${sessionId}`);

            // Notify other clients in the session that a peer has joined
            socket.to(sessionId).emit("peerJoined", { sessionId });
        });

        // Handle signaling messages (offer, answer, and ICE candidates)
        socket.on("signal", (message) => {
            const { sessionId, data } = message;

            if (sessions[sessionId]) {
                console.log(
                    `Signal received from client ${socket.id} for session ${sessionId}:`,
                    data
                );

                // Relay the signal to other clients in the session
                socket.to(sessionId).emit("signal", data);

                console.log(`Signal forwarded to session ${sessionId}`);
            } else {
                console.warn(`Session ${sessionId} does not exist`);
            }
        });

        // When a client disconnects
        socket.on("disconnect", () => {
            console.log(`Client ${socket.id} disconnected`);
            for (const sessionId in sessions) {
                // Remove the client from the session
                sessions[sessionId].delete(socket.id);

                // If no clients remain in the session, delete the session
                if (sessions[sessionId].size === 0) {
                    delete sessions[sessionId];
                    console.log(`Session ${sessionId} deleted`);
                }
            }
        });
    });

    // Start the server
    server.listen(process.env.PORT || 3000, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${process.env.PORT || 3000}`);
    });
});
