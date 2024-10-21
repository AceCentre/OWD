import React, { useState, useEffect, useRef } from "react";
import { TypeAnimation } from "react-type-animation";
import { AntComponents } from "../antComponents/AntComponents";

const TextDisplay = ({
    animationType,
    backgroundColor,
    color,
    fontSize,
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
                        repeat={Infinity}
                        sequence={[text, speed, ""]}
                        speed={speed}
                    />
                )}
            </AntComponents.Col>
        </AntComponents.Row>
    );
};

export default TextDisplay;
