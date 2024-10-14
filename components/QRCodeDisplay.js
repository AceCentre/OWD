
        import React from 'react';
        import QRCode from 'qrcode.react';
        //import { QRCode } from 'qrcode.react';
       // import { QRCodeCanvas } from 'qrcode.react';

        const QRCodeDisplay = ({ websocketURL }) => (
            <div className="qr-code">
                <QRCode value={websocketURL} />
            </div>
        );

        export default QRCodeDisplay;
    