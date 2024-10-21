import { QRCodeCanvas } from "qrcode.react";
import { AntComponents } from "../antComponents/AntComponents";

const QRCodeDisplay = ({ sessionId }) => {
    const displayURL = `${process.env.NEXT_PUBLIC_BASE_URL}/sender?sessionId=${sessionId}`;

    return (
        <AntComponents.Card className="qr-code">
            <AntComponents.Flex align="center" vertical="true">
                <AntComponents.Title level={2} className="qr-code-header">
                    Open Wireless Display
                </AntComponents.Title>
                <QRCodeCanvas value={displayURL} size={256} className="qr-code-img" />
                <AntComponents.Paragraph>
                    Scan this QR code to connect.
                </AntComponents.Paragraph>
                <AntComponents.Paragraph>
                    Session ID: {sessionId}
                </AntComponents.Paragraph>
            </AntComponents.Flex>
        </AntComponents.Card>
    );
};

export default QRCodeDisplay;
