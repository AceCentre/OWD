const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('ws');
const WebRTCService = require('./services/WebRTCService');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const wsServer = new Server({ noServer: true });
const sessions = {};

wsServer.on('connection', (socket, req) => {
  const params = new URLSearchParams(req.url.split('?')[1]);
  const sessionId = params.get('sessionId');

  if (!sessions[sessionId]) sessions[sessionId] = new Set();
  sessions[sessionId].add(socket);

  socket.on('message', (message) => {
    if (message === 'ping') {
      socket.send('pong');
      return;
    }

    try {
      const parsedMessage = JSON.parse(message);
      if (!parsedMessage.type) {
        console.error('Message missing type field');
        return;
      }

      sessions[sessionId].forEach((client) => {
        if (client !== socket && client.readyState === client.OPEN) {
          client.send(message);
        }
      });
    } catch (error) {
      console.error('Error parsing or handling message:', error.message);
    }
  });

  socket.on('close', () => {
    sessions[sessionId].delete(socket);
    if (sessions[sessionId].size === 0) delete sessions[sessionId];
  });
});

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  server.on('upgrade', (request, socket, head) => {
    const { pathname } = parse(request.url);

    if (pathname === '/api/signalling') {
      wsServer.handleUpgrade(request, socket, head, (ws) => {
        wsServer.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
