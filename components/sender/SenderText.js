import { AntComponents } from "../../antComponents/AntComponents";

const SenderText = ({
    isConnected,
    setIsLiveTyping,
    isLiveTyping,
    handleTyping,
    message,
    sendMessage,
}) => (
    <AntComponents.Flex align="center" vertical="true" gap="middle">
        <AntComponents.Input
            className="sender-text-input"
            disabled={!isConnected}
            onChange={handleTyping}
            placeholder="Type a message"
            type="text"
            value={message}
        />
        <AntComponents.Flex
            justify="space-between"
            className="sender-button-group"
        >
            <AntComponents.Checkbox
                className="sender-live-checkbox"
                onChange={(e) => setIsLiveTyping(e.target.checked)}
                disabled={!isConnected}
            >
                Enable Live Typing
            </AntComponents.Checkbox>
            <AntComponents.Button
                className="sender-text-button"
                disabled={!isConnected || !message.trim() || isLiveTyping}
                onClick={sendMessage}
                type="primary"
            >
                Send Message
            </AntComponents.Button>
        </AntComponents.Flex>
    </AntComponents.Flex>
);

export default SenderText;
