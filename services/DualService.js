import io from "socket.io-client";
import BLEService from "./BLEService";
import WebRTCService from "./WebRTCService";

class DualService {
    constructor(onMessageReceived) {
        this.onMessageReceived = onMessageReceived;
        this.socket = null;
        this.webrtcService = null;
        this.bleService = new BLEService(onMessageReceived);
        this.isBLEActive = false;
        this.isSocketActive = false;
        this.initConnections();
    }

    initConnections() {
        const websocketURL = process.env.NEXT_PUBLIC_WS_URL;

        this.webrtcService = new WebRTCService(this.onMessageReceived);
        this.webrtcService.connect(websocketURL, uuidv4());

        this.bleService
            .connect()
            .then(() => {
                this.isBLEActive = true;
                console.log("BLE connected");
            })
            .catch((err) => console.error("BLE connection error:", err));
    }

    sendMessage(message) {
        if (
            this.webrtcService &&
            this.webrtcService.channel &&
            this.webrtcService.channel.readyState === "open"
        ) {
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
    }
}

export default DualService;
