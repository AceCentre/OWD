const SettingButton = ({ setShowSettings, isConnected, sessionId, connectionType }) => (
    <div className="settings-button-container">
        <div className="settings-button" onClick={() => setShowSettings(true)}>
            ⚙️ Settings
        </div>
        <div
            className="settings-session-id"
            style={{ color: isConnected ? "green" : "red" }}
        >
             {isConnected
                ? `● Session ID: ${sessionId} (${connectionType})`
                : `● Session ID: ${sessionId}`}
        </div>
    </div>
);

export default SettingButton;

