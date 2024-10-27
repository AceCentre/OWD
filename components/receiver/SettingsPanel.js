import { useState } from "react";
import { AntComponents } from "../../antComponents/AntComponents";
import TextDisplay from "./TextDisplay";

const SettingsPanel = ({ onSettingsChange, closeSettings, settings }) => {
    const [activeTab, setActiveTab] = useState("display");
    const [animationType, setAnimationType] = useState(settings.animationType);
    const [backgroundColor, setBackgroundColor] = useState(
        settings.backgroundColor
    );
    const [color, setColor] = useState(settings.color);
    const [fontSize, setFontSize] = useState(settings.fontSize);
    const [lines, setLines] = useState(settings.lines);
    const [speed, setSpeed] = useState(settings.speed);
    const [fontFamily, setFontFamily] = useState(
        settings.fontFamily || "Arial"
    );

    const handleUpdate = () => {
        onSettingsChange({
            animationType,
            backgroundColor,
            color,
            fontSize,
            lines,
            speed,
            fontFamily,
        });
        closeSettings();
    };

    return (
        <AntComponents.Modal
            open={true}
            title={<h3>Settings</h3>}
            footer={
                <AntComponents.Button type="primary" onClick={handleUpdate}>
                    Apply
                </AntComponents.Button>
            }
            onCancel={closeSettings}
        >
            <AntComponents.Tabs activeKey={activeTab} onChange={setActiveTab}>
                <AntComponents.TabPane tab="Display Settings" key="display">
                    <AntComponents.Form layout="vertical">
                        <AntComponents.Item
                            label="Font Size"
                            className="settings-item"
                            tooltip="Adjust the font size for display text."
                        >
                            <AntComponents.InputNumber
                                className="settings-input-number"
                                max={100}
                                min={10}
                                onChange={setFontSize}
                                placeholder="Select font size"
                                value={fontSize}
                            />
                        </AntComponents.Item>

                        <AntComponents.Item
                            label="Font Style"
                            className="settings-item"
                            tooltip="Adjust the font style for display text."
                        >
                            <AntComponents.Select
                                className="settings-select"
                                onChange={setFontFamily}
                                value={fontFamily}
                            >
                                <AntComponents.Option value="Arial">
                                    Arial (Default)
                                </AntComponents.Option>
                                <AntComponents.Option value="Dancing Script">
                                    Handwriting (Dancing Script)
                                </AntComponents.Option>
                                <AntComponents.Option value="Oswald">
                                    Bold Impact (Oswald)
                                </AntComponents.Option>
                                <AntComponents.Option value="Permanent Marker">
                                    Marker (Permanent Marker)
                                </AntComponents.Option>
                            </AntComponents.Select>
                        </AntComponents.Item>

                        <AntComponents.Item
                            label="Color"
                            className="settings-item"
                            tooltip="Adjust the text color for display text."
                        >
                            <AntComponents.Input
                                onChange={(e) => setColor(e.target.value)}
                                type="color"
                                value={color}
                            />
                        </AntComponents.Item>

                        <AntComponents.Item
                            label="Background Color"
                            className="settings-item"
                            tooltip="Adjust the background color for display text."
                        >
                            <AntComponents.Input
                                onChange={(e) =>
                                    setBackgroundColor(e.target.value)
                                }
                                type="color"
                                value={backgroundColor}
                            />
                        </AntComponents.Item>
                    </AntComponents.Form>
                </AntComponents.TabPane>

                <AntComponents.TabPane tab="Animation Settings" key="animation">
                    <AntComponents.Form layout="vertical">
                        <AntComponents.Item
                            label="Lines"
                            className="settings-item"
                            tooltip="Choose the number of text lines displayed."
                        >
                            <AntComponents.InputNumber
                                className="settings-input-number"
                                max={53}
                                min={1}
                                onChange={setLines}
                                placeholder="Select lines"
                                value={lines}
                            />
                        </AntComponents.Item>

                        <AntComponents.Item
                            label="Speed"
                            className="settings-item"
                            tooltip="Set the animation speed."
                        >
                            <AntComponents.InputNumber
                                className="settings-input-number"
                                max={50}
                                min={1}
                                onChange={setSpeed}
                                placeholder="Select speed"
                                value={speed}
                            />
                        </AntComponents.Item>

                        <AntComponents.Item
                            label="Animation Type"
                            className="settings-item"
                            tooltip="Set the animation type."
                        >
                            <AntComponents.Select
                                className="settings-select"
                                onChange={setAnimationType}
                                value={animationType}
                            >
                                <AntComponents.Option value="none">
                                    None
                                </AntComponents.Option>
                                <AntComponents.Option value="typing">
                                    Typing
                                </AntComponents.Option>
                                <AntComponents.Option value="scroll">
                                    Scrolling
                                </AntComponents.Option>
                                <AntComponents.Option value="fade-in">
                                    Fade In
                                </AntComponents.Option>
                                <AntComponents.Option value="slide-in">
                                    Slide In
                                </AntComponents.Option>
                            </AntComponents.Select>
                        </AntComponents.Item>
                    </AntComponents.Form>
                </AntComponents.TabPane>
            </AntComponents.Tabs>

            <h4>Preview</h4>
            <div
                className="settings-preview"
                style={{ height: fontSize * 1.4 * lines }}
            >
                <TextDisplay
                    text="This is a live preview"
                    animationType={animationType}
                    backgroundColor={backgroundColor}
                    color={color}
                    fontSize={fontSize}
                    fontFamily={fontFamily}
                    lines={lines}
                    speed={speed}
                />
            </div>
        </AntComponents.Modal>
    );
};

export default SettingsPanel;
