import { TypeAnimation } from "react-type-animation";
import { AntComponents } from "../../antComponents/AntComponents";

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
                    <div
                        className="animation-scroll-container"
                        style={{ height: containerHeight }}
                    >
                        <div
                            className="animation-scroll"
                            style={{
                                animationDuration: `${speed / 3}s`,
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
                        sequence={[text]}
                        speed={2 * speed}
                    />
                );
            case "fade-in":
                return (
                    <div
                        className="animation-fade"
                        style={{
                            animationDuration: `${Math.max(speed, 2)}s`,
                        }}
                    >
                        {text}
                    </div>
                );
            case "slide-in":
                return (
                    <div
                        className="animation-slide"
                        style={{
                            animationDuration: `${Math.max(speed, 2)}s`,
                        }}
                    >
                        {text}
                    </div>
                );
            default:
                return <div>{text}</div>;
        }
    };

    return (
        <AntComponents.Row>
            <AntComponents.Col span={24} style={containerStyles}>
                {getAnimationContent()}
            </AntComponents.Col>
        </AntComponents.Row>
    );
};

export default TextDisplay;
