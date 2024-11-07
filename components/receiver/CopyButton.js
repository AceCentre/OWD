import { AntComponents } from "../../antComponents/AntComponents";

const CopyButton = ({ onCopy, isConnected }) => (
    <div className="settings-button" onClick={onCopy}>
        <AntComponents.CopyOutlined /> Copy
    </div>
);

export default CopyButton;