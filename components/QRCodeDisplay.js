import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QRCodeDisplay = ({ websocketURL }) => (
    <div className="qr-code">
        <QRCodeCanvas value={websocketURL} />
    </div>
);

export default QRCodeDisplay;