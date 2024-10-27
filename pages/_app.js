import "antd/dist/reset.css";
import "../styles/globals.css";
import "../styles/receiver.css";
import "../styles/sender.css";
import App from "next/app";

function MyApp({ Component, pageProps }) {
    return <Component {...pageProps} />;
}

export default MyApp;
