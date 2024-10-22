import React from "react";
import { TypeAnimation } from "react-type-animation";
import { AntComponents } from "../antComponents/AntComponents";

const TextDisplay = ({
    animationType,
    backgroundColor,
    color,
    fontSize = 72,
    fontFamily = "Arial",
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
        fontFamily,
    };

    const getAnimationContent = () => {
        switch (animationType) {
            case "scroll":
                return (
                    <div style={{ overflow: 'hidden', height: containerHeight }}>
                        <div
                            style={{
                                animation: `scroll-up ${speed * 5}s linear`,
                                animationFillMode: 'forwards',
                            }}
                        >
                            {text}
                        </div>
                    </div>
                );
            case "typing":
                return (
                    <TypeAnimation
                        cursor={false}
                        key={text}
                        sequence={[text, speed]}
                        speed={Math.max(speed, 50)}
                    />
                );
            case "fade-in":
                return (
                    <div
                        style={{
                            animation: `fade-in ${Math.max(speed, 2)}s ease-in-out`,
                            animationFillMode: 'forwards',
                        }}
                    >
                        {text}
                    </div>
                );
            case "slide-in":
                return (
                    <div
                        style={{
                            animation: `slide-in ${Math.max(speed, 2)}s ease-in-out`,
                            animationFillMode: 'forwards',
                        }}
                    >
                        {text}
                    </div>
                );
            default:
                return <div>{text}</div>; // No animation
        }
    };

    return (
        <AntComponents.Row className="text-display-row">
            <AntComponents.Col
                className="text-display-col"
                span={24}
                style={containerStyles}
            >
                {getAnimationContent()}
            </AntComponents.Col>
        </AntComponents.Row>
    );
};

export default TextDisplay;