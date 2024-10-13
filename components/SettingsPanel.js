
                import React from 'react';
                const SettingsPanel = ({ onSettingsChange }) => {
                    const handleFontSizeChange = (e) => onSettingsChange({ fontSize: e.target.value });
                    return <><label>Font Size</label><input type="range" min="12" max="72" onChange={handleFontSizeChange} /></>;
                };
                export default SettingsPanel;
            