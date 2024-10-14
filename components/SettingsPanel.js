
        import React, { useState } from 'react';

        const SettingsPanel = ({ onSettingsChange }) => {
            const [fontSize, setFontSize] = useState(24);
            const [speed, setSpeed] = useState(50);
            const [color, setColor] = useState('#000000');
            const [lines, setLines] = useState(3);

            const handleUpdate = () => {
                onSettingsChange({ fontSize: `${fontSize}px`, color, speed, lines });
            };

            return (
                <div className="settings-panel">
                    <label>Font Size</label>
                    <input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />
                    
                    <label>Color</label>
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />

                    <label>Speed</label>
                    <input type="number" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />

                    <label>Lines</label>
                    <input type="number" value={lines} onChange={(e) => setLines(Number(e.target.value))} />

                    <button onClick={handleUpdate}>Apply</button>
                </div>
            );
        };

        export default SettingsPanel;
    