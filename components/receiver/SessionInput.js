import { AntComponents } from "../../antComponents/AntComponents";

const SessionInput = ({ sessionId, handleSessionIdChange }) => (
    <AntComponents.Flex
        className="session-id-container"
        justify="center"
        align="center"
        gap="small"
        vertical={true}
    >
        <AntComponents.Input
            className="session-id-input"
            placeholder="Enter the 3-word session ID"
            value={sessionId}
            onChange={handleSessionIdChange}
        />
        <AntComponents.Button
            className="session-connect-button"
            disabled
            type="primary"
        >
            Connect
        </AntComponents.Button>
    </AntComponents.Flex>
);

export default SessionInput;
