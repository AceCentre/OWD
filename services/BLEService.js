class BLEService {
    constructor(onMessageReceived) {
        this.onMessageReceived = onMessageReceived;
        this.device = null;
        this.characteristic = null;
    }

    async connect() {
        try {
            this.device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ["1234"] }],
            });
            const server = await this.device.gatt.connect();
            const service = await server.getPrimaryService("5678");
            this.characteristic = await service.getCharacteristic("1234");
            await this.characteristic.startNotifications();
            this.characteristic.addEventListener(
                "characteristicvaluechanged",
                this.handleCharacteristicValueChanged.bind(this)
            );
        } catch (error) {
            console.error("BLE connection failed", error);
        }
    }

    handleCharacteristicValueChanged(event) {
        const value = new TextDecoder().decode(event.target.value);
        this.onMessageReceived(value);
    }

    async sendMessage(message) {
        if (this.characteristic) {
            const encoder = new TextEncoder();
            const data = encoder.encode(message);
            await this.characteristic.writeValue(data);
        }
    }
}

export default BLEService;
