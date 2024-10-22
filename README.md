# OWD - Open Wireless Display

Open Wireless Display (OWD) is a cross-platform AAC (Augmentative and Alternative Communication) display app built using Next.js. It leverages **WebRTC** for real-time communication and **BLE** (Bluetooth Low Energy) for short-range connectivity. The app includes a QR code feature for device pairing and supports dual connectivity modes (WebRTC over Wi-Fi or BLE) for sending messages from one device (sender) to another (display).


## Access the App

- **App URL:** [https://owd.acecentre.net/](https://owd.acecentre.net/)
- **Sender Demo:** [https://owd.acecentre.net/sender](https://owd.acecentre.net/sender)

## Core Purpose

OWD is designed to provide a flexible and customizable AAC display. It allows sender devices to communicate text messages to a paired display device in real time. The display application provides a visually engaging, fullscreen, animated display of the text, making it ideal for communication devices. The display also includes customizable font size, color, and animation styles.

### Key Capabilities
- **Real-Time Communication**: Communicate text via WebRTC or BLE in real time.
- **Customizable Display**: Configure the font, color, and animations on the display screen.
- **QR Code Pairing**: Easy device pairing via QR code.
- **Typing Indicator**: Show "Typing..." animations when text is being entered but not yet sent.
- **Offline Support**: Caches essential files for offline use in Progressive Web App (PWA) environments.

## Features

- **Cross-Platform Compatibility**: Works seamlessly across desktops, tablets, and mobile devices.
- **Dual Connectivity**: Supports both WebRTC (for Wi-Fi connectivity) and BLE (for short-range communication).
- **Configurable Display**: Customize font styles, colors, animations, and font sizes on the display device.
- **QR Code Pairing**: Generate and scan QR codes for pairing sender and display devices.
- **Typing Indicator**: Provides real-time feedback when text is being entered on the sender device before the message is sent.
- **Service Worker**: Caches essential files for offline use in Progressive Web App (PWA) environments.

## Prerequisites

- **Node.js** >= 20.9.0
- **npm** (comes bundled with Node.js)

## Getting Started

1. **Clone the Repository**:

    ```bash
    git clone https://github.com/acecentre/owd.git
    cd owd
    ```

2. **Install Dependencies**:

    ```bash
    npm install
    ```

3. **Run the Development Server**:

    ```bash
    npm run dev
    ```

4. **View the App**:

    Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

5. **Build for Production**:

    ```bash
    npm run build
    ```

6. **Start the Production Server**:

    ```bash
    npm start
    ```

## Project Structure

```plaintext
owd/
├── components/
│   ├── DisplayText.js       # Component for displaying animated text
│   ├── SettingsPanel.js     # Configurable settings panel for the display
│   └── QRCodeDisplay.js     # QR code generator for pairing devices
├── pages/
│   ├── index.js             # Main display page showing AAC messages
│   ├── sender.js            # Sender page for sending text messages to the display
│   └── api/
│       └── signaling.js     # WebRTC signaling server for message exchange
├── public/
│   ├── manifest.json        # PWA manifest for offline capabilities
│   └── service-worker.js    # Service worker script for caching and offline usage
├── services/
│   ├── WebRTCService.js     # Manages WebRTC connections and messaging
│   ├── SocketService.js     # WebSocket management for signaling
│   └── BLEService.js        # Handles BLE connections for short-range messaging
└── package.json             # Project metadata and dependencies
```

## Sender App Development

If you want to create a custom **sender app** that can communicate with the OWD display (using either WebRTC or BLE), here’s a general approach for platforms like **Swift** (iOS) or **React Native**.

### WebRTC-Based Sender App

For platforms that support WebRTC (like **React Native** or **iOS** via libraries), you can create a sender app that communicates with the OWD WebRTC signaling server.

#### 1. **Connect to WebRTC Signaling Server**
   - **React Native**: Use libraries like `react-native-webrtc` to handle the WebRTC connection.
   - **Swift (iOS)**: Use Apple's native WebRTC library or `WebRTC.framework` to establish a connection.

#### WebRTC Sender Flow:
1. **Establish WebRTC connection** using the OWD signaling server.
2. **Generate a session ID** or **scan a QR code** to pair with the display app.
3. **Send messages** using the data channel (WebRTC).

Example (React Native WebRTC pseudo-code):

```js
import { RTCPeerConnection } from 'react-native-webrtc';

// Establish WebRTC connection
const peerConnection = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
});

// Send message to display device
const sendMessage = (message) => {
  if (peerConnection.dataChannel.readyState === 'open') {
    peerConnection.dataChannel.send(message);
  }
};

// Handle message typing
const handleTyping = () => {
  sendMessage('Typing...');
};

// Send final message when ready
sendMessage('Hello, this is a message!');
```

### BLE-Based Sender App

For short-range communication, your sender app can use BLE to send text data to the display.

#### BLE Sender Flow:
1. **Scan for BLE devices** supporting the OWD service.
2. **Connect** to the BLE service using the appropriate UUID.
3. **Send text messages** to the connected device using BLE.

Example (React Native BLE pseudo-code using `react-native-ble-manager`):

```js
import BleManager from 'react-native-ble-manager';

// Connect to BLE device and send message
BleManager.connect(deviceId).then(() => {
  // Send a message via BLE
  BleManager.write(deviceId, serviceUUID, characteristicUUID, message);
});

// Notify display when typing
BleManager.write(deviceId, serviceUUID, characteristicUUID, 'Typing...');
```

#### BLE with Swift (iOS):
If you're developing a native iOS app in **Swift**, you'll need to use **CoreBluetooth** to handle BLE connections and data transmission.

### Sender App Steps for Both Platforms:

1. **Pair with the Display**: Use the session ID or QR code to pair the sender with the display.
2. **Handle Typing**: Send a "Typing..." notification to the display when the user is typing (before sending the actual message).
3. **Send Messages**: After typing, the user can press a button to send the full message, which will be displayed on the paired OWD display.
4. **Dual Connectivity**: You can integrate both WebRTC and BLE in a single sender app for more robust connectivity. The app can switch between BLE and WebRTC based on availability.

## Deploying OWD

To deploy the OWD app to a platform like **Heroku** or **DigitalOcean**, follow these steps:

1. Set up the environment variables for WebRTC signaling and BLE configuration (if applicable).
2. Define a custom **build command** for your deployment:
   
   ```bash
   npm run build
   ```

3. Ensure your production server starts correctly with:

   ```bash
   npm start
   ```

## Writing a Sender App for Other Platforms

To create your own sender app (e.g., in **React Native** or **Swift**), use WebRTC or BLE to pair and send messages to the OWD display. The core logic involves:

- **Pairing**: Generate or scan the session ID using a QR code.
- **Connecting**: Use WebRTC or BLE for connectivity.
- **Sending Messages**: Transmit text to the display in real-time.
- **Custom UI**: Adapt the sender app UI to suit your platform's design guidelines (i.e., React Native’s UI components or Swift’s UIKit).

## License

This project is licensed under the MIT License.

## Author

Created by Will Wade.
