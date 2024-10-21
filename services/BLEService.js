class BLEService {
    constructor(onMessageReceived) {
        this.device = null;
        this.characteristic = null;
        this.isConnected = false;
        this.onMessageReceived = onMessageReceived;
        this.server = null;
    }

    isBluetoothSupported() {
        return navigator.bluetooth !== undefined;
    }

    async connect() {
        if (!this.isBluetoothSupported()) {
            console.error(
                "Web Bluetooth API is not supported in this browser."
            );
            return;
        }

        try {
            this.device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ["1234"] }],
                optionalServices: ["5678"],
            });

            this.device.addEventListener(
                "gattserverdisconnected",
                this.handleDisconnection.bind(this)
            );

            this.server = await this.device.gatt.connect();
            const service = await this.server.getPrimaryService("5678");
            this.characteristic = await service.getCharacteristic("1234");

            await this.characteristic.startNotifications();
            this.boundHandleCharacteristicValueChanged =
                this.handleCharacteristicValueChanged.bind(this);
            this.characteristic.addEventListener(
                "characteristicvaluechanged",
                this.boundHandleCharacteristicValueChanged
            );

            this.isConnected = true;
            this.dispatchEvent("connected");
        } catch (error) {
            console.error("BLE connection failed", error);
            this.dispatchEvent("connectionfailed", error);
        }
    }

    handleCharacteristicValueChanged(event) {
        const value = new TextDecoder().decode(event.target.value);
        this.onMessageReceived(value);
    }

    async sendMessage(message) {
        if (this.characteristic) {
            try {
                const encoder = new TextEncoder();
                const data = encoder.encode(message);
                await this.characteristic.writeValue(data);
            } catch (error) {
                console.error("Failed to send message:", error);
            }
        } else {
            console.warn("No BLE characteristic available to send message.");
        }
    }

    async disconnect() {
        if (this.characteristic) {
            try {
                await this.characteristic.stopNotifications();
                this.characteristic.removeEventListener(
                    "characteristicvaluechanged",
                    this.boundHandleCharacteristicValueChanged
                );
            } catch (error) {
                console.error("Failed to stop notifications:", error);
            }
        }

        if (this.device && this.device.gatt.connected) {
            this.device.gatt.disconnect();
        }

        this.isConnected = false;
        this.dispatchEvent("disconnected");
    }

    handleDisconnection() {
        console.warn("Device disconnected");
        this.isConnected = false;
        this.dispatchEvent("disconnected");
    }

    dispatchEvent(eventName, detail = {}) {
        document.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
}

export default BLEService;
