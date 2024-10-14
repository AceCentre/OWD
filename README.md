# OWD
Open Wireless display using webrtc 

This project is a cross-platform AAC (Augmentative and Alternative Communication) display app using Next.js. It includes WebRTC for real-time communication, BLE (Bluetooth Low Energy) support, and a QR code feature for device pairing.

## Features

- **Cross-Platform**: Works across devices including desktops, tablets, and mobile devices.
- **WebRTC and BLE Support**: Provides dual connectivity options for real-time communication.
- **Customizable Display**: Allows configuration of font size, color, and animation styles.
- **QR Code Pairing**: Generates QR codes to easily pair devices with the WebRTC server.
- **Offline Support**: Caches essential files for offline usage with a service worker.

## Prerequisites

- **Node.js** >= 20.9.0
- **npm** (usually bundled with Node.js)

## Getting Started

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/acecentre/owd.git
   cd owd
   ```

2.	Install Dependencies:

    npm install


3.	Run the Development Server:

    npm run dev

Open http://localhost:3000 to view the app.

4.	Build for Production:

    npm run build


5.	Start Production Server:

    npm start

## Project Structure

```
   owd/
   ├── components/
   │   ├── DisplayText.js       # Text display component with custom styles
   │   ├── SettingsPanel.js     # Settings panel for configuring display options
   │   └── QRCodeDisplay.js     # QR code generator for pairing
   ├── pages/
   │   ├── index.js             # Main page displaying the AAC text
   │   ├── sender.js            # Page for sending text messages
   │   └── api/
   │       └── signaling.js     # WebSocket signaling server for WebRTC
   ├── public/
   │   ├── manifest.json        # Web app manifest for PWA setup
   │   └── service-worker.js    # Service worker for offline support
   ├── services/
   │   ├── WebRTCService.js     # WebRTC connection management
   │   ├── SocketService.js     # WebSocket management
   │   └── BLEService.js        # BLE connection management
   └── package.json             # Project metadata and dependencies
```

## Deployment

To deploy this app to a platform like Heroku or DigitalOcean, ensure you have:

	•	The engines field in package.json to specify Node.js version.
	•	A custom build command in your deployment settings:


    npm run build



## License

This project is licensed under the MIT License.

## Author

Created by Will Wade.

