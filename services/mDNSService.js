let bonjour;

if (typeof window === "undefined") {
    bonjour = require("bonjour")();
}

class mDNSService {
    constructor(role, onPeerDiscovered) {

        if (typeof window !== "undefined") {
            throw new Error("mDNSService can only be used on the server side.");
        }

        this.role = role; // 'sender' or 'display'
        this.service = null;
        this.onPeerDiscovered = onPeerDiscovered; // Callback for when a peer is discovered
    }

    startAdvertising(name) {
        if (!bonjour) {
            throw new Error("Bonjour is not initialized.");
        }

        this.service = bonjour.publish({
            name: `${name}-${this.role}`,
            type: 'webrtc',
            port: 3000, // Port for WebRTC signaling
            txt: { role: this.role },
        });
        console.log(`${this.role} advertising as ${name}-${this.role}`);
    }

    discoverPeers() {
        if (!bonjour) {
            throw new Error("Bonjour is not initialized.");
        }
        
        bonjour.find({ type: 'webrtc' }, (service) => {
            const { name, txt } = service;
            if (txt.role && txt.role !== this.role) {
                console.log(`Discovered ${txt.role}: ${name}`);
                this.onPeerDiscovered(name, txt.role);
            }
        });
    }

    stopAdvertising() {
        if (this.service) this.service.stop();
        bonjour.destroy();
    }
}

export default mDNSService;