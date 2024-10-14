
        import React from 'react';
        import { TypeAnimation } from 'react-type-animation';

        const DisplayText = ({ text, fontSize, color, speed, lines }) => (
            <div id="display-container" style={{ fontSize, color, lineHeight: `${fontSize * 1.2}px`, overflow: 'hidden', maxHeight: `${fontSize * lines * 1.2}px` }}>
                <TypeAnimation
                    sequence={[text, speed, '']}
                    speed={speed}
                    repeat={Infinity}
                    cursor={false}
                />
            </div>
        );

        export default DisplayText;
    