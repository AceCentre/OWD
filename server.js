const express = require('express');
const next = require('next');
const WebSocket = require('ws');
const http = require('http'); // Import http explicitly

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

app.prepare().then(() => {
  const expressApp = express();
  const server = http.createServer(expressApp); // Create http server and pass express app

  // WebSocket server setup
  const wss = new WebSocket.Server({ noServer: true });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    ws.on('message', (message) => {
      console.log(`Received message: ${message}`);
      ws.send('Message received');
    });
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Handle WebSocket upgrade only for /api/signaling
  server.on('upgrade', (request, socket, head) => {
    if (request.url === '/api/signaling') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // Express middleware for API routes and pages
  expressApp.all('*', (req, res) => {
    return handle(req, res);
  });

  // Start server
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});