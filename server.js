const express = require('express');
const next = require('next');
const WebSocket = require('ws');
const http = require('http');
const WebRTCService = require('./service/webrtcservice');  // Import the WebRTC service

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;
const websocketURL = process.env.NEXT_PUBLIC_WS_URL;  // Retrieve WebSocket URL from environment variables

app.prepare().then(() => {
  const expressApp = express();
  const server = http.createServer(expressApp);

  // WebSocket server setup
  const wss = new WebSocket.Server({ noServer: true });

  // Initialize WebRTC service instance with logging for message events
  const webrtcService = new WebRTCService((message) => {
    console.log("Message received in WebRTC service:", message);
  });

  // Connect WebRTC service to the WebSocket URL from environment variable
  if (websocketURL) {
    webrtcService.connect(websocketURL);
  } else {
    console.error("Error: WebSocket URL (NEXT_PUBLIC_WS_URL) is not defined.");
  }

  // Handle WebSocket connection events and link them to WebRTCService
  wss.on('connection', (ws, req) => {
    console.log("New WebSocket connection in WebRTC service");
    webrtcService.handleConnection(ws);  // Method needed in WebRTCService to manage WebSocket connections
  });

  // Only allow WebSocket upgrades for the /api/signaling path
  server.on('upgrade', (request, socket, head) => {
    if (request.url === '/api/signaling') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // Route all HTTP requests to Next.js
  expressApp.all('*', (req, res) => handle(req, res));

  // Start the server
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});