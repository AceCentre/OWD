import React, { useState } from "react";
import { AntComponents } from "../antComponents/AntComponents";

const SettingsPanel = ({ onSettingsChange, closeSettings, settings }) => {
    const [animationType, setAnimationType] = useState(settings.animationType);
    const [backgroundColor, setBackgroundColor] = useState(settings.backgroundColor);
    const [color, setColor] = useState(settings.color);
    const [fontSize, setFontSize] = useState(settings.fontSize);
    const [lines, setLines] = useState(settings.lines);
    const [speed, setSpeed] = useState(settings.speed);
    const [fontFamily, setFontFamily] = useState(settings.fontFamily || "Arial");

    const handleUpdate = () => {
        onSettingsChange({
            animationType,
            backgroundColor,
            color,
            fontSize,
            lines,
            speed,
            fontFamily,  // Pass the selected font family
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
            <AntComponents.Form layout="vertical">
                <AntComponents.Item label="Font Size">
                    <AntComponents.InputNumber
                        className="settings-input-number"
                        max={100}
                        min={10}
                        onChange={setFontSize}
                        placeholder="Select font size"
                        value={fontSize}
                    />
                </AntComponents.Item>

                <AntComponents.Item label="Font Style">
                    <AntComponents.Select
                        className="settings-select"
                        onChange={setFontFamily}
                        value={fontFamily}
                    >
                        <AntComponents.Option value="Arial">Arial (Default)</AntComponents.Option>
                        <AntComponents.Option value="Dancing Script">
                            Handwriting (Dancing Script)
                        </AntComponents.Option>
                        <AntComponents.Option value="Oswald">Bold Impact (Oswald)</AntComponents.Option>
                        <AntComponents.Option value="Balsamiq Sans">Cute (Balsamiq Sans)</AntComponents.Option>
                    </AntComponents.Select>
                </AntComponents.Item>

                <AntComponents.Item label="Color">
                    <AntComponents.Input
                        onChange={(e) => setColor(e.target.value)}
                        type="color"
                        value={color}
                    />
                </AntComponents.Item>

                <AntComponents.Item label="Background Color">
                    <AntComponents.Input
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        type="color"
                        value={backgroundColor}
                    />
                </AntComponents.Item>

                <AntComponents.Item label="Lines">
                    <AntComponents.InputNumber
                        className="settings-input-number"
                        max={53}
                        min={1}
                        onChange={setLines}
                        placeholder="Select lines"
                        value={lines}
                    />
                </AntComponents.Item>

                <AntComponents.Item label="Speed">
                    <AntComponents.InputNumber
                        className="settings-input-number"
                        max={50}
                        min={1}
                        onChange={setSpeed}
                        placeholder="Select speed"
                        value={speed}
                    />
                </AntComponents.Item>

                <AntComponents.Item label="Animation Type">
                    <AntComponents.Select
                        className="settings-select"
                        onChange={setAnimationType}
                        value={animationType}
                    >
                        <AntComponents.Option value="none">None</AntComponents.Option>
                        <AntComponents.Option value="typing">Typing</AntComponents.Option>
                        <AntComponents.Option value="scroll">Scrolling</AntComponents.Option>
                        <AntComponents.Option value="fade-in">Fade In</AntComponents.Option>
                        <AntComponents.Option value="slide-in">Slide In</AntComponents.Option>
                    </AntComponents.Select>
                </AntComponents.Item>
            </AntComponents.Form>
        </AntComponents.Modal>
    );
};

export default SettingsPanel;