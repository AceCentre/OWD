import { useState } from "react";
import { AntComponents } from "../../antComponents/AntComponents";
import TextDisplay from "./TextDisplay";

const SettingsPanel = ({ onSettingsChange, closeSettings, settings }) => {
    const [activeTab, setActiveTab] = useState("display");
    const [animationType, setAnimationType] = useState(settings.animationType);
    const [backgroundColor, setBackgroundColor] = useState(settings.backgroundColor);
    const [color, setColor] = useState(settings.color);
    const [fontSize, setFontSize] = useState(settings.fontSize);
    const [lines, setLines] = useState(settings.lines);
    const [speed, setSpeed] = useState(settings.speed);
    const [fontFamily, setFontFamily] = useState(settings.fontFamily || "Arial");
    const [notificationStatus, setNotificationStatus] = useState(
        typeof Notification !== "undefined" ? Notification.permission : "unsupported"
    );

    const handleEnableNotifications = () => {
        if (typeof Notification === "undefined") {
            setNotificationStatus("unsupported");
            console.warn("Notifications API not supported on this browser.");
            return;
        }

        if (Notification.permission === "default") {
            Notification.requestPermission()
                .then((permission) => {
                    setNotificationStatus(permission);
                    if (permission === "granted") {
                        console.log("Notifications enabled.");
                    } else if (permission === "denied") {
                        console.log("Notifications denied.");
                    }
                })
                .catch((error) => {
                    console.error("Notification permission request failed:", error);
                });
        }
    };

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

    // Define the tab items array
    const tabItems = [
        {
            key: "display",
            label: "Display Settings",
            children: (
                <AntComponents.Form layout="vertical">
                    <AntComponents.Item label="Font Size" className="settings-item">
                        <AntComponents.InputNumber
                            max={100}
                            min={10}
                            onChange={setFontSize}
                            placeholder="Select font size"
                            value={fontSize}
                        />
                    </AntComponents.Item>
                    <AntComponents.Item label="Font Style" className="settings-item">
                        <AntComponents.Select onChange={setFontFamily} value={fontFamily}>
                            <AntComponents.Option value="Arial">Arial (Default)</AntComponents.Option>
                            <AntComponents.Option value="Dancing Script">Handwriting (Dancing Script)</AntComponents.Option>
                            <AntComponents.Option value="Oswald">Bold Impact (Oswald)</AntComponents.Option>
                            <AntComponents.Option value="Permanent Marker">Marker (Permanent Marker)</AntComponents.Option>
                        </AntComponents.Select>
                    </AntComponents.Item>
                    <AntComponents.Item label="Color" className="settings-item">
                        <AntComponents.Input type="color" onChange={(e) => setColor(e.target.value)} value={color} />
                    </AntComponents.Item>
                    <AntComponents.Item label="Background Color" className="settings-item">
                        <AntComponents.Input type="color" onChange={(e) => setBackgroundColor(e.target.value)} value={backgroundColor} />
                    </AntComponents.Item>
                </AntComponents.Form>
            ),
        },
        {
            key: "animation",
            label: "Animation Settings",
            children: (
                <AntComponents.Form layout="vertical">
                    <AntComponents.Item label="Lines" className="settings-item">
                        <AntComponents.InputNumber max={53} min={1} onChange={setLines} placeholder="Select lines" value={lines} />
                    </AntComponents.Item>
                    <AntComponents.Item label="Speed" className="settings-item">
                        <AntComponents.InputNumber max={50} min={1} onChange={setSpeed} placeholder="Select speed" value={speed} />
                    </AntComponents.Item>
                    <AntComponents.Item label="Animation Type" className="settings-item">
                        <AntComponents.Select onChange={setAnimationType} value={animationType}>
                            <AntComponents.Option value="none">None</AntComponents.Option>
                            <AntComponents.Option value="typing">Typing</AntComponents.Option>
                            <AntComponents.Option value="scroll">Scrolling</AntComponents.Option>
                            <AntComponents.Option value="fade-in">Fade In</AntComponents.Option>
                            <AntComponents.Option value="slide-in">Slide In</AntComponents.Option>
                        </AntComponents.Select>
                    </AntComponents.Item>
                </AntComponents.Form>
            ),
        },
        {
            key: "usersettings",
            label: "Notification Settings",
            children: (
                <AntComponents.Button
                    type="default"
                    onClick={handleEnableNotifications}
                    style={{ marginTop: "20px" }}
                    disabled={notificationStatus === "granted" || notificationStatus === "denied"}
                >
                    {notificationStatus === "granted"
                        ? "Notifications are enabled"
                        : notificationStatus === "denied"
                            ? "Enable notifications in browser settings"
                            : "Enable Notifications"}
                </AntComponents.Button>
            ),

        }
    ];

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
            <AntComponents.Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
            {activeTab !== "usersettings" && (
                <>
                    <h4>Preview</h4>
                    <div className="settings-preview" style={{ height: fontSize * 1.4 * lines }}>
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
                </>
            )}
        </AntComponents.Modal>
    );
};

export default SettingsPanel;