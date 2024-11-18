import io from "socket.io-client";
import BLEService from "./BLEService";
import WebRTCService from "./WebRTCService";
import { faker } from '@faker-js/faker';
import messageTypes from "../utils/messageTypes.json";

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
    constructor(onMessageReceived, sessionId) {
        this.onMessageReceived = onMessageReceived;
        this.socket = null;
        this.webrtcService = null;
        this.bleService = new BLEService(onMessageReceived);
        this.isBLEActive = false;
        this.isSocketActive = false;
        this.isConnected = false; // Prevent redundant connection attempts
        this.sessionId = sessionId;
        this.isConnectedCallback = null;
        this.connectionType = null; 
    }

    onConnected(callback) {
        this.isConnectedCallback = callback;
    }

    async initConnections() {
        if (this.isConnected) return; // Prevent redundant connection
        const websocketURL = process.env.NEXT_PUBLIC_WS_URL;

        console.log(`Generated unique session ID: ${this.sessionId}`);
        this.webrtcService = new WebRTCService(this.onMessageReceived);

        this.webrtcService.onChannelOpen(() => {
            console.log("Data channel opened.");
            if (!this.isConnected) {
                this.isConnected = true;
                if (this.isConnectedCallback) {
                    this.isConnectedCallback("WebRTC");
                }
            }
        });

        this.webrtcService.connect(websocketURL, this.sessionId);
        this.isSocketActive = true
    }

    // Initialize WebRTC signaling connection
    initSignalingConnection() {
        if (this.isConnected) return; // Prevent redundant connection

        const websocketURL = process.env.NEXT_PUBLIC_WS_URL;

        console.log(`Generated unique session ID: ${this.sessionId}`);
        this.webrtcService = new WebRTCService(this.onMessageReceived);

        this.webrtcService.onChannelOpen(() => {
            console.log("WebRTC data channel opened.");
            if (!this.isConnected) {
                this.isConnected = true;
                if (this.isConnectedCallback) {
                    this.isConnectedCallback("WebRTC");
                }
                this.webrtcService.sendMessage(
                    JSON.stringify({ type: messageTypes.CONNECTED })
                );
                console.log("Sent CONNECTED message via WebRTC.");
            }
        });

        this.webrtcService.connect(websocketURL, this.sessionId);
        this.isSocketActive = true;
    }

    // Initialize BLE connection
    async initBLEConnection() {
        if (!this.bleService.isBluetoothSupported()) {
            console.warn("Web Bluetooth API is not supported in this browser.");
            throw new Error("BLE not supported");
        }

        if (this.isConnected) return; // Prevent redundant connection

        try {
            await this.bleService.connect();
            this.isBLEActive = true;
            this.isConnected = true;
            console.log("BLE connected");
            if (this.isConnectedCallback) this.isConnectedCallback("BLE");
        } catch (err) {
            console.error("BLE connection error:", err);
            throw err; // Propagate to fallback
        }
    }

    sendMessage(message) {
        if (this.webrtcService?.channel?.readyState === "open") {
            this.webrtcService.sendMessage(message);
        } else if (this.isBLEActive) {
            this.bleService.sendMessage(message);
        } else {
            console.warn("No connection available. Message not sent.");
            throw new Error("No connection available to send the message.");
        }
    }


    cleanup() {
        if (this.webrtcService) this.webrtcService.disconnect();
        if (this.isBLEActive) this.bleService.disconnect();

        console.log(`Session ID ${this.sessionId} cleaned up`);
    }
}

export default DualService;
