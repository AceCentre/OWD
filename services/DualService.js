import io from "socket.io-client";
import BLEService from "./BLEService";
import WebRTCService from "./WebRTCService";
import { faker } from '@faker-js/faker';

// Store active sessions here
const sessions = {};

// Function to generate a word-based session ID using faker
const generateWordCode = () => {
    const word1 = faker.word.adjective();
    const word2 = faker.word.adjective();
    const word3 = faker.animal.type();
    return `${word1}-${word2}-${word3}`; // e.g., clever-blue-elephant
};

// Check for collision and generate a new code if collision happens
const generateUniqueSessionId = () => {
    let sessionId;
    do {
        sessionId = generateWordCode();
    } while (sessions[sessionId]);  // Regenerate if session ID is taken
    return sessionId;
};

class DualService {
    constructor(onMessageReceived) {
        this.onMessageReceived = onMessageReceived;
        this.socket = null;
        this.webrtcService = null;
        this.bleService = new BLEService(onMessageReceived);
        this.isBLEActive = false;
        this.isSocketActive = false;
        this.sessionId = null;
    }

    initConnections() {
        const websocketURL = process.env.NEXT_PUBLIC_WS_URL;
        const sessionId = generateUniqueSessionId();  // Generate unique session ID

        // Add the sessionId to the sessions object to track it
        sessions[sessionId] = true;
        this.sessionId = sessionId;

        console.log(`Generated unique session ID: ${sessionId}`); // For debugging

        // Initialize WebRTC connection with unique session ID
        this.webrtcService = new WebRTCService(this.onMessageReceived);
        this.webrtcService.connect(websocketURL, sessionId); // Use unique session ID

        // Attempt to connect via BLE as well
        this.bleService
            .connect()
            .then(() => {
                this.isBLEActive = true;
                console.log("BLE connected");
            })
            .catch((err) => console.error("BLE connection error:", err));
    }

    sendMessage(message) {
        // Try to send message via WebRTC if connected
        if (
            this.webrtcService &&
            this.webrtcService.channel &&
            this.webrtcService.channel.readyState === "open"
        ) {
            this.webrtcService.sendMessage(message);
        }
        // Otherwise, try to send via BLE
        else if (this.isBLEActive) {
            this.bleService.sendMessage(message);
        }
        // If both connections are unavailable
        else {
            console.warn("No connection available");
        }
    }

    cleanup() {
        // Disconnect WebRTC and BLE when no longer needed
        if (this.webrtcService) this.webrtcService.disconnect();
        if (this.isBLEActive) this.bleService.disconnect();

        // Remove the session from the sessions list when done
        if (this.sessionId && sessions[this.sessionId]) {
            delete sessions[this.sessionId];
            console.log(`Session ID ${this.sessionId} cleaned up`);
        }
    }
}

export default DualService;