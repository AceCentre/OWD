import io from "socket.io-client";
import BLEService from "./BLEService";
import WebRTCService from "./WebRTCService";
import { faker } from '@faker-js/faker';
import mDNSService from "./mDNSService"; 
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
    constructor(onMessageReceived) {
        this.onMessageReceived = onMessageReceived;
        this.mdnsService = null;
        this.socket = null;
        this.webrtcService = null;
        this.bleService = new BLEService(onMessageReceived);
        this.isBLEActive = false;
        this.isSocketActive = false;
        this.isMDNSActive = false;
        this.isConnected = false; // Prevent redundant connection attempts
        this.sessionId = generateUniqueSessionId(); // Generate session ID once
        this.isConnectedCallback = null;
        this.onPeerDiscovered = null; // Callback for peer discovery
    }

    onConnected(callback) {
        this.isConnectedCallback = callback;
    }

    async initConnections(role) {
        if (this.isConnected) return; // Prevent duplicate attempts

        try {
            console.log("Trying mDNS...");
            await this.initLocalDiscovery(role);
        } catch (mdnsError) {
            console.warn("mDNS failed:", mdnsError);

            if (!this.isConnected) {
                try {
                    console.log("Trying BLE...");
                    await this.initBLEConnection();
                } catch (bleError) {
                    console.warn("BLE failed:", bleError);

                    if (!this.isConnected) {
                        console.log("Using WebRTC Signaling Server...");
                        this.initSignalingConnection();
                    }
                }
            }
        }
    }

    // Initialize local discovery using mDNS
    async initLocalDiscovery(role) {
        return new Promise((resolve, reject) => {
            this.mdnsService = new mDNSService(role, (name, peerRole) => {
                if (!this.isConnected) {
                    console.log(`Discovered peer: ${name} (${peerRole})`);
                    this.isConnected = true;
                    this.isMDNSActive = true;
                    if (this.isConnectedCallback) this.isConnectedCallback();
                    resolve(); // Resolve once connected
                }
            });

            this.mdnsService.startAdvertising(this.sessionId);
            this.mdnsService.discoverPeers();

            // Timeout after 5 seconds if no peer is discovered
            setTimeout(() => {
                if (!this.isConnected) {
                    this.mdnsService.stopAdvertising();
                    reject(new Error("mDNS discovery timeout"));
                }
            }, 5000);
        });
    }

    // Initialize BLE connection
    async initBLEConnection() {
        if (this.isConnected) return; // Prevent redundant connection

        try {
            await this.bleService.connect();
            this.isBLEActive = true;
            this.isConnected = true;
            console.log("BLE connected");
            if (this.isConnectedCallback) this.isConnectedCallback();
        } catch (err) {
            console.error("BLE connection error:", err);
            throw err; // Propagate to fallback
        }
    }

    // Initialize WebRTC signaling connection
    initSignalingConnection() {
        if (this.isConnected) return; // Prevent redundant connection

        const websocketURL = process.env.NEXT_PUBLIC_WS_URL;

        console.log(`Generated unique session ID: ${this.sessionId}`);
        this.webrtcService = new WebRTCService(this.onMessageReceived);

        this.webrtcService.onChannelOpen(() => {
            console.log("Data channel opened.");
            if (!this.isConnected) {
                this.isConnected = true;
                if (this.isConnectedCallback) {
                    this.isConnectedCallback();
                }
                this.webrtcService.sendMessage(
                    JSON.stringify({ type: messageTypes.CONNECTED })
                );
            }
        });

        this.webrtcService.connect(websocketURL, this.sessionId);
        this.isSocketActive = true;
    }

    stopLocalDiscovery() {
        if (this.mdnsService) {
            this.mdnsService.stopAdvertising();
            this.mdnsService = null;
        }
    }

    sendMessage(message) {
        if (this.webrtcService?.channel?.readyState === "open") {
            this.webrtcService.sendMessage(message);
        } else if (this.isBLEActive) {
            this.bleService.sendMessage(message);
        } else {
            console.warn("No connection available");
        }
    }

    cleanup() {
        if (this.webrtcService) this.webrtcService.disconnect();
        if (this.isBLEActive) this.bleService.disconnect();
        this.stopLocalDiscovery();

        console.log(`Session ID ${this.sessionId} cleaned up`);
    }
}

export default DualService;