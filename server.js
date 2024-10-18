const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");
const { parse } = require("url");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    const io = new Server(server);

    const sessions = {};

    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);

        socket.on("joinSession", (sessionId) => {
            console.log(`Client ${socket.id} joined session: ${sessionId}`);

            socket.join(sessionId);

            if (!sessions[sessionId]) {
                sessions[sessionId] = new Set();
            }
            sessions[sessionId].add(socket.id);
        });

        socket.on("signal", (message) => {
            const { sessionId, data } = message;
            console.log(`Received message for session ${sessionId}:`, data);

            socket.to(sessionId).emit("signal", data);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
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
