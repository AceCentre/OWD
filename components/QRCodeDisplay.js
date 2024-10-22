import { QRCodeCanvas } from "qrcode.react";
import { AntComponents } from "../antComponents/AntComponents";

const QRCodeDisplay = ({ sessionId, size = 128 }) => {
    const displayURL = `${process.env.NEXT_PUBLIC_BASE_URL}/sender?sessionId=${sessionId}`;

    return (
        <AntComponents.Card className="qr-code">
            <AntComponents.Flex align="center" vertical="true">
                <QRCodeCanvas value={displayURL} size={size} className="qr-code-img" /> {/* Set the size dynamically */}
                <AntComponents.Paragraph>
                    Session ID: {sessionId}
                </AntComponents.Paragraph>
            </AntComponents.Flex>
        </AntComponents.Card>
    );
};

export default QRCodeDisplay;