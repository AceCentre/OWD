import { QRCodeCanvas } from "qrcode.react";

const QRCodeDisplay = ({ sessionId }) => {
    const displayURL = `${process.env.NEXT_PUBLIC_BASE_URL}/sender?sessionId=${sessionId}`;

    return (
        <div className="qr-code">
            <QRCodeCanvas value={displayURL} />
        </div>
    );
};

export default QRCodeDisplay;
