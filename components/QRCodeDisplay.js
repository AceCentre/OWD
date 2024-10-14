
                import React from 'react'
                import { QRCode } from 'qrcode.react';

                const QRCodeDisplay = ({ websocketURL }) => (
                    <div>
                        <QRCode value={websocketURL} size={200} />
                        <p>Scan to connect</p>
                    </div>
                );

                export default QRCodeDisplay;
            