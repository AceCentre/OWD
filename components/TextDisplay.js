import React from "react";
import { TypeAnimation } from "react-type-animation";
import { AntComponents } from "../antComponents/AntComponents";

const TextDisplay = ({
    animationType,
    backgroundColor,
    color,
    fontSize = 72,  // Set default font size to 72px
    fontFamily = "Arial",  // Default font family with customization support
    lines,
    speed,
    text,
}) => {
    const lineHeight = fontSize * 1.4;
    const containerHeight = lineHeight * lines;

    const containerStyles = {
        backgroundColor,
        color,
        fontSize,
        lineHeight: `${lineHeight}px`,
        maxHeight: `${containerHeight}px`,
        fontFamily,  // Apply font family for customization
    };

    return (
        <AntComponents.Row
            className="text-display-row"
            style={{
                containerStyles,
            }}
        >
            <AntComponents.Col
                className="text-display-col"
                span={24}
                style={containerStyles}
            >
                {animationType === "scroll" ? (
                    <marquee
                        behavior="scroll"
                        direction="up"
                        scrollamount={speed}
                    >
                        {text}
                    </marquee>
                ) : (
                    <TypeAnimation
                        cursor={false}
                        key={text}
                        sequence={[text, speed]}  // No repetition, animates once
                        speed={Math.max(speed, 50)}  // Adjust animation speed for slower effect
                    />
                )}
            </AntComponents.Col>
        </AntComponents.Row>
    );
};

export default TextDisplay;