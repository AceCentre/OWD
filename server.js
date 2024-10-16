const express = require('express');
const next = require('next');
const WebSocket = require('ws');
const WebRTCService = require('./service/webrtc'); // Your WebRTC service
const http = require('http'); 

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

app.prepare().then(() => {
  const expressApp = express();
  const server = http.createServer(expressApp);

  // Initialize WebSocket server and WebRTC service
  const wss = new WebSocket.Server({ noServer: true });
  const webrtcService = new WebRTCService((message) => {
    console.log("Message received in WebRTC service:", message);
  });
  
  // Directly connect WebRTC service to WebSocket URL
  webrtcService.connect("wss://sea-lion-app-kfgwa.ondigitalocean.app/api/signaling");

  wss.on('connection', (ws, req) => {
    console.log("New WebSocket connection in WebRTC service");
    webrtcService.handleConnection(ws); // Pass WebSocket connections to WebRTC
  });

  server.on('upgrade', (request, socket, head) => {
    if (request.url === '/api/signaling') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // Route HTTP requests to Next.js
  expressApp.all('*', (req, res) => handle(req, res));

  // Start server
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});