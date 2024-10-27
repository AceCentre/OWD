import { AntComponents } from "../../antComponents/AntComponents";

const SessionInput = ({ sessionId, handleSessionIdChange, handleConnect }) => (
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
            disabled={!sessionId}
            onClick={handleConnect}
            type="primary"
        >
            Connect
        </AntComponents.Button>
    </AntComponents.Flex>
);

export default SessionInput;
