import { createServer } from "http";
import next from "next";
import { parse } from "url";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const allowedOrigin = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

app.prepare().then(() => {
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    // Configure Socket.io to allow CORS with the environment variable
    const io = new Server(server, {
        cors: {
            origin: allowedOrigin,  // Use the environment variable
            methods: ["GET", "POST"],
            credentials: true  // Enable if you're using cookies or auth headers
        }

    const sessions = {};

    io.on("connection", (socket) => {

        socket.on("joinSession", (sessionId) => {

            socket.join(sessionId);

            if (!sessions[sessionId]) {
                sessions[sessionId] = new Set();
            }
            sessions[sessionId].add(socket.id);
        });

        socket.on("signal", (message) => {
            const { sessionId, data } = message;

            socket.to(sessionId).emit("signal", data);
        });

        socket.on("disconnect", () => {
            for (const sessionId in sessions) {
                sessions[sessionId].delete(socket.id);
                if (sessions[sessionId].size === 0) delete sessions[sessionId];
            }
        });
    });

    const port = process.env.PORT || 3000;
    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`);
    });
});
